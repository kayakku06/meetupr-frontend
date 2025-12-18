import { H3Event } from 'h3'
import { createClient } from '@supabase/supabase-js'

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
    const query = getQuery(event)
    const userId = query.user_id as string

    if (!userId) {
      event.res.statusCode = 400
      return { error: 'user_id is required' }
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      event.res.statusCode = 500
      return { error: 'supabase_not_configured' }
    }

    // usersテーブルからusernameを取得
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('username')
      .eq('id', userId)
      .single()

    if (userError) {
      // ユーザーが存在しない場合
      if (userError.code === 'PGRST116') {
        event.res.statusCode = 404
        return { error: 'user_not_found' }
      }
      console.error('[API] Error fetching user:', userError)
      event.res.statusCode = 500
      return { error: 'user_fetch_failed', details: userError }
    }

    // profilesテーブルからプロフィール情報を取得
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('major, gender, native_language, spoken_languages, learning_languages, residence, comment, interests')
      .eq('user_id', userId)
      .single()

    if (profileError) {
      // プロフィールが存在しない場合
      if (profileError.code === 'PGRST116') {
        // プロフィールが存在しない場合は、usernameのみ返す
        return {
          username: userData?.username || null,
          major: null,
          gender: null,
          native_language: null,
          spoken_languages: [],
          learning_languages: [],
          residence: null,
          comment: null,
          interests: []
        }
      }
      console.error('[API] Error fetching profile:', profileError)
      event.res.statusCode = 500
      return { error: 'profile_fetch_failed', details: profileError }
    }

    // データを結合して返す
    return {
      username: userData?.username || null,
      major: profileData?.major || null,
      gender: profileData?.gender || null,
      native_language: profileData?.native_language || null,
      spoken_languages: Array.isArray(profileData?.spoken_languages) ? profileData.spoken_languages : [],
      learning_languages: Array.isArray(profileData?.learning_languages) ? profileData.learning_languages : [],
      residence: profileData?.residence || null,
      comment: profileData?.comment || null,
      interests: Array.isArray(profileData?.interests) ? profileData.interests : []
    }
  } catch (err) {
    console.error('Error in /api/profile GET handler:', err)
    event.res.statusCode = 500
    return { error: 'internal_server_error' }
  }
})
