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
    const body = await readBody(event)

    // リクエストボディの検証
    if (!body || typeof body !== 'object') {
      event.res.statusCode = 400
      return { error: 'invalid_request', message: 'リクエストボディが無効です' }
    }

    const { chat_id, user_id, interest } = body

    // 必須パラメータの検証
    if (!chat_id || !user_id || interest === undefined) {
      event.res.statusCode = 400
      return { 
        error: 'missing_parameters', 
        message: 'chat_id, user_id, interest は必須です' 
      }
    }

    // interestの値の検証（1-5の範囲）
    if (typeof interest !== 'number' || interest < 1 || interest > 5) {
      event.res.statusCode = 400
      return { 
        error: 'invalid_interest', 
        message: 'interestは1から5の整数である必要があります' 
      }
    }

    // chat_idとuser_idの型検証
    const chatId = typeof chat_id === 'string' ? parseInt(chat_id, 10) : Number(chat_id)
    if (isNaN(chatId)) {
      event.res.statusCode = 400
      return { error: 'invalid_chat_id', message: 'chat_idは数値である必要があります' }
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      event.res.statusCode = 500
      return { error: 'supabase_not_configured', message: 'Supabaseが設定されていません' }
    }

    console.log('[API] Saving chat interest:', { chat_id: chatId, user_id, interest })

    // chat_interestテーブルに保存または更新（UPSERT）
    const { data: interestData, error: interestError } = await supabase
      .from('chat_interest')
      .upsert(
        {
          chat_id: chatId,
          user_id: String(user_id),
          interest: Math.round(interest), // 整数に丸める
          updated_at: new Date().toISOString()
        },
        {
          onConflict: 'chat_id,user_id'
        }
      )
      .select()

    if (interestError) {
      console.error('[API] Error saving chat interest:', interestError)
      event.res.statusCode = 500
      return { 
        error: 'database_error', 
        message: '会いたい度の保存に失敗しました',
        details: interestError.message 
      }
    }

    console.log('[API] Chat interest saved:', interestData)

    // chatsテーブルのmeeting_interest_scoreを更新
    // チャット内の両ユーザーの会いたい度の平均を計算
    const { data: chatInterests, error: fetchError } = await supabase
      .from('chat_interest')
      .select('interest')
      .eq('chat_id', chatId)

    if (fetchError) {
      console.error('[API] Error fetching chat interests for score calculation:', fetchError)
      // エラーが発生しても、個人の会いたい度は保存されているので続行
    } else if (chatInterests && chatInterests.length > 0) {
      // 平均値を計算（小数点以下を四捨五入）
      const averageInterest = Math.round(
        chatInterests.reduce((sum, item) => sum + item.interest, 0) / chatInterests.length
      )

      console.log('[API] Updating meeting_interest_score:', { chat_id: chatId, score: averageInterest })

      // chatsテーブルのmeeting_interest_scoreを更新
      const { error: updateError } = await supabase
        .from('chats')
        .update({ meeting_interest_score: averageInterest })
        .eq('id', chatId)

      if (updateError) {
        console.error('[API] Error updating meeting_interest_score:', updateError)
        // エラーが発生しても、個人の会いたい度は保存されているので続行
      } else {
        console.log('[API] meeting_interest_score updated successfully')
      }
    }

    return {
      success: true,
      data: interestData?.[0] || null,
      message: '会いたい度を保存しました'
    }

  } catch (error: any) {
    console.error('[API] Unexpected error in chat interest API:', error)
    event.res.statusCode = 500
    return { 
      error: 'internal_error', 
      message: '予期しないエラーが発生しました',
      details: error.message 
    }
  }
})
