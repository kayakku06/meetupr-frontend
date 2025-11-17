<script setup lang="ts">
import ChatIcon from '~/components/chaticon.vue'
import Footer from '~/components/Footer.vue'
import { useChat } from '~/composables/useChat'
import { onMounted } from 'vue'

const { chats, isLoading, error, fetchChats } = useChat()

onMounted(async () => {
  try {
    await fetchChats()
  } catch (err) {
    console.error('Failed to load chats:', err)
  }
})
</script>

<template>

  <div class="p-4 pb-24 bg-[var(--meetupr-main)]">
    <h1 class="text-xl mb-4 zen-maru-gothic-regular">Home</h1>

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
    <div v-else-if="chats.length > 0">
      <ChatIcon 
        v-for="chat in chats"
        :key="chat.id"
        :name="chat.partner_name || `ユーザー ${chat.partner_id.slice(0, 8)}`"
        :message="chat.last_message || 'メッセージがありません'"
        :date="chat.last_message_time || new Date(chat.created_at).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })"
        avatarColor="bg-teal-600"
        :chatId="chat.id"
      />
    </div>

    <!-- チャットがない場合 -->
    <div v-else class="text-center text-gray-500 py-8">
      <p>チャットがありません</p>
    </div>

  </div>
  <Footer class="fixed inset-x-0 bottom-0"/>
</template>



<style scoped>
/* 必要ならスタイルをここに追加 */
</style>
