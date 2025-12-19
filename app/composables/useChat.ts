import { ref } from 'vue'
import { useAuth } from './useAuth'

interface Chat {
  id: number
  user1_id: string
  user2_id: string
  ai_suggested_theme?: string
  created_at: string
  // バックエンドから返ってくるフィールド
  other_user?: {
    id: string
    username: string
    // その他のフィールド...
  }
  last_message?: {
    id: number
    content: string
    sent_at: string
    // その他のフィールド...
  }
}

interface ChatWithPartner extends Chat {
  partner_id: string
  partner_name?: string  // other_user.username から取得
  last_message?: string  // last_message.content から取得
  last_message_time?: string  // last_message.sent_at から取得
}

// 日付をフォーマットする関数（月/日の形式）
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}/${day}`
}

export const useChat = () => {
  const { getAccessToken } = useAuth()
  const config = useRuntimeConfig()
  const chats = ref<ChatWithPartner[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // チャット一覧を取得
  const fetchChats = async () => {
    isLoading.value = true
    error.value = null

    try {
      const token = await getAccessToken()
      if (!token) {
        throw new Error('認証トークンを取得できませんでした。ログインしてください。')
      }

      const apiUrl = `${config.public.apiBaseUrl}/api/v1/chats`
      console.log('Fetching chats from:', apiUrl)

      const response = await $fetch<Chat[]>(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        // タイムアウトを設定
        timeout: 10000
      })

      // 現在のユーザーIDを取得
      const { user } = useAuth()
      const currentUserId = user.value?.sub

      // チャット情報を整形（パートナー情報を含める）
      // メッセージがあるチャットのみを表示（last_messageが存在するもののみ）
      chats.value = response
        .filter((chat) => chat.last_message != null && chat.last_message.content != null)
        .map((chat) => {
          const partnerId = chat.user1_id === currentUserId ? chat.user2_id : chat.user1_id
          return {
            ...chat,
            partner_id: partnerId,
            // バックエンドから返ってくる other_user.username を使用
            partner_name: chat.other_user?.username,
            // バックエンドから返ってくる last_message.content を使用
            last_message: chat.last_message?.content,
            // バックエンドから返ってくる last_message.sent_at を使用
            last_message_time: chat.last_message?.sent_at
              ? formatDate(chat.last_message.sent_at)
              : null
          }
        })

      return chats.value
    } catch (err: any) {
      console.error('Failed to fetch chats:', err)
      
      // エラーメッセージを詳細化
      if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
        error.value = `バックエンドサーバーに接続できません。\n${config.public.apiBaseUrl} が起動しているか確認してください。`
      } else if (err.statusCode === 401) {
        const errorDetail = err.data?.error || err.message || ''
        if (errorDetail.includes('invalid number of segments')) {
          error.value = 'トークンの形式が正しくありません。Auth0のAPI Audienceが設定されているか確認してください。\n\n設定方法:\n1. Auth0 Dashboard → APIs → 新しいAPIを作成\n2. Identifier (Audience) をコピー\n3. .envファイルに AUTH0_AUDIENCE=コピーしたIdentifier を追加'
        } else {
          error.value = `認証に失敗しました (${errorDetail})。再度ログインしてください。`
        }
      } else if (err.statusCode === 404) {
        error.value = 'APIエンドポイントが見つかりません。バックエンドサーバーの設定を確認してください。'
      } else if (err.statusCode) {
        error.value = `エラーが発生しました (${err.statusCode}): ${err.message || 'チャット一覧の取得に失敗しました'}`
      } else {
        error.value = err.message || 'チャット一覧の取得に失敗しました'
      }
      
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    chats,
    isLoading,
    error,
    fetchChats
  }
}

