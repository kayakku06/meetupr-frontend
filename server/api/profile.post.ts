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
    const profileRow = {
      user_id: payload.user_id || null,
      email: payload.email || null,
      username: payload.username || null,
      major: payload.major || null,
      gender: payload.gender || null,
      native_language: payload.native_language || null,
      spoken_languages: Array.isArray(payload.spoken_languages) ? payload.spoken_languages : (payload.spoken_languages ? [payload.spoken_languages] : []),
      learning_languages: Array.isArray(payload.learning_languages) ? payload.learning_languages : (payload.learning_languages ? [payload.learning_languages] : []),
      residence: payload.residence || null,
      comment: payload.comment || null,
      interests: Array.isArray(payload.interests) ? payload.interests : [],
      last_updated: payload.last_updated || new Date().toISOString()
    }

    console.log('[API] /api/profile POST profileRow:', JSON.stringify(profileRow))

    // Supabase に挿入する
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      // env がなければ DB への挿入は行わない
      console.info('[API] Supabase not configured; skipping insert and returning received payload')
      return { status: 'ok', inserted: null, received: profileRow }
    }

    // Supabase に挿入。もしスキーマに存在しないカラムのために失敗した場合は
    // エラーメッセージからカラム名を取り出して該当フィールドを削除し、再試行する。
    // 最大で 5 回までリトライする（安全策）。
    async function tryInsert(row: Record<string, any>) {
      for (let attempt = 0; attempt < 5; attempt++) {
        const { data, error } = await supabase
          .from('profiles')
          .insert([row])
          .select()

        if (!error) return { data, error: null }

        // PostgREST のエラー PGRST204: "Could not find the 'email' column of 'profiles' in the schema cache"
        if (error && typeof error === 'object' && (error as any).code === 'PGRST204' && (error as any).message) {
          const msg: string = (error as any).message
          const m = msg.match(/Could not find the '(.+?)' column of 'profiles'/)
          if (m && m[1]) {
            const col = m[1]
            console.warn(`[API] Supabase insert failed due to missing column '${col}'. Removing field and retrying (attempt ${attempt + 1}).`)
            delete row[col]
            continue // retry
          }
        }

        // ここまで来たらリトライの対象ではないエラー
        return { data: null, error }
      }

      return { data: null, error: { message: 'retry_limit_exceeded' } }
    }

    // 挿入前に null/undefined のフィールドを削除しておく（スキーマにないカラムを送らないため）
    const cleanedRow: Record<string, any> = { ...profileRow }
    for (const k of Object.keys(cleanedRow)) {
      if (cleanedRow[k] === null || cleanedRow[k] === undefined) {
        delete cleanedRow[k]
      }
    }

    // spoken_languages / learning_languages が未定義なら空配列にしておく
    if (!('spoken_languages' in cleanedRow)) cleanedRow.spoken_languages = []
    if (!('learning_languages' in cleanedRow)) cleanedRow.learning_languages = []

    const result = await tryInsert(cleanedRow)
    if (result.error) {
      console.error('[API] Supabase insert error after retries:', result.error)
      event.res.statusCode = 500
      return { error: 'supabase_insert_failed', details: result.error }
    }

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