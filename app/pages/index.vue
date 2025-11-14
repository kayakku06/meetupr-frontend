<script setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const { isAuthenticated, isLoading } = useAuth()
const route = useRoute()
const config = useRuntimeConfig()

const email = ref('')
const password = ref('')
const emailError = ref('')

// 学内メールアドレスのバリデーション
const validateEmail = (emailValue) => {
  if (!emailValue) {
    emailError.value = '学内メールアドレスを入力してください'
    return false
  }
  if (!emailValue.endsWith('@ed.ritsumei.ac.jp')) {
    emailError.value = '@ed.ritsumei.ac.jpで終わる学内メールアドレスを入力してください'
    return false
  }
  emailError.value = ''
  return true
}

// メールアドレスの入力時にリアルタイムでバリデーション
watch(email, () => {
  if (email.value && !email.value.endsWith('@ed.ritsumei.ac.jp')) {
    emailError.value = '@ed.ritsumei.ac.jpで終わる学内メールアドレスを入力してください'
  } else {
    emailError.value = ''
  }
})

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
  if (!validateEmail(email.value)) {
    return
  }
  if (!password.value) {
    alert('パスワードを入力してください')
    return
  }
  
  try {
    // サーバーAPI経由でAuth0にログイン
    const response = await $fetch('/api/auth/login', {
      method: 'POST',
      body: {
        email: email.value,
        password: password.value
      }
    })

    if (response.success && response.idToken) {
      // Auth0のSDKが使用する形式でトークンを保存
      const audience = config.public.auth0Audience || `https://${config.public.auth0Domain}/api/v2/`
      const auth0CacheKey = `@@auth0spajs@@::${config.public.auth0ClientId}::${audience}::openid profile email`
      const cacheData = {
        body: {
          access_token: response.accessToken,
          id_token: response.idToken,
          expires_in: response.expiresIn,
          token_type: 'Bearer'
        },
        expiresAt: Date.now() + (response.expiresIn * 1000)
      }
      localStorage.setItem(auth0CacheKey, JSON.stringify(cacheData))
      
      // ページをリロードしてAuth0の状態を更新
      window.location.reload()
    }
  } catch (error: any) {
    alert(error.data?.message || 'ログインに失敗しました')
  }
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
                    <div class="w-52 h-52 rounded-full overflow-hidden">
                        <img 
                            src="/icon.png" 
                            alt="MeetUp+R ロゴ" 
                            class="w-full h-full object-cover"
                        />
                    </div>
                </div>
                <h1 class="text-4xl font-bold text-gray-800">
                    MeetUp+R
                </h1>
            </div>

            <!-- ログインフォーム -->
            <div v-if="!isLoading && !isAuthenticated" class="p-8 space-y-6">
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
                            placeholder="example@ed.ritsumei.ac.jp"
                            :class="[
                                'w-full px-4 py-3 border-[3px] rounded-md focus:outline-none focus:ring-2 focus:border-transparent',
                                emailError ? 'border-red-500 focus:ring-red-500' : 'border-[#FEBC6E] focus:ring-[#FEBC6E]'
                            ]"
                        />
                        <p v-if="emailError" class="mt-1 text-sm text-red-500">
                            {{ emailError }}
                        </p>
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
                            class="w-full px-4 py-3 border-[3px] border-[#FEBC6E] rounded-md focus:outline-none focus:ring-2 focus:ring-[#FEBC6E] focus:border-transparent"
                            required
                        />
                    </div>

                    <!-- ログインボタン -->
                    <button
                        type="submit"
                        class="w-full bg-selected text-white py-3 rounded-md font-semibold hover:bg-[#4a8079] transition-colors"
                    >
                        ログイン
                    </button>
                </form>

                <!-- 区切り線 -->
                <div class="border-t border-gray-300"></div>

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
