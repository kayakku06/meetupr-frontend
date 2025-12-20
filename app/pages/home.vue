<script setup lang="ts">
import ChatIcon from '~/components/chaticon.vue'
import Footer from '~/components/Footer.vue'
import HomeHeader from '~/components/home-header.vue'
import { useChat } from '~/composables/useChat'
import { useLocale } from '~/composables/useLocale'
import { onMounted } from 'vue'

const { chats, isLoading, error, fetchChats } = useChat()
const { t } = useLocale()

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

  <HomeHeader class="fixed inset-x-0 top-0 z-50"/>
  <div class="min-h-screen px-4 pt-28 pb-24 bg-[var(--meetupr-main)]">
    <!-- ローディング状態 -->
    <div v-if="isLoading" class="text-center text-gray-500 py-8">
      <p>{{ t.home.loadingChats }}</p>
    </div>

    <!-- エラー状態 -->
    <div v-else-if="error" class="text-center py-8 px-4">
      <div class="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
        <p class="text-red-600 whitespace-pre-line">{{ error }}</p>
        <div class="mt-4 space-y-2 text-sm text-gray-600 text-left">
          <p><strong>{{ t.home.checkItems }}</strong></p>
          <ul class="list-disc list-inside space-y-1 ml-2">
            <li>{{ t.home.backendRunning }}</li>
            <li>{{ t.home.apiUrlCorrect }}</li>
            <li>{{ t.home.tokenValid }}</li>
          </ul>
        </div>
        <button 
          @click="fetchChats" 
          class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          {{ t.common.retry }}
        </button>
      </div>
    </div>

    <!-- チャット一覧 -->
    <div v-else-if="chats.length > 0" class="bg-[var(--meetupr-main)]">
      <ChatIcon 
        v-for="chat in chats"
        :key="chat.id"
        :name="chat.partner_name || `${t.home.userPrefix}${chat.partner_id.slice(0, 8)}`"
        :message="chat.last_message_content || ''"
        :date="chat.last_message_time || ''"
        :time="chat.last_message_hour || ''"
        avatarColor="bg-teal-600"
        :avatarUrl="chat.partner_avatar_url || null"
        :chatId="chat.id"
        :partnerId="chat.partner_id"
      />
    </div>

    <!-- チャットがない場合 -->
    <div v-else class="flex items-center justify-center h-[calc(100vh-200px)] bg-[var(--meetupr-main)]">
      <p class="text-gray-600 text-lg">{{ t.home.noChats }}</p>
    </div>

  </div>
  <Footer class="fixed inset-x-0 bottom-0"/>
</template>



<style scoped>
/* 必要ならスタイルをここに追加 */
</style>
