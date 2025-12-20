<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useAuth0 } from '@auth0/auth0-vue';
import { useLocale } from '~/composables/useLocale'
import LanguageSwitcher from '~/components/LanguageSwitcher.vue'

const { isAuthenticated, isLoading, login } = useAuth()
const route = useRoute()
const { t } = useLocale()

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
    emailError.value = t.value.login.emailRequired
    return false
  }
  if (!emailValue.endsWith('@ed.ritsumei.ac.jp')) {
    emailError.value = t.value.login.emailInvalid
    return false
  }
  emailError.value = ''
  return true
}

// メールアドレスの入力時にリアルタイムでバリデーション
watch(email, () => {
  if (email.value && !email.value.endsWith('@ed.ritsumei.ac.jp')) {
    emailError.value = t.value.login.emailInvalid
  } else {
    emailError.value = ''
  }
})

// 認証成功後のリダイレクト処理
watch([isLoading, isAuthenticated], async ([loading, authenticated]) => {
  if (!loading && authenticated && route.path === '/') {
    // 少し待機してからリダイレクト（Auth0のappStateが設定されるのを待つ）
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // リダイレクト先を決定
    let targetUrl = '/home'
    
    // クエリパラメータのredirectを確認
    const redirectParam = route.query.redirect as string
    if (redirectParam) {
      targetUrl = redirectParam
      console.log('[index] Redirecting to query param redirect:', targetUrl)
      navigateTo(targetUrl)
      return
    }
    
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
    alert(t.value.login.passwordRequired)
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
        alert(t.value.login.authConfigError + '\n\n' + (loginResponse.error_description || ''))
        return
      }
      
      // 認証情報が間違っている場合
      if (loginResponse.error === 'invalid_credentials') {
        password.value = '' // パスワードをクリア
        alert(loginResponse.error_description || t.value.login.invalidCredentials)
        return
      }
      
      const errorMessage = loginResponse.error_description || loginResponse.error || t.value.login.loginFailed
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
        
        // IDトークンをデコードしてユーザーIDを取得
        let userId = ''
        try {
          const idToken = loginResponse.id_token
          if (idToken) {
            const tokenParts = idToken.split('.')
            if (tokenParts.length === 3 && tokenParts[1]) {
              const payload = JSON.parse(atob(tokenParts[1]))
              userId = payload.sub || ''
            }
          }
        } catch (tokenError) {
          console.warn('[index] Failed to decode ID token:', tokenError)
        }
        
        // リダイレクト先を決定
        let targetUrl = '/home'
        
        // クエリパラメータのredirectを確認
        const redirectParam = route.query.redirect as string
        if (redirectParam) {
          targetUrl = redirectParam
        } else {
          // 新規登録からの遷移の場合は、/make-profileにリダイレクト
          const isNewSignup = localStorage.getItem('isNewSignup') === 'true'
          if (isNewSignup) {
            targetUrl = '/make-profile'
            localStorage.removeItem('isNewSignup')
          } else if (userId) {
            // Profileをチェックして、NULLの場合は/make-profileにリダイレクト
            try {
              const profileCheck = await $fetch<{ hasProfile?: boolean; hasCompleteProfile?: boolean; error?: string }>('/api/profile/check', {
                method: 'GET',
                query: {
                  user_id: userId
                }
              })
              
              // Profileが存在しない、または主要なフィールドがNULLの場合は/make-profileにリダイレクト
              if (!profileCheck.hasProfile || !profileCheck.hasCompleteProfile) {
                console.log('[index] Profile is incomplete, redirecting to /make-profile')
                targetUrl = '/make-profile'
              }
            } catch (profileError) {
              console.warn('[index] Failed to check profile (non-fatal):', profileError)
              // エラーが発生した場合は、デフォルトの/homeにリダイレクト
            }
          }
        }
        
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
      alert(t.value.login.authConfigError + '\n\n' + (errorData.error_description || ''))
      return
    }
    
    // 認証情報が間違っている場合
    if (errorData?.error === 'invalid_credentials') {
      password.value = '' // パスワードをクリア
      alert(errorData.error_description || t.value.login.invalidCredentials)
      return
    }
    
    // その他のエラー
    const errorMessage = errorData?.error_description || errorData?.error || errorData?.message || t.value.login.loginFailed
    alert(errorMessage)
  }
}

const handleSignUp = () => {
  // 新規登録ページに遷移（後で実装）
  navigateTo('/signup')
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-[var(--meetupr-main)] px-4">
        <!-- 言語切り替え -->
        <div class="absolute top-4 right-4">
          <LanguageSwitcher />
        </div>
        
        <div class="w-full max-w-md space-y-8">
            <!-- ロゴとタイトル -->
            <div class="text-center space-y-4">
                <!-- ロゴエリア -->
                <div class="flex justify-center mb-4">
                    <div class="w-56 h-56 rounded-full overflow-hidden">
                        <img 
                            src="/icon.png" 
                            :alt="t.header.logo" 
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
                            {{ t.login.universityEmail }}
                        </label>
                        <input
                            id="email"
                            v-model="email"
                            type="email"
                            :placeholder="t.login.emailPlaceholder"
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
                            {{ t.login.password }}
                        </label>
                        <input
                            id="password"
                            v-model="password"
                            type="password"
                            :placeholder="t.login.passwordPlaceholder"
                            class="w-full px-4 py-3 border-[3px] border-[var(--meetupr-sub)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--meetupr-sub)] focus:border-transparent"
                            required
                        />
                    </div>

                    <!-- ログインボタン -->
          <button
                        type="submit"
            class="w-full bg-[var(--meetupr-color-3)] text-white py-3 rounded-md font-semibold hover:bg-[#4a8079] transition-colors"
                    >
                        {{ t.login.loginButton }}
                    </button>
                </form>

                <!-- 区切り線 -->
                <div class="border-t border-gray-300"></div>

                <!-- 新規登録セクション -->
                <div class="text-center space-y-3">
                    <p class="text-sm text-gray-600">
                        {{ t.login.firstTime }}
                    </p>
          <button
            @click="handleSignUp"
            class="w-full bg-[var(--meetupr-color-3)] text-white py-3 rounded-md font-semibold hover:bg-[#4a8079] transition-colors"
          >
            {{ t.login.signupButton }}
          </button>
                </div>
            </div>

            <!-- 読み込み中 -->
            <div v-if="isLoading" class="text-center text-gray-500">
                {{ t.common.loading }}
            </div>
        </div>
    </div>
</template>

 
