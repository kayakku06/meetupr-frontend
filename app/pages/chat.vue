<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Smile, Send } from 'lucide-vue-next'
import { useAuth } from '~/composables/useAuth'

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const { user, getAccessToken } = useAuth()

// メッセージの型定義
interface Message {
  id?: number
  content: string
  chat_id?: number
  sender_id: string
  sent_at?: string
}

// チャットIDをルートパラメータまたはクエリパラメータから取得
const chatId = computed(() => {
  const id = route.params.id || route.query.chatId
  if (typeof id === 'string') {
    const parsed = parseInt(id, 10)
    return isNaN(parsed) ? null : parsed
  }
  return id ? Number(id) : null
})

const message = ref('')
const messages = ref<Message[]>([])
const messagesContainer = ref<HTMLElement | null>(null)
const connectionStatus = ref<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected')
const errorMessage = ref('')

let ws: WebSocket | null = null
let reconnectAttempts = 0
const maxReconnectAttempts = 5
const reconnectDelay = 3000

// 現在のユーザーIDを取得
const currentUserId = computed(() => {
  return user.value?.sub || ''
})

// 時刻をフォーマット
const formatTime = (dateString?: string) => {
  if (!dateString) return 'just now'
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  
  if (minutes < 1) return 'just now'
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

    connectionStatus.value = 'connecting'
    errorMessage.value = ''

    // WebSocket URLの構築
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsHost = config.public.wsHost || 'localhost:8080'
    const wsUrl = `${wsProtocol}//${wsHost}/ws/chat/${chatId.value}?token=${encodeURIComponent(token)}`
    
    ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      console.log('WebSocket connected')
      connectionStatus.value = 'connected'
      reconnectAttempts = 0
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        // メッセージ履歴（配列）の場合
        if (Array.isArray(data)) {
          messages.value = data.map((msg: Message) => ({
            ...msg,
            id: msg.id || Date.now() + Math.random()
          }))
        } else {
          // 単一メッセージの場合
          const newMessage: Message = {
            ...data,
            id: data.id || Date.now() + Math.random()
          }
          messages.value.push(newMessage)
        }
        
        scrollToBottom()
      } catch (error) {
        console.error('Failed to parse message:', error)
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      connectionStatus.value = 'error'
      errorMessage.value = '接続エラーが発生しました'
    }

    ws.onclose = (event) => {
      console.log('WebSocket closed:', event.code, event.reason)
      connectionStatus.value = 'disconnected'
      
      // 正常な切断（1000）でない場合、再接続を試行
      if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
        reconnectAttempts++
        setTimeout(() => {
          console.log(`Reconnection attempt ${reconnectAttempts}...`)
          connectWebSocket()
        }, reconnectDelay * reconnectAttempts)
      } else if (reconnectAttempts >= maxReconnectAttempts) {
        errorMessage.value = '接続に失敗しました。ページを再読み込みしてください。'
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
  if (!message.value.trim() || !ws || ws.readyState !== WebSocket.OPEN) {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      errorMessage.value = '接続が確立されていません'
    }
    return
  }

  try {
    const messageData = {
      content: message.value.trim()
    }
    
    ws.send(JSON.stringify(messageData))
    message.value = ''
    errorMessage.value = ''
  } catch (error) {
    console.error('Failed to send message:', error)
    errorMessage.value = 'メッセージの送信に失敗しました'
  }
}

// 戻るボタンの処理
const handleBack = () => {
  router.push('/home')
}

onMounted(async () => {
  if (!chatId.value) {
    errorMessage.value = 'チャットIDが指定されていません'
    return
  }
  
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
            <div class="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between">
                <div class="flex items-center space-x-4">
                    <button @click="handleBack" class="text-gray-700 hover:text-gray-900">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7">
                            </path>
                        </svg>
                    </button>
                    <div class="flex items-center space-x-2">
                        <span class="text-lg font-medium text-gray-800">チャット</span>
                        <div class="flex items-center space-x-1">
                            <div 
                                :class="[
                                    'w-2 h-2 rounded-full',
                                    connectionStatus === 'connected' ? 'bg-green-500' : 
                                    connectionStatus === 'connecting' ? 'bg-yellow-500' : 
                                    'bg-red-500'
                                ]"
                            ></div>
                            <span class="text-xs text-gray-500">
                                {{ connectionStatus === 'connected' ? '接続中' : 
                                   connectionStatus === 'connecting' ? '接続中...' : 
                                   '切断' }}
                            </span>
                        </div>
                    </div>
                </div>
                <button class="text-orange-500 hover:text-orange-600">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z">
                        </path>
                    </svg>
                </button>
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
                        <div v-if="msg.sender_id !== currentUserId" class="flex items-start space-x-3">
                            <div class="w-10 h-10 rounded-full bg-gray-500 flex-shrink-0"></div>
                            <div class="space-y-2 max-w-[75%]">
                                <div class="bg-[var(--chat-other-color)] rounded-2xl rounded-tl-sm px-4 py-3">
                                    <p class="text-gray-800 text-sm leading-relaxed">{{ msg.content }}</p>
                                </div>
                                <p class="text-xs text-gray-500 px-2">{{ formatTime(msg.sent_at) }}</p>
                            </div>
                        </div>
                        <div v-else class="flex justify-end">
                            <div class="max-w-[75%]">
                                <div class="bg-[var(--chat-my-color)] rounded-2xl rounded-tr-sm px-4 py-3">
                                    <p class="text-white text-sm leading-relaxed">{{ msg.content }}</p>
                                </div>
                                <p class="text-xs text-gray-500 text-right px-2 mt-1">{{ formatTime(msg.sent_at) }}</p>
                            </div>
                        </div>
                    </template>
                </template>
            </div>

            <div class="bg-[var(--meetupr-sub)] px-4 py-4">
                <div class="flex items-center space-x-3">

                    <div class="flex-1 relative">
                        <input v-model="message" @keydown.enter.prevent="sendMessage" type="text" placeholder="メッセージを入力"
                            class="w-full bg-yellow-50 border-2 border-orange-300 rounded-full px-6 pr-12 py-3 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-orange-400 transition-colors" />
                        <button class="text-gray-500 hover:text-gray-700 absolute right-4 top-1/2 -translate-y-1/2">
                            <Smile class="w-7 h-7" />
                        </button>
                    </div>
                    <button @click="sendMessage" class="ml-2 bg-orange-400 text-white rounded-full px-4 py-2 hover:bg-orange-500 flex items-center justify-center">
                        <Send class="w-5 h-5" />
                    </button>

                </div>
            </div>

        </div>
    </div>
</template>
