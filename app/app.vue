<script setup>
import { computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth0 } from '@auth0/auth0-vue'

const route = useRoute()
const router = useRouter()
const isAuthPage = computed(() => route.path === '/' || route.path === '/signup')

// 認証成功後のリダイレクト処理
onMounted(() => {
  if (import.meta.client) {
    try {
      const auth0 = useAuth0()
      
      // 認証成功を監視して、appStateからtargetUrlを取得してリダイレクト
      watch(() => auth0.isAuthenticated.value, (isAuthenticated) => {
        if (isAuthenticated) {
          // appStateからtargetUrlを取得
          const appState = (auth0 as any).appState?.value
          if (appState?.targetUrl) {
            const targetUrl = appState.targetUrl
            // appStateをクリア
            ;(auth0 as any).appState.value = null
            // リダイレクト
            router.push(targetUrl)
          }
        }
      }, { immediate: true })
    } catch (error) {
      // Auth0が初期化されていない場合は無視
      console.warn('Auth0 redirect handler not initialized:', error)
    }
  }
})
</script>

<template>
  <div>
    <Header v-if="!isAuthPage" />
    <NuxtPage />
  </div>
</template>