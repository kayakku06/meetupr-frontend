<script setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const { isAuthenticated, isLoading, login } = useAuth()
const route = useRoute()

const email = ref('')
const password = ref('')

// isLoadingがfalseになったら、認証状態をチェックしてリダイレクト
watch([isLoading, isAuthenticated], ([loading, authenticated]) => {
  if (!loading && authenticated) {
    const redirectPath = typeof route.query.redirect === 'string' 
      ? route.query.redirect 
      : '/home';
    navigateTo(redirectPath);
  }
}, { immediate: true })

const handleLogin = async () => {
  // バリデーション
  if (!email.value || !password.value) {
    alert('学内メールアドレスとパスワードを入力してください')
    return
  }
  
  // Auth0のログインにリダイレクト（実際の実装では、バックエンドAPIと連携する必要があります）
  await login()
}

const handleSignUp = () => {
  // 新規登録ページに遷移（後で実装）
  navigateTo('/signup')
}
</script>

<template>
    <div class="min-h-screen flex flex-col items-center justify-center bg-basebg px-4">
        <div class="w-full max-w-md space-y-8">
            <!-- ロゴとタイトル -->
            <div class="text-center space-y-4">
                <!-- ロゴエリア -->
                <div class="flex justify-center mb-4">
                    <img 
                        src="/icon.png" 
                        alt="MeetUp+R ロゴ" 
                        class="w-40 h-40 rounded-full object-cover"
                    />
                </div>
                <h1 class="text-4xl font-bold text-gray-800">
                    MeetUp+R
                </h1>
            </div>

            <!-- ログインフォーム -->
            <div v-if="!isLoading && !isAuthenticated" class="bg-white rounded-lg shadow-md p-8 space-y-6">
                <form @submit.prevent="handleLogin" class="space-y-4">
                    <!-- 学内メールアドレス入力欄 -->
                    <div>
                        <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                            学内メールアドレス
                        </label>
                        <input
                            id="email"
                            v-model="email"
                            type="email"
                            placeholder="example@university.ac.jp"
                            class="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            required
                        />
                    </div>

                    <!-- パスワード入力欄 -->
                    <div>
                        <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
                            パスワード
                        </label>
                        <input
                            id="password"
                            v-model="password"
                            type="password"
                            placeholder="パスワードを入力"
                            class="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            required
                        />
                    </div>

                    <!-- ログインボタン -->
                    <button
                        type="submit"
                        class="w-full bg-primary text-white py-3 rounded-md font-semibold hover:bg-blue-600 transition-colors"
                    >
                        ログイン
                    </button>
                </form>

                <!-- 区切り線 -->
                <div class="relative">
                    <div class="absolute inset-0 flex items-center">
                        <div class="w-full border-t border-gray-300"></div>
                    </div>
                    <div class="relative flex justify-center text-sm">
                        <span class="px-2 bg-white text-gray-500">または</span>
                    </div>
                </div>

                <!-- 新規登録セクション -->
                <div class="text-center space-y-3">
                    <p class="text-sm text-gray-600">
                        初めての方はこちら
                    </p>
                    <button
                        @click="handleSignUp"
                        class="w-full bg-selected text-white py-3 rounded-md font-semibold hover:bg-[#4a8079] transition-colors"
                    >
                        新規登録
                    </button>
                </div>
            </div>

            <!-- 読み込み中 -->
            <div v-if="isLoading" class="text-center text-gray-500">
                読み込み中...
            </div>
        </div>
    </div>
</template>
