<script setup>
import { User, LogOut, LogIn } from 'lucide-vue-next'
import { ref, watch } from 'vue'

const { user, isAuthenticated, isLoading, login, logout } = useAuth()
const username = ref<string | null>(null)

// ユーザーが認証されている場合、Supabaseからusernameを取得
watch([user, isAuthenticated], async ([currentUser, authenticated]) => {
  // クライアントサイドでのみ実行
  if (!import.meta.client) return
  
  if (authenticated && currentUser?.sub) {
    try {
      const response = await $fetch('/api/users/username', {
        method: 'GET',
        query: {
          user_id: currentUser.sub
        }
      })
      
      // responseがオブジェクトで、usernameプロパティが存在することを確認
      if (response && response !== null && typeof response === 'object' && 'username' in response) {
        const fetchedUsername = response.username
        // usernameが存在し、空でないことを確認
        if (fetchedUsername) {
          username.value = String(fetchedUsername)
        } else {
          // usernameが取得できない場合は、emailをフォールバック
          username.value = currentUser.email || null
        }
      } else {
        // usernameが取得できない場合は、emailをフォールバック
        username.value = currentUser.email || null
      }
    } catch (error) {
      console.warn('[Header] Failed to fetch username:', error)
      // エラーが発生した場合は、emailをフォールバック
      username.value = currentUser.email || null
    }
  } else {
    username.value = null
  }
}, { immediate: true })

const handleLogin = async () => {
  await login()
}

const handleLogout = async () => {
  await logout({
    logoutParams: {
      returnTo: window.location.origin
    }
  })
}
</script>

<template>
  <header class="bg-[var(--meetupr-main)]">
    <div class="container mx-auto px-4 py-4 flex justify-between items-center">
      <div class="flex items-center space-x-4">
        <NuxtLink to="/" class="text-2xl font-bold text-primary">
          MeetUpr
        </NuxtLink>
      </div>
      
      <nav class="flex items-center space-x-4">
        <template v-if="isLoading">
          <div class="text-gray-500">読み込み中...</div>
        </template>
        <template v-else-if="isAuthenticated">
          <div class="flex items-center space-x-2">
            <User class="w-5 h-5 text-gray-600" />
            <span class="text-gray-700">{{ username || user?.name || user?.email }}</span>
          </div>
          <button
            @click="handleLogout"
            class="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            <LogOut class="w-4 h-4" />
            <span>ログアウト</span>
          </button>
        </template>
        <template v-else>
          <button
            @click="handleLogin"
            class="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded hover:bg-blue-600 transition-colors"
          >
            <LogIn class="w-4 h-4" />
            <span>ログイン</span>
          </button>
        </template>
      </nav>
    </div>
  </header>
</template>

