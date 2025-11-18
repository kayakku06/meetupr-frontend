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
      // env がなければデフォルトでfalseを返す（プロフィール未登録とみなす）
      return { hasProfile: false, profile: null }
    }

    // profilesテーブルからユーザーのプロフィールを取得
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (profileError) {
      // プロフィールが存在しない場合（PGRST116: no rows returned）
      if (profileError.code === 'PGRST116') {
        return { hasProfile: false, profile: null }
      }
      console.error('[API] Error checking profile:', profileError)
      event.res.statusCode = 500
      return { error: 'profile_check_failed', details: profileError }
    }

    // プロフィールが存在する場合、主要なフィールドがNULLかどうかをチェック
    const hasCompleteProfile = profileData && (
      profileData.major !== null ||
      profileData.gender !== null ||
      profileData.residence !== null ||
      profileData.comment !== null ||
      (Array.isArray(profileData.spoken_languages) && profileData.spoken_languages.length > 0) ||
      (Array.isArray(profileData.learning_languages) && profileData.learning_languages.length > 0)
    )

    return {
      hasProfile: true,
      hasCompleteProfile: hasCompleteProfile,
      profile: profileData
    }
  } catch (err) {
    console.error('Error in /api/profile/check handler:', err)
    event.res.statusCode = 500
    return { error: 'internal_server_error' }
  }
})

