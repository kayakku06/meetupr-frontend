<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Smile, Send } from 'lucide-vue-next'
import { useAuth } from '~/composables/useAuth'
import { useChatVerification } from '~/composables/useChatVerification'

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const { user, getAccessToken } = useAuth()
const { verifyToken } = useChatVerification()

// メッセージの型定義
interface Message {
  id?: number
  content: string
  chat_id?: number
  sender_id: string
  sent_at?: string
}

// チャットIDをルートパラメータまたはクエリパラメータから取得
const chatId = ref<number | null>(null)
const partnerIdFromQuery = computed(() => {
  return route.query.partnerId as string | undefined
})

// チャットIDを取得または生成する関数
const fetchOrCreateChatId = async () => {
  // ルートパラメータからチャットIDを取得
  const idFromRoute = route.params.id || route.query.chatId
  if (idFromRoute) {
    const parsed = typeof idFromRoute === 'string' ? parseInt(idFromRoute, 10) : Number(idFromRoute)
    if (!isNaN(parsed)) {
      chatId.value = parsed
      // チャット詳細を取得してパートナー名を取得
      await fetchChatDetails()
      return
    }
  }

  // チャットIDがない場合、partnerIdからチャットIDを取得
  if (partnerIdFromQuery.value) {
    try {
      const token = await getAccessToken()
      if (!token) {
        errorMessage.value = '認証トークンを取得できませんでした'
        return
      }

      const response = await $fetch<{ id: number }>(`${config.public.apiBaseUrl}/api/v1/chats/with/${partnerIdFromQuery.value}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      chatId.value = response.id
      
      // URLを更新してチャットIDを含める
      router.replace(`/chat/${chatId.value}`)
      // チャット詳細を取得してパートナー名を取得
      await fetchChatDetails()
    } catch (err: any) {
      console.error('チャットIDの取得に失敗しました:', err)
      errorMessage.value = 'チャットIDの取得に失敗しました。ページを再読み込みしてください。'
    }
  }
}

// チャット詳細を取得してパートナー名を取得
const fetchChatDetails = async () => {
  if (!chatId.value) return

  try {
    const token = await getAccessToken()
    if (!token) return

    const response = await $fetch<{ other_user?: { username: string } }>(`${config.public.apiBaseUrl}/api/v1/chats/${chatId.value}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (response.other_user?.username) {
      partnerName.value = response.other_user.username
    }
  } catch (err: any) {
    console.error('チャット詳細の取得に失敗しました:', err)
  }
}

const message = ref('')
const messages = ref<Message[]>([])
const messagesContainer = ref<HTMLElement | null>(null)
const connectionStatus = ref<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected')
const errorMessage = ref('')
const partnerName = ref<string>('ユーザー')

let ws: WebSocket | null = null
let reconnectAttempts = 0
const maxReconnectAttempts = 5
const reconnectDelay = 3000

// 現在のユーザーIDを取得
const currentUserId = computed(() => {
  return user.value?.sub || ''
})

// 時刻をフォーマット（秒単位まで表示）
const formatTime = (dateString?: string) => {
  if (!dateString) return 'just now'
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  
  if (seconds < 60) return `${seconds}秒前`
  if (minutes < 60) return `${minutes}分前`
  
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}時間前`
  
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}日前`
  
  return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
}

// スクロールを最下部に
const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// WebSocket接続
const connectWebSocket = async () => {
  // チャットIDを取得または生成
  await fetchOrCreateChatId()
  
  if (!chatId.value) {
    errorMessage.value = 'チャットIDが取得できませんでした'
    return
  }

  try {
    const token = await getAccessToken()
    if (!token) {
      errorMessage.value = '認証トークンを取得できませんでした'
      connectionStatus.value = 'error'
      return
    }

    // ドキュメントに沿って、接続前にトークンを検証
    const isValid = await verifyToken(token)
    if (!isValid) {
      errorMessage.value = '認証トークンが無効です。再度ログインしてください。'
      connectionStatus.value = 'error'
      return
    }

    connectionStatus.value = 'connecting'
    errorMessage.value = ''

    // WebSocket URLの構築
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsHost = config.public.wsHost || 'localhost:8080'
    const wsUrl = `${wsProtocol}//${wsHost}/ws/chat/${chatId.value}?token=${encodeURIComponent(token)}`
    
    console.log('[WebSocket] Connecting to:', wsUrl)
    console.log('[WebSocket] Chat ID:', chatId.value)
    console.log('[WebSocket] Token length:', token.length)
    
    ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      console.log('[WebSocket] Connected successfully')
      connectionStatus.value = 'connected'
      reconnectAttempts = 0
      errorMessage.value = ''
    }

    ws.onmessage = (event) => {
      try {
        console.log('[WebSocket] Message received:', event.data)
        const data = JSON.parse(event.data)
        console.log('[WebSocket] Parsed data:', data)
        
        // メッセージ履歴（配列）の場合
        if (Array.isArray(data)) {
          console.log('[WebSocket] Received message history:', data.length, 'messages')
          messages.value = data.map((msg: Message) => ({
            ...msg,
            id: msg.id || Date.now() + Math.random()
          }))
          scrollToBottom()
        } else {
          // 単一メッセージの場合
          console.log('[WebSocket] Received single message:', data)
          const newMessage: Message = {
            ...data,
            id: data.id || Date.now() + Math.random()
          }
          messages.value.push(newMessage)
          scrollToBottom()
        }
      } catch (error) {
        console.error('[WebSocket] Failed to parse message:', error)
        console.error('[WebSocket] Raw data:', event.data)
      }
    }

    ws.onerror = (error) => {
      console.error('[WebSocket] Error occurred:', error)
      console.error('[WebSocket] Error details:', {
        type: error.type,
        target: error.target,
        currentTarget: (error as any).currentTarget,
        readyState: ws?.readyState
      })
      connectionStatus.value = 'error'
      // WebSocketのエラー詳細を取得
      const errorDetail = (error as any)?.message || '接続エラーが発生しました'
      if (errorDetail.includes('Authorization header required')) {
        errorMessage.value = 'WebSocket認証エラー: バックエンドがクエリパラメータからトークンを取得できていません。バックエンドの実装を確認してください。'
      } else {
        errorMessage.value = `接続エラー: ${errorDetail}。サーバーが起動しているか確認してください。`
      }
    }

    ws.onclose = (event) => {
      console.log('[WebSocket] Closed:', {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean
      })
      connectionStatus.value = 'disconnected'
      
      // エラーコードの説明
      let closeReason = ''
      if (event.code === 1000) {
        closeReason = '正常な切断'
      } else if (event.code === 1001) {
        closeReason = 'エンドポイントが離れました'
      } else if (event.code === 1002) {
        closeReason = 'プロトコルエラー'
      } else if (event.code === 1003) {
        closeReason = 'データタイプエラー'
      } else if (event.code === 1006) {
        closeReason = '異常な切断（サーバーに接続できません）'
      } else if (event.code === 1008) {
        closeReason = 'ポリシー違反'
      } else if (event.code === 1011) {
        closeReason = 'サーバーエラー'
      } else {
        closeReason = `エラーコード: ${event.code}`
      }
      
      // 正常な切断（1000）でない場合、再接続を試行
      if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
        reconnectAttempts++
        console.log(`[WebSocket] Reconnection attempt ${reconnectAttempts}/${maxReconnectAttempts}...`)
        errorMessage.value = `接続が切断されました。再接続を試みています... (${reconnectAttempts}/${maxReconnectAttempts})`
        setTimeout(() => {
          connectWebSocket()
        }, reconnectDelay * reconnectAttempts)
      } else if (reconnectAttempts >= maxReconnectAttempts) {
        errorMessage.value = `接続に失敗しました: ${closeReason}。ページを再読み込みしてください。`
      } else if (event.code !== 1000) {
        errorMessage.value = `接続が切断されました: ${closeReason}`
      }
    }
  } catch (error) {
    console.error('Failed to connect WebSocket:', error)
    connectionStatus.value = 'error'
    errorMessage.value = '接続に失敗しました'
  }
}

// メッセージ送信
const sendMessage = async () => {
  if (!message.value.trim()) {
    return
  }

  if (!ws) {
    errorMessage.value = 'WebSocket接続がありません。再接続してください。'
    console.error('[SendMessage] WebSocket is null')
    return
  }

  if (ws.readyState !== WebSocket.OPEN) {
    errorMessage.value = `接続が確立されていません（状態: ${ws.readyState}）。再接続してください。`
    console.error('[SendMessage] WebSocket is not open. State:', ws.readyState)
    // 接続を再試行
    await connectWebSocket()
    return
  }

  try {
    const messageData = {
      content: message.value.trim()
    }
    
    console.log('[SendMessage] Sending message:', messageData)
    ws.send(JSON.stringify(messageData))
    message.value = ''
    errorMessage.value = ''
  } catch (error) {
    console.error('[SendMessage] Failed to send message:', error)
    errorMessage.value = 'メッセージの送信に失敗しました'
  }
}

// 戻るボタンの処理
const handleBack = () => {
  router.push('/home')
}

onMounted(async () => {
  await connectWebSocket()
})

onUnmounted(() => {
  if (ws) {
    ws.close(1000, 'Component unmounted')
    ws = null
  }
})
</script>

<template>
    <div class="h-screen flex items-center justify-center bg-gray-50">
        <div
            class="max-w-[420px] w-full mx-auto bg-white border rounded-xl shadow-md overflow-hidden flex flex-col h-full">
            <!-- ヘッダー -->
            <div class="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                <!-- 左側：戻るボタン -->
                <button @click="handleBack" class="text-gray-700 hover:text-gray-900">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7">
                        </path>
                    </svg>
                </button>

                <!-- 中央：パートナー名と?アイコン -->
                <div class="flex items-center space-x-2 flex-1 justify-center">
                    <span class="text-lg font-medium text-gray-800">{{ partnerName }}</span>
                    <button class="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50">
                        <span class="text-xs text-gray-600">?</span>
                    </button>
                </div>

                <!-- 右側：禁止マークと電話アイコン -->
                <div class="flex items-center space-x-3">
                    <button class="text-[#ff8c69] hover:text-orange-600">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M8 12h8" stroke-linecap="round" />
                        </svg>
                    </button>
                    <button class="text-[#ff8c69] hover:text-orange-600">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                            <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                    </button>
                </div>
            </div>
            
            <!-- エラーメッセージ表示 -->
            <div v-if="errorMessage" class="bg-red-50 border-b border-red-200 px-4 py-2">
                <p class="text-sm text-red-600">{{ errorMessage }}</p>
            </div>

            <div ref="messagesContainer" class="flex-1 overflow-y-auto bg-[var(--meetupr-main)] p-4 space-y-4">
                <template v-if="messages.length === 0 && connectionStatus === 'connected'">
                    <div class="text-center text-gray-500 py-8">
                        <p>メッセージがありません</p>
                    </div>
                </template>
                <template v-else-if="messages.length === 0 && connectionStatus === 'connecting'">
                    <div class="text-center text-gray-500 py-8">
                        <p>接続中...</p>
                    </div>
                </template>
                <template v-else>
                    <template v-for="msg in messages" :key="msg.id">
                        <!-- 相手のメッセージ（左側） -->
                        <div v-if="msg.sender_id !== currentUserId" class="flex items-start space-x-3 mb-4">
                            <!-- 緑のアバター -->
                            <div class="w-10 h-10 rounded-full bg-teal-600 flex-shrink-0"></div>
                            <div class="space-y-1 max-w-[75%]">
                                <!-- 薄いオレンジの吹き出し -->
                                <div class="bg-[var(--meetupr-sub)] rounded-2xl rounded-tl-sm px-4 py-3">
                                    <p class="text-gray-800 text-sm leading-relaxed">{{ msg.content }}</p>
                                </div>
                                <!-- タイムスタンプ -->
                                <p class="text-xs text-gray-500 px-2">{{ formatTime(msg.sent_at) }}</p>
                            </div>
                        </div>
                        <!-- 自分のメッセージ（右側） -->
                        <div v-else class="flex justify-end mb-4">
                            <div class="max-w-[75%]">
                                <!-- 薄いオレンジの吹き出し -->
                                <div class="bg-[var(--meetupr-sub)] rounded-2xl rounded-tr-sm px-4 py-3">
                                    <p class="text-gray-800 text-sm leading-relaxed">{{ msg.content }}</p>
                                </div>
                                <!-- タイムスタンプ -->
                                <p class="text-xs text-gray-500 text-right px-2 mt-1">{{ formatTime(msg.sent_at) }}</p>
                            </div>
                        </div>
                    </template>
                </template>
            </div>

            <!-- メッセージ入力エリア -->
            <div class="bg-[var(--meetupr-sub)] px-4 py-4">
                <div class="flex items-center space-x-3">
                    <!-- 入力フィールド -->
                    <div class="flex-1 relative">
                        <input 
                            v-model="message" 
                            @keydown.enter.prevent="sendMessage" 
                            type="text" 
                            placeholder="メッセージを入力"
                            class="w-full bg-yellow-50 border-2 border-orange-300 rounded-full px-6 pr-14 py-3 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-orange-400 transition-colors" 
                        />
                        <!-- 絵文字アイコン（右側、円形） -->
                        <button class="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white flex items-center justify-center border border-gray-300 hover:bg-gray-50">
                            <Smile class="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>
