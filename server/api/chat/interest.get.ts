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
    const { chat_id, user_id } = query

    // 必須パラメータの検証
    if (!chat_id || !user_id) {
      event.res.statusCode = 400
      return { 
        error: 'missing_parameters', 
        message: 'chat_id と user_id は必須です' 
      }
    }

    // chat_idの型検証
    const chatId = typeof chat_id === 'string' ? parseInt(chat_id, 10) : Number(chat_id)
    if (isNaN(chatId)) {
      event.res.statusCode = 400
      return { error: 'invalid_chat_id', message: 'chat_idは数値である必要があります' }
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      event.res.statusCode = 500
      return { error: 'supabase_not_configured', message: 'Supabaseが設定されていません' }
    }

    console.log('[API] Fetching chat interest:', { chat_id: chatId, user_id })

    // chat_interestテーブルから会いたい度を取得
    const { data: interestData, error: interestError } = await supabase
      .from('chat_interest')
      .select('interest, updated_at')
      .eq('chat_id', chatId)
      .eq('user_id', String(user_id))
      .single()

    if (interestError) {
      // レコードが見つからない場合はデフォルト値を返す
      if (interestError.code === 'PGRST116') {
        console.log('[API] No interest record found, returning default value')
        return {
          success: true,
          data: {
            interest: 3, // デフォルト値
            updated_at: null
          }
        }
      }
      
      console.error('[API] Error fetching chat interest:', interestError)
      event.res.statusCode = 500
      return { 
        error: 'database_error', 
        message: '会いたい度の取得に失敗しました',
        details: interestError.message 
      }
    }

    return {
      success: true,
      data: interestData
    }

  } catch (error: any) {
    console.error('[API] Unexpected error in chat interest GET API:', error)
    event.res.statusCode = 500
    return { 
      error: 'internal_error', 
      message: '予期しないエラーが発生しました',
      details: error.message 
    }
  }
})
