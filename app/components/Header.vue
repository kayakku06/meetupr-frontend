<script setup>
import { LogIn } from 'lucide-vue-next'
import { useLocale } from '~/composables/useLocale'

const { isAuthenticated, isLoading, login } = useAuth()
const { t } = useLocale()

const handleLogin = async () => {
  await login()
}
</script>

<template>
  <header class="bg-[var(--meetupr-main)]" v-if="!isAuthenticated">
    <div class="container mx-auto px-4 py-4 flex justify-end items-center">
      <nav class="flex items-center space-x-4">
        <template v-if="isLoading">
          <div class="text-gray-500">{{ t.common.loading }}</div>
        </template>
        <template v-else>
          <button
            @click="handleLogin"
            class="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded hover:bg-blue-600 transition-colors"
          >
            <LogIn class="w-4 h-4" />
            <span>{{ t.common.login }}</span>
          </button>
        </template>
      </nav>
    </div>
  </header>
</template>

