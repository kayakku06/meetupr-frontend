<script setup>
import { LogIn } from 'lucide-vue-next'

const { isAuthenticated, isLoading, login } = useAuth()

const handleLogin = async () => {
  await login()
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
        <template v-else-if="!isAuthenticated">
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

