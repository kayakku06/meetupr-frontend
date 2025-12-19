<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'
import { useRuntimeConfig } from '#app'

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const { getAccessToken } = useAuth()

onMounted(async () => {
  const partnerId = route.query.partnerId as string | undefined
  const chatIdFromQuery = route.query.chatId as string | undefined

  // クエリパラメータからチャットIDを取得
  if (chatIdFromQuery) {
    const parsed = parseInt(chatIdFromQuery, 10)
    if (!isNaN(parsed)) {
      router.replace(`/chat/${parsed}`)
      return
    }
  }

  // partnerIdからチャットIDを取得
  if (partnerId) {
    try {
      const token = await getAccessToken()
      if (!token) {
        router.replace('/home')
        return
      }

      const response = await $fetch<{ id: number }>(`${config.public.apiBaseUrl}/api/v1/chats/with/${partnerId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      router.replace(`/chat/${response.id}`)
    } catch (err: any) {
      console.error('チャットIDの取得に失敗しました:', err)
      router.replace('/home')
    }
  } else {
    // partnerIdもchatIdもない場合はホームにリダイレクト
    router.replace('/home')
  }
})
</script>

<template>
  <div class="flex items-center justify-center h-screen">
    <p class="text-gray-500">チャットを読み込み中...</p>
  </div>
</template>
