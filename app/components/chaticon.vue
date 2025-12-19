<template>
  <div class="flex items-center justify-between p-3 bg-[var(--meetupr-main)] hover:bg-gray-50 transition zen-maru cursor-pointer"
  @click="goProfile">
    <!-- 左側（アバター＋名前＋メッセージ） -->
    <div class="flex items-center space-x-3 flex-1 min-w-0">
      <!-- アバター -->
      <div class="w-12 h-12 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center"
        :class="avatarUrl ? '' : avatarColor">
        <img v-if="avatarUrl" :src="avatarUrl" :alt="name || 'ユーザー'" class="w-full h-full object-cover" />
        <svg v-else viewBox="0 0 64 64" class="w-8 h-8" aria-hidden>
          <circle cx="32" cy="24" r="12" fill="none" stroke="#6aaea0" stroke-width="2" />
          <path d="M10 54c4-10 18-14 22-14s18 4 22 14" fill="none" stroke="#6aaea0" stroke-width="2" />
        </svg>
      </div>

      <!-- 名前とメッセージ -->
      <div class="flex flex-col min-w-0 flex-1">
        <span class="text-gray-800 font-medium text-base truncate">{{ name }}</span>
        <span class="text-gray-500 text-sm truncate">{{ message }}</span>
      </div>
    </div>

    <!-- 右側（日付） -->
    <span class="text-gray-400 text-sm ml-3 flex-shrink-0">{{ date }}</span>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'
import { useRuntimeConfig } from '#app'

const router = useRouter()
const config = useRuntimeConfig()
const { getAccessToken } = useAuth()

const props = defineProps<{
  name: string
  message: string
  date: string
  avatarColor: string
  avatarUrl?: string | null
  chatId?: number
  partnerId?: string
}>()

// クリックしたらチャットページに飛ぶ
const goProfile = async () => {
  try {
    let targetChatId = props.chatId

    // チャットIDがない場合（新規チャット）、partnerIdを使ってチャットIDを取得
    if (!targetChatId && props.partnerId) {
      const token = await getAccessToken()
      if (!token) {
        console.error('認証トークンを取得できませんでした')
        return
      }

      try {
        const response = await $fetch<{ id: number }>(`${config.public.apiBaseUrl}/api/v1/chats/with/${props.partnerId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        targetChatId = response.id
      } catch (err: any) {
        console.error('チャットIDの取得に失敗しました:', err)
        // エラーが発生した場合でも、チャット画面に遷移を試みる（バックエンドで作成される可能性がある）
      }
    }

    // チャットIDがある場合はそれを使用、ない場合はpartnerIdをクエリパラメータとして渡す
    if (targetChatId) {
      router.push(`/chat/${targetChatId}`)
    } else if (props.partnerId) {
      router.push(`/chat?partnerId=${props.partnerId}`)
    } else {
      router.push('/chat')
    }
  } catch (error) {
    console.error('チャット画面への遷移に失敗しました:', error)
  }
}
</script>

<style scoped>
/* アバターの見た目を少し整えたい場合（任意） */
.rounded-full {
  border: 1px solid #ddd;
}
</style>

<style>
/* 全体・共通に使いたいフォントとかをここに書く */
@import url('https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@400;500;700&display=swap');

.zen-maru {
  font-family: "Zen Maru Gothic", sans-serif;
}
</style>

