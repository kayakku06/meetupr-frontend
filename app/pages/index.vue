<script setup>
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';

const { isAuthenticated, isLoading } = useAuth()
const route = useRoute()

onMounted(async () => {
  // ローディングが完了し、認証済みの場合はリダイレクト
  if (!isLoading.value && isAuthenticated.value) {
    const redirectPath = typeof route.query.redirect === 'string' 
      ? route.query.redirect 
      : '/home';
    await navigateTo(redirectPath);
  }
})
</script>

<template>
    <div class="min-h-screen flex flex-col items-center justify-center bg-basebg">
        <div class="text-center space-y-6">
            <h1 class="text-4xl font-bold text-gray-800">
                MeetUprへようこそ
            </h1>
            <p class="text-gray-600">
                ログインして始めましょう
            </p>
            <div v-if="isLoading" class="text-gray-500">
                読み込み中...
            </div>
            <div v-else-if="!isAuthenticated" class="space-y-4">
                <p class="text-sm text-gray-500">
                    認証が必要です。ヘッダーのログインボタンからログインしてください。
                </p>
            </div>
        </div>
    </div>
</template>
