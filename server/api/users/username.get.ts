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
      return { username: null }
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
        return { username: null }
      }
      console.error('[API] Error fetching username:', userError)
      event.res.statusCode = 500
      return { error: 'username_fetch_failed', details: userError }
    }

    return {
      username: userData?.username || null
    }
  } catch (err) {
    console.error('Error in /api/users/username handler:', err)
    event.res.statusCode = 500
    return { error: 'internal_server_error' }
  }
})

