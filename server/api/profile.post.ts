// ...existing code...
import { H3Event } from 'h3'
import { createClient } from '@supabase/supabase-js'

// Supabase の Service Role キーは必ずサーバー側の環境変数に配置すること
const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('[API] Supabase env vars not set: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
})

export default defineEventHandler(async (event: H3Event) => {
  try {
    const body = await readBody(event)

    // ボディの存在確認
    if (body == null) {
      console.warn('[API] /api/profile POST empty body received (null/undefined)')
      event.res.statusCode = 400
      return { error: 'empty_body' }
    }

    // ボディが空オブジェクトかどうかを安全に判定
    const isEmptyObject = typeof body === 'object' && !Array.isArray(body) && Object.keys(body || {}).length === 0
    if (isEmptyObject) {
      console.warn('[API] /api/profile POST empty body received (empty object)')
      event.res.statusCode = 400
      return { error: 'empty_body' }
    }

    // 期待するペイロードの抜粋バリデーション（最小限）
    const payload = typeof body === 'object' ? body as any : null
    if (!payload) {
      event.res.statusCode = 400
      return { error: 'invalid_payload' }
    }

    // フロントから送られてくる形式に合わせて変換
    // 空文字列をnullに変換するヘルパー関数
    const toNullIfEmpty = (value: any) => {
      if (value === '' || value === undefined) return null
      return value
    }

    const profileRow = {
      user_id: payload.user_id || null,
      email: payload.email || null,
      username: payload.username || null,
      major: toNullIfEmpty(payload.major),
      gender: toNullIfEmpty(payload.gender),
      native_language: payload.native_language || '日本語',
      spoken_languages: Array.isArray(payload.spoken_languages) ? payload.spoken_languages : (payload.spoken_languages ? [payload.spoken_languages] : []),
      learning_languages: Array.isArray(payload.learning_languages) ? payload.learning_languages : (payload.learning_languages ? [payload.learning_languages] : []),
      residence: toNullIfEmpty(payload.residence),
      comment: toNullIfEmpty(payload.comment),
      last_updated: payload.last_updated || new Date().toISOString()
    }

    console.log('[API] /api/profile POST profileRow:', JSON.stringify(profileRow))

    // Supabase に挿入する
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      // env がなければ DB への挿入は行わない
      console.info('[API] Supabase not configured; skipping insert and returning received payload')
      return { status: 'ok', inserted: null, received: profileRow }
    }

    // 1. まず users テーブルに upsert を行う
    if (profileRow.user_id && profileRow.email && profileRow.username) {
      const userRow = {
        id: profileRow.user_id,
        email: profileRow.email,
        username: profileRow.username,
        is_oic_verified: false
      }

      console.log('[API] Upserting user to users table:', JSON.stringify(userRow))
      const { data: userData, error: userError } = await supabase
        .from('users')
        .upsert([userRow], { onConflict: 'id' })
        .select()

      if (userError) {
        console.error('[API] Failed to upsert user:', userError)
        event.res.statusCode = 500
        return { error: 'user_upsert_failed', details: userError }
      }

      console.log('[API] User upserted successfully:', userData)
    } else {
      console.warn('[API] Missing required fields for users table: user_id, email, or username')
      event.res.statusCode = 400
      return { error: 'missing_user_fields', required: ['user_id', 'email', 'username'] }
    }

    // 2. profiles テーブルに upsert を行う（nullの状態でも保存）
    // Supabase に挿入。もしスキーマに存在しないカラムのために失敗した場合は
    // エラーメッセージからカラム名を取り出して該当フィールドを削除し、再試行する。
    // 最大で 5 回までリトライする（安全策）。
    async function tryUpsertProfile(row: Record<string, any>) {
      for (let attempt = 0; attempt < 5; attempt++) {
        console.log(`[API] Attempting profile upsert (attempt ${attempt + 1}):`, JSON.stringify(row))
        
        const { data, error } = await supabase
          .from('profiles')
          .upsert([row], { onConflict: 'user_id' })
          .select()

        if (!error) {
          console.log('[API] Profile upsert successful:', JSON.stringify(data))
          return { data, error: null }
        }

        console.error(`[API] Profile upsert error (attempt ${attempt + 1}):`, JSON.stringify(error))

        // PostgREST のエラー PGRST204: "Could not find the 'email' column of 'profiles' in the schema cache"
        if (error && typeof error === 'object' && (error as any).code === 'PGRST204' && (error as any).message) {
          const msg: string = (error as any).message
          const m = msg.match(/Could not find the '(.+?)' column of 'profiles'/)
          if (m && m[1]) {
            const col = m[1]
            console.warn(`[API] Supabase upsert failed due to missing column '${col}'. Removing field and retrying (attempt ${attempt + 1}).`)
            delete row[col]
            continue // retry
          }
        }

        // ここまで来たらリトライの対象ではないエラー
        return { data: null, error }
      }

      return { data: null, error: { message: 'retry_limit_exceeded' } }
    }

    // profiles テーブル用のデータを準備
    // profiles テーブルのスキーマに合わせてフィールドを整理
    if (!profileRow.user_id) {
      console.error('[API] user_id is required for profiles table')
      event.res.statusCode = 400
      return { error: 'missing_user_id', message: 'user_id is required for profiles table' }
    }

    const profileData: Record<string, any> = {
      user_id: profileRow.user_id,
      major: profileRow.major,
      gender: profileRow.gender,
      native_language: profileRow.native_language || '日本語', // NOT NULL制約のためデフォルト値を設定
      spoken_languages: Array.isArray(profileRow.spoken_languages) && profileRow.spoken_languages.length > 0 
        ? profileRow.spoken_languages 
        : [],
      learning_languages: Array.isArray(profileRow.learning_languages) && profileRow.learning_languages.length > 0
        ? profileRow.learning_languages 
        : [],
      residence: profileRow.residence,
      comment: profileRow.comment,
      last_updated: profileRow.last_updated || new Date().toISOString()
    }

    console.log('[API] Upserting profile to profiles table:', JSON.stringify(profileData))
    console.log('[API] Profile data user_id:', profileData.user_id)

    const result = await tryUpsertProfile(profileData)
    if (result.error) {
      console.error('[API] Supabase profile upsert error after retries:', JSON.stringify(result.error))
      event.res.statusCode = 500
      return { 
        error: 'profile_upsert_failed', 
        details: result.error,
        message: result.error?.message || 'Failed to upsert profile'
      }
    }

    if (!result.data) {
      console.warn('[API] Profile upsert returned no data:', result)
      event.res.statusCode = 500
      return { 
        error: 'profile_upsert_no_data', 
        message: 'Profile upsert succeeded but no data returned'
      }
    }

    console.log('[API] Profile upserted successfully:', JSON.stringify(result.data))
    return { status: 'ok', inserted: result.data }
  } catch (err) {
    console.error('Error in /api/profile handler:', err)
    try {
      const stack = (err && typeof err === 'object' && 'stack' in err) ? (err as any).stack : null
      console.error(stack || err)
    } catch (_) {}
    event.res.statusCode = 500
    return { error: 'internal_server_error' }
  }
})
// ...existing code...