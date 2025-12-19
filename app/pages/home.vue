<script setup lang="ts">
import ChatIcon from '~/components/chaticon.vue'
import Footer from '~/components/Footer.vue'
import HomeHeader from '~/components/home-header.vue'
import { useChat } from '~/composables/useChat'
import { onMounted } from 'vue'

const { chats, isLoading, error, fetchChats } = useChat()

// 日付をフォーマットする関数（月/日の形式）
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}/${day}`
}

onMounted(async () => {
  try {
    await fetchChats()
  } catch (err) {
    console.error('Failed to load chats:', err)
  }
})
</script>

<template>
<<<<<<< HEAD

  <div class="min-h-screen p-4 pb-24 bg-[var(--meetupr-main)]">
    <HomeHeader />
=======
  <div class="min-h-screen pb-24 bg-[var(--meetupr-main)]">
    <!-- ヘッダー -->
    <div class="bg-white px-4 pt-2 pb-3">
      <!-- 左上の"home"テキスト -->
      <div class="text-xs text-gray-400 mb-1">home</div>
      
      <!-- ロゴとタイトル -->
      <div class="flex items-center justify-between">
        <!-- ロゴ -->
        <div class="flex items-center">
          <img 
            src="/icon.png" 
            alt="MeetUp+R ロゴ" 
            class="w-12 h-12 rounded-full object-cover mr-3"
          />
        </div>
        
        <!-- タイトル"トーク" -->
        <h1 class="text-2xl font-medium text-gray-800 flex-1 text-center">トーク</h1>
        
        <!-- 右側のスペーサー（ロゴとタイトルのバランスを取る） -->
        <div class="w-12"></div>
      </div>
      
      <!-- 緑の線 -->
      <div class="mt-3 h-0.5 bg-[var(--meetupr-color-3)]"></div>
    </div>
>>>>>>> origin/develop

    <!-- ローディング状態 -->
    <div v-if="isLoading" class="text-center text-gray-500 py-8">
      <p>チャット一覧を読み込み中...</p>
    </div>

    <!-- エラー状態 -->
    <div v-else-if="error" class="text-center py-8 px-4">
      <div class="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
        <p class="text-red-600 whitespace-pre-line">{{ error }}</p>
        <div class="mt-4 space-y-2 text-sm text-gray-600 text-left">
          <p><strong>確認事項:</strong></p>
          <ul class="list-disc list-inside space-y-1 ml-2">
            <li>バックエンドサーバーが起動しているか</li>
            <li>API URLが正しいか（デフォルト: http://localhost:8080）</li>
            <li>認証トークンが有効か</li>
          </ul>
        </div>
        <button 
          @click="fetchChats" 
          class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          再試行
        </button>
      </div>
    </div>

    <!-- チャット一覧 -->
    <div v-else-if="chats.length > 0" class="bg-[var(--meetupr-main)]">
      <ChatIcon 
        v-for="chat in chats"
        :key="chat.id"
        :name="chat.partner_name || `ユーザー ${chat.partner_id.slice(0, 8)}`"
        :message="chat.last_message || 'メッセージ'"
        :date="chat.last_message_time || formatDate(chat.created_at)"
        avatarColor="bg-teal-600"
        :chatId="chat.id"
        :partnerId="chat.partner_id"
      />
    </div>

    <!-- チャットがない場合 -->
    <div v-else class="flex items-center justify-center h-[calc(100vh-200px)] bg-[var(--meetupr-main)]">
      <p class="text-gray-600 text-lg">トーク相手がいません。</p>
    </div>

  </div>
  <Footer class="fixed inset-x-0 bottom-0"/>
</template>



<style scoped>
/* 必要ならスタイルをここに追加 */
</style>
