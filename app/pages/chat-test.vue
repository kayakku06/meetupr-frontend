<template>
  <div class="min-h-screen bg-gray-50 p-4">
    <div class="max-w-2xl mx-auto">
      <h1 class="text-2xl font-bold mb-6">チャット機能 動作確認</h1>
      
      <!-- 動作確認ボタン -->
      <div class="mb-6">
        <button
          @click="runVerification"
          :disabled="isRunning"
          class="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
        >
          {{ isRunning ? '確認中...' : '動作確認を実行' }}
        </button>
        
        <div v-if="chatIdInput" class="mt-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            WebSocket接続テスト用のチャットID（オプション）
          </label>
          <input
            v-model.number="testChatId"
            type="number"
            placeholder="例: 1"
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <!-- 結果表示 -->
      <div v-if="results.length > 0" class="space-y-4">
        <div
          v-for="(result, index) in results"
          :key="index"
          :class="[
            'p-4 rounded-lg border-2',
            result.success
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          ]"
        >
          <div class="flex items-center justify-between">
            <h3 class="font-semibold" :class="result.success ? 'text-green-800' : 'text-red-800'">
              {{ result.name }}
            </h3>
            <span
              :class="[
                'px-3 py-1 rounded-full text-sm font-medium',
                result.success
                  ? 'bg-green-200 text-green-800'
                  : 'bg-red-200 text-red-800'
              ]"
            >
              {{ result.success ? '✓ 成功' : '✗ 失敗' }}
            </span>
          </div>
          <p class="mt-2 text-sm" :class="result.success ? 'text-green-700' : 'text-red-700'">
            {{ result.message }}
          </p>
        </div>
      </div>

      <!-- 手動テストセクション -->
      <div class="mt-8 p-4 bg-white rounded-lg border border-gray-200">
        <h2 class="text-lg font-semibold mb-4">手動テスト</h2>
        
        <div class="space-y-4">
          <div>
            <h3 class="font-medium mb-2">1. サーバーの起動確認</h3>
            <button
              @click="testServer"
              :disabled="testingServer"
              class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:bg-gray-400"
            >
              {{ testingServer ? '確認中...' : 'サーバーを確認' }}
            </button>
            <p v-if="serverStatus" class="mt-2 text-sm" :class="serverStatus.success ? 'text-green-600' : 'text-red-600'">
              {{ serverStatus.message }}
            </p>
          </div>

          <div>
            <h3 class="font-medium mb-2">2. トークンの検証</h3>
            <button
              @click="testToken"
              :disabled="testingToken"
              class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:bg-gray-400"
            >
              {{ testingToken ? '確認中...' : 'トークンを検証' }}
            </button>
            <p v-if="tokenStatus" class="mt-2 text-sm" :class="tokenStatus.success ? 'text-green-600' : 'text-red-600'">
              {{ tokenStatus.message }}
            </p>
          </div>

          <div>
            <h3 class="font-medium mb-2">3. チャット一覧の取得</h3>
            <button
              @click="testChats"
              :disabled="testingChats"
              class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:bg-gray-400"
            >
              {{ testingChats ? '確認中...' : 'チャット一覧を取得' }}
            </button>
            <p v-if="chatsStatus" class="mt-2 text-sm" :class="chatsStatus.success ? 'text-green-600' : 'text-red-600'">
              {{ chatsStatus.message }}
            </p>
          </div>

          <div>
            <h3 class="font-medium mb-2">4. WebSocket接続テスト</h3>
            <div class="flex gap-2">
              <input
                v-model.number="testChatId"
                type="number"
                placeholder="チャットID"
                class="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                @click="testWebSocket"
                :disabled="testingWebSocket || !testChatId"
                class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:bg-gray-400"
              >
                {{ testingWebSocket ? '接続中...' : '接続テスト' }}
              </button>
            </div>
            <p v-if="wsStatus" class="mt-2 text-sm" :class="wsStatus.success ? 'text-green-600' : 'text-red-600'">
              {{ wsStatus.message }}
            </p>
          </div>
        </div>
      </div>

      <!-- 設定情報 -->
      <div class="mt-8 p-4 bg-gray-100 rounded-lg">
        <h2 class="text-lg font-semibold mb-4">現在の設定</h2>
        <dl class="space-y-2 text-sm">
          <div class="flex">
            <dt class="font-medium w-32">API Base URL:</dt>
            <dd>{{ config.public.apiBaseUrl }}</dd>
          </div>
          <div class="flex">
            <dt class="font-medium w-32">WebSocket Host:</dt>
            <dd>{{ config.public.wsHost }}</dd>
          </div>
          <div class="flex">
            <dt class="font-medium w-32">Auth0 Domain:</dt>
            <dd>{{ config.public.auth0Domain || '未設定' }}</dd>
          </div>
          <div class="flex">
            <dt class="font-medium w-32">Auth0 Audience:</dt>
            <dd>{{ config.public.auth0Audience || '未設定' }}</dd>
          </div>
        </dl>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useChatVerification } from '~/composables/useChatVerification'
import { useAuth } from '~/composables/useAuth'

const config = useRuntimeConfig()
const { getAccessToken } = useAuth()
const {
  checkServer,
  verifyToken: verifyTokenHelper,
  checkChatsEndpoint,
  testWebSocketConnection,
  runFullVerification
} = useChatVerification()

const isRunning = ref(false)
const results = ref<Array<{ name: string; success: boolean; message: string }>>([])
const testChatId = ref<number | null>(null)
const chatIdInput = ref(false)

// 個別テスト用の状態
const testingServer = ref(false)
const testingToken = ref(false)
const testingChats = ref(false)
const testingWebSocket = ref(false)
const serverStatus = ref<{ success: boolean; message: string } | null>(null)
const tokenStatus = ref<{ success: boolean; message: string } | null>(null)
const chatsStatus = ref<{ success: boolean; message: string } | null>(null)
const wsStatus = ref<{ success: boolean; message: string } | null>(null)

// 包括的な動作確認を実行
const runVerification = async () => {
  isRunning.value = true
  results.value = []
  
  try {
    const verificationResults = await runFullVerification(testChatId.value || undefined)
    results.value = verificationResults
  } catch (error) {
    console.error('Verification failed:', error)
    results.value = [{
      name: '動作確認エラー',
      success: false,
      message: `エラーが発生しました: ${(error as Error).message}`
    }]
  } finally {
    isRunning.value = false
  }
}

// 個別テスト関数
const testServer = async () => {
  testingServer.value = true
  serverStatus.value = null
  try {
    const isRunning = await checkServer()
    serverStatus.value = {
      success: isRunning,
      message: isRunning ? 'サーバーは起動しています' : 'サーバーに接続できません'
    }
  } catch (error) {
    serverStatus.value = {
      success: false,
      message: `エラー: ${(error as Error).message}`
    }
  } finally {
    testingServer.value = false
  }
}

const testToken = async () => {
  testingToken.value = true
  tokenStatus.value = null
  try {
    const token = await getAccessToken()
    if (!token) {
      tokenStatus.value = {
        success: false,
        message: '認証トークンを取得できませんでした'
      }
      return
    }
    
    const isValid = await verifyTokenHelper(token)
    tokenStatus.value = {
      success: isValid,
      message: isValid ? 'トークンは有効です' : 'トークンが無効です'
    }
  } catch (error) {
    tokenStatus.value = {
      success: false,
      message: `エラー: ${(error as Error).message}`
    }
  } finally {
    testingToken.value = false
  }
}

const testChats = async () => {
  testingChats.value = true
  chatsStatus.value = null
  try {
    const result = await checkChatsEndpoint()
    chatsStatus.value = result
  } catch (error) {
    chatsStatus.value = {
      success: false,
      message: `エラー: ${(error as Error).message}`
    }
  } finally {
    testingChats.value = false
  }
}

const testWebSocket = async () => {
  if (!testChatId.value) {
    wsStatus.value = {
      success: false,
      message: 'チャットIDを入力してください'
    }
    return
  }

  testingWebSocket.value = true
  wsStatus.value = null
  try {
    const result = await testWebSocketConnection(testChatId.value)
    wsStatus.value = result
  } catch (error) {
    wsStatus.value = {
      success: false,
      message: `エラー: ${(error as Error).message}`
    }
  } finally {
    testingWebSocket.value = false
  }
}

// ページ読み込み時に自動実行（オプション）
// onMounted(() => {
//   runVerification()
// })
</script>

