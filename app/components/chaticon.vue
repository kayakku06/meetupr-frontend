<template>
  <div class="flex items-center justify-between p-5 bg-[var(--meetupr-main)] hover:bg-gray-50 transition zen-maru cursor-pointer"
  @click="goChat">
    <!-- 左側（アバター＋名前＋メッセージ） -->
    <div class="flex items-center space-x-4 flex-1 min-w-0">
      <!-- アバター（クリックでプロフィールに遷移） -->
      <div 
        class="w-16 h-16 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
        :class="avatarUrl ? '' : avatarColor"
        @click.stop="goProfile"
      >
        <img v-if="avatarUrl" :src="avatarUrl" :alt="name || 'ユーザー'" class="w-full h-full object-cover" />
        <svg v-else viewBox="0 0 64 64" class="w-10 h-10" aria-hidden>
          <circle cx="32" cy="24" r="12" fill="none" stroke="#6aaea0" stroke-width="2" />
          <path d="M10 54c4-10 18-14 22-14s18 4 22 14" fill="none" stroke="#6aaea0" stroke-width="2" />
        </svg>
      </div>

      <!-- 名前とメッセージ -->
      <div class="flex flex-col min-w-0 flex-1">
        <span class="text-gray-800 font-medium text-lg truncate">{{ name }}</span>
        <span class="text-gray-500 text-base truncate">{{ message }}</span>
      </div>
    </div>

    <!-- 右側（日付と時刻） -->
    <div class="flex flex-col items-end ml-3 flex-shrink-0">
      <span class="text-gray-400 text-base">{{ date }}</span>
      <span v-if="time" class="text-gray-400 text-sm">{{ time }}</span>
    </div>
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
  time?: string
  avatarColor: string
  avatarUrl?: string | null
  chatId?: number
  partnerId?: string
}>()

// アバターをクリックしたらプロフィールページに飛ぶ
const goProfile = () => {
  if (props.partnerId) {
    router.push(`/other-profile?user_id=${props.partnerId}`)
  }
}

// クリックしたらチャットページに飛ぶ
const goChat = async () => {
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

