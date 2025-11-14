import { ref } from 'vue'
import { useAuth } from './useAuth'

interface Chat {
  id: number
  user1_id: string
  user2_id: string
  ai_suggested_theme?: string
  created_at: string
}

interface ChatWithPartner extends Chat {
  partner_id: string
  partner_name?: string
  last_message?: string
  last_message_time?: string
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
      chats.value = response.map((chat) => {
        const partnerId = chat.user1_id === currentUserId ? chat.user2_id : chat.user1_id
        return {
          ...chat,
          partner_id: partnerId,
          partner_name: undefined, // 後でユーザー情報を取得して設定
          last_message: undefined, // 後でメッセージ履歴から取得
          last_message_time: undefined
        }
      })

      return chats.value
    } catch (err: any) {
      console.error('Failed to fetch chats:', err)
      
      // エラーメッセージを詳細化
      if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
        error.value = `バックエンドサーバーに接続できません。\n${config.public.apiBaseUrl} が起動しているか確認してください。`
      } else if (err.statusCode === 401) {
        error.value = '認証に失敗しました。再度ログインしてください。'
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

