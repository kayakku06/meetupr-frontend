<script setup>
import { computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const isAuthPage = computed(() => route.path === '/' || route.path === '/signup')

// Auth0のコールバック処理
onMounted(() => {
  if (import.meta.client) {
    try {
      const auth0 = useAuth0()
      if (auth0) {
        // Auth0のコールバック処理を待機
        watch(() => auth0.isLoading?.value, async (loading) => {
          if (!loading && auth0.isAuthenticated?.value) {
            // appStateを確認
            if (auth0.appState?.value?.targetUrl) {
              const targetUrl = auth0.appState.value.targetUrl
              console.log('[app] Redirecting to appState targetUrl:', targetUrl)
              // 現在のパスが認証ページでない場合のみリダイレクト
              if (route.path === '/' || route.path === '/signup') {
                await router.push(targetUrl)
              }
            }
          }
        }, { immediate: true })
      }
    } catch (e) {
      console.warn('[app] Failed to handle Auth0 callback:', e)
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