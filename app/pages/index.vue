<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useAuth0 } from '@auth0/auth0-vue';

const { isAuthenticated, isLoading, login } = useAuth()
const route = useRoute()

const email = ref('')
const password = ref('')
const emailError = ref('')

// クエリパラメータからメールアドレスを取得（新規登録からの遷移時）
if (import.meta.client) {
  const query = route.query
  if (query.email) {
    email.value = query.email as string
  }
  // 新規登録からの遷移の場合は、新規登録フラグを設定
  if (query.fromSignup === 'true') {
    if (typeof window !== 'undefined') {
      localStorage.setItem('isNewSignup', 'true')
    }
  }
}

// 学内メールアドレスのバリデーション
const validateEmail = (emailValue: string) => {
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

// 認証成功後のリダイレクト処理
watch([isLoading, isAuthenticated], async ([loading, authenticated]) => {
  if (!loading && authenticated && route.path === '/') {
    // 少し待機してからリダイレクト（Auth0のappStateが設定されるのを待つ）
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // 新規登録フラグを確認
    if (typeof window !== 'undefined') {
      const isNewSignup = localStorage.getItem('isNewSignup')
      if (isNewSignup === 'true') {
        console.log('[index] New signup detected, redirecting to /make-profile')
        localStorage.removeItem('isNewSignup') // フラグを削除
        navigateTo('/make-profile')
        return
      }
    }
    
    // Auth0のappStateを確認してリダイレクト先を決定
    try {
      const auth0 = useAuth0()
      if (auth0) {
        // appStateを確認
        const appState = (auth0 as any).appState?.value
        if (appState && appState.targetUrl) {
          console.log('[index] Redirecting to appState targetUrl:', appState.targetUrl)
          navigateTo(appState.targetUrl)
          return
        }
      }
    } catch (e) {
      console.warn('[index] Failed to check appState:', e)
    }
    
    // デフォルトは/homeにリダイレクト
    console.log('[index] Redirecting to /home (default)')
    navigateTo('/home')
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
    // サーバーサイドのログインAPIを呼び出してトークンを取得
    const loginResponse = await $fetch<{ success?: boolean; access_token?: string; id_token?: string; error?: string; error_description?: string }>('/api/auth/login', {
      method: 'POST',
      body: {
        email: email.value,
        password: password.value
      }
    })

    if ('error' in loginResponse && loginResponse.error) {
      // エラーハンドリング
      // ROPCが有効になっていない場合のエラー
      if (loginResponse.error === 'ropc_not_enabled') {
        alert('認証設定が正しくありません。Auth0 DashboardでROPC (Password Grant Type) を有効にしてください。\n\n詳細: ' + (loginResponse.error_description || ''))
        return
      }
      
      // 認証情報が間違っている場合
      if (loginResponse.error === 'invalid_credentials') {
        password.value = '' // パスワードをクリア
        alert(loginResponse.error_description || 'メールアドレスまたはパスワードが正しくありません')
        return
      }
      
      const errorMessage = loginResponse.error_description || loginResponse.error || 'ログインに失敗しました'
      alert(errorMessage)
      return
    }

    // トークンを取得できた場合、Auth0のSDKにセッションを設定
    if (loginResponse.access_token && loginResponse.id_token) {
      const config = useRuntimeConfig()
      // Auth0のSDKが使用するlocalStorageのキーにトークンを保存
      const scope = 'openid profile email'
      const auth0CacheKey = `@@auth0spajs@@::${config.public.auth0ClientId}::${config.public.auth0Domain}::${scope}`
      const cacheData = {
        body: {
          access_token: loginResponse.access_token,
          id_token: loginResponse.id_token,
          expires_in: 86400, // 24時間
          token_type: 'Bearer',
          scope: scope
        },
        expiresAt: Math.floor(Date.now() / 1000) + 86400 // Unix timestamp
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem(auth0CacheKey, JSON.stringify(cacheData))
        
        // 新規登録からの遷移の場合は、/make-profileにリダイレクト
        const isNewSignup = localStorage.getItem('isNewSignup') === 'true'
        const targetUrl = isNewSignup ? '/make-profile' : '/home'
        
        // ページをリロードしてAuth0のSDKに状態を認識させる
        window.location.href = targetUrl
        return
      }
    }
  } catch (error: any) {
    console.error('Login error:', error)
    console.error('Login error data:', error.data)
    console.error('Login error status:', error.status)
    
    const errorData = error.data || error.response?.data || error
    
    // ROPCが有効になっていない場合のエラー
    if (errorData?.error === 'ropc_not_enabled') {
      alert('認証設定が正しくありません。Auth0 DashboardでROPC (Password Grant Type) を有効にしてください。\n\n詳細: ' + (errorData.error_description || ''))
      return
    }
    
    // 認証情報が間違っている場合
    if (errorData?.error === 'invalid_credentials') {
      password.value = '' // パスワードをクリア
      alert(errorData.error_description || 'メールアドレスまたはパスワードが正しくありません')
      return
    }
    
    // その他のエラー
    const errorMessage = errorData?.error_description || errorData?.error || errorData?.message || 'ログインに失敗しました。もう一度お試しください。'
    alert(errorMessage)
  }
}

const handleSignUp = () => {
  // 新規登録ページに遷移（後で実装）
  navigateTo('/signup')
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-color)] px-4">
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
                    'w-full px-4 py-3 border-[3px] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--meetupr-sub)] focus:border-transparent',
                    emailError ? 'border-red-500 focus:ring-red-500' : 'border-[var(--meetupr-sub)] focus:ring-[var(--meetupr-sub)]'
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
                            class="w-full px-4 py-3 border-[3px] border-[var(--meetupr-sub)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--meetupr-sub)] focus:border-transparent"
                            required
                        />
                    </div>

                    <!-- ログインボタン -->
          <button
                        type="submit"
            class="w-full bg-[var(--meetupr-color-3)] text-white py-3 rounded-md font-semibold hover:bg-[#4a8079] transition-colors"
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
            class="w-full bg-[var(--meetupr-color-3)] text-white py-3 rounded-md font-semibold hover:bg-[#4a8079] transition-colors"
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

 
