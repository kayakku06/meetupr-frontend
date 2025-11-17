<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useAuth0 } from '@auth0/auth0-vue';

const { login, isAuthenticated, isLoading } = useAuth()
const route = useRoute()

// 認証成功後のリダイレクト処理
watch([isLoading, isAuthenticated], ([loading, authenticated]) => {
  if (!loading && authenticated && route.path === '/signup') {
    // 新規登録フラグを確認
    if (typeof window !== 'undefined') {
      const isNewSignup = localStorage.getItem('isNewSignup')
      if (isNewSignup === 'true') {
        console.log('[signup] New signup detected, redirecting to /make-profile')
        localStorage.removeItem('isNewSignup') // フラグを削除
        navigateTo('/make-profile')
        return
      }
    }
    // 新規登録成功後は常に/make-profileにリダイレクト
    navigateTo('/make-profile')
  }
}, { immediate: true })

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const emailError = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')

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

// パスワードのバリデーション
const validatePassword = (passwordValue: string) => {
  if (!passwordValue) {
    passwordError.value = 'パスワードを入力してください'
    return false
  }
  if (passwordValue.length < 8) {
    passwordError.value = 'パスワードは8文字以上で入力してください'
    return false
  }
  passwordError.value = ''
  return true
}

// パスワード確認のバリデーション
const validateConfirmPassword = (confirmPasswordValue: string) => {
  if (!confirmPasswordValue) {
    confirmPasswordError.value = 'パスワード確認を入力してください'
    return false
  }
  if (confirmPasswordValue !== password.value) {
    confirmPasswordError.value = 'パスワードが一致しません'
    return false
  }
  confirmPasswordError.value = ''
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

// パスワード確認の入力時にリアルタイムでバリデーション
watch(confirmPassword, () => {
  if (confirmPassword.value && confirmPassword.value !== password.value) {
    confirmPasswordError.value = 'パスワードが一致しません'
  } else {
    confirmPasswordError.value = ''
  }
})

const handleSignUp = async () => {
  // バリデーション
  if (!validateEmail(email.value)) {
    return
  }
  if (!validatePassword(password.value)) {
    return
  }
  if (!validateConfirmPassword(confirmPassword.value)) {
    return
  }
  
  try {
    // リクエストボディを準備
    const requestBody = {
      email: email.value,
      password: password.value
    }
    
    console.log('[signup] Sending signup request:', { email: requestBody.email, password: '***' })
    
    // サーバーサイドAPIエンドポイントを呼び出してAuth0にユーザーを登録
    const response = await $fetch<{ success?: boolean; user?: { email: string; _id: string }; error?: string; error_description?: string; code?: string; message?: string }>('/api/auth/signup', {
      method: 'POST',
      body: requestBody
    })
    
    console.log('[signup] Signup response:', response)

    if ('error' in response && response.error) {
      // エラーハンドリング
      if (response.error === 'user_exists' || ('code' in response && (response.code === 'user_exists' || response.code === 'invalid_signup'))) {
        emailError.value = 'このメールアドレスは既に登録されています'
      } else {
        emailError.value = ('error_description' in response && response.error_description) || response.error || '登録に失敗しました'
      }
      return
    }

    // 新規登録フラグをlocalStorageに保存
    if (typeof window !== 'undefined') {
      localStorage.setItem('isNewSignup', 'true')
    }

    // 登録成功後、同じパスワードでサーバーサイドのログインAPIを呼び出してトークンを取得
    try {
      const loginResponse = await $fetch<{ success?: boolean; access_token?: string; id_token?: string; error?: string; error_description?: string }>('/api/auth/login', {
        method: 'POST',
        body: {
          email: email.value,
          password: password.value
        }
      })

      if ('error' in loginResponse && loginResponse.error) {
        console.error('Login after signup failed:', loginResponse.error)
        // 新規登録は成功しているが、自動ログインに失敗した場合
        // ユーザーに成功メッセージを表示して、ログインページに遷移
        alert('新規登録が完了しました。ログインページからログインしてください。')
        navigateTo({
          path: '/',
          query: {
            email: email.value,
            fromSignup: 'true'
          }
        })
        return
      }

      // トークンを取得できた場合、Auth0のSDKにセッションを設定
      // 注意: Auth0 Vue SDKはROPCを直接サポートしていないため、
      // トークンをlocalStorageに保存して、SDKが認識できるようにする
      if (loginResponse.access_token && loginResponse.id_token) {
        const config = useRuntimeConfig()
        // Auth0のSDKが使用するlocalStorageのキーにトークンを保存
        // キーの形式: @@auth0spajs@@::{clientId}::{domain}::{scope}
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
          
          // IDトークンをデコードしてユーザー情報を取得
          try {
            const idToken = loginResponse.id_token
            if (!idToken) {
              throw new Error('ID token is missing')
            }
            const tokenParts = idToken.split('.')
            if (tokenParts.length === 3 && tokenParts[1]) {
              const payload = JSON.parse(atob(tokenParts[1]))
              const userId = payload.sub || ''
              const userEmail = payload.email || email.value
              const userName = payload.nickname || payload.name || userEmail.split('@')[0]
              
              // Supabaseにユーザー情報を保存
              if (userId && userEmail && userName) {
                const initialPayload = {
                  user_id: userId,
                  email: userEmail,
                  username: userName,
                  major: null,
                  gender: null,
                  native_language: '日本語', // デフォルト値（NOT NULL制約のため）
                  spoken_languages: [],
                  learning_languages: [],
                  residence: null,
                  comment: null,
                  last_updated: new Date().toISOString()
                }
                
                console.log('[signup] Registering user to Supabase:', initialPayload)
                
                try {
                  const profileResponse = await $fetch('/api/profile', {
                    method: 'POST',
                    body: initialPayload
                  })
                  
                  if (profileResponse && !('error' in profileResponse)) {
                    console.log('[signup] User and profile registered successfully in Supabase')
                  } else {
                    console.warn('[signup] Failed to register user to Supabase:', profileResponse)
                  }
                } catch (profileError) {
                  console.warn('[signup] Error registering user to Supabase (non-fatal):', profileError)
                }
              }
            }
          } catch (tokenError) {
            console.warn('[signup] Failed to decode ID token (non-fatal):', tokenError)
          }
          
          // ページをリロードしてAuth0のSDKに状態を認識させる
          window.location.href = '/make-profile'
          return
        }
      }
    } catch (loginError: any) {
      console.error('Login after signup error:', loginError)
      // 新規登録は成功しているが、自動ログインに失敗した場合
      // ユーザーに成功メッセージを表示して、ログインページに遷移
      alert('新規登録が完了しました。ログインページからログインしてください。')
      navigateTo({
        path: '/',
        query: {
          email: email.value,
          fromSignup: 'true'
        }
      })
      return
    }
  } catch (error: any) {
    console.error('Signup error:', error)
    console.error('Signup error data:', error.data)
    console.error('Signup error status:', error.status)
    console.error('Signup error statusText:', error.statusText)
    
    // $fetchのエラーレスポンスから詳細を取得
    const errorData = error.data || error.response?.data || error
    const errorMessage = errorData?.message || errorData?.error_description || errorData?.error
    
    if (errorData?.error === 'user_exists' || errorData?.code === 'user_exists') {
      emailError.value = 'このメールアドレスは既に登録されています'
    } else if (errorData?.error === 'empty_body') {
      emailError.value = 'リクエストが正しく送信されませんでした。もう一度お試しください。'
    } else if (errorData?.error === 'email and password are required') {
      emailError.value = 'メールアドレスとパスワードを入力してください'
    } else if (errorMessage) {
      emailError.value = errorMessage
    } else {
      emailError.value = `登録に失敗しました。${error.status ? `(エラーコード: ${error.status})` : ''} もう一度お試しください。`
    }
  }
}

const handleBackToLogin = () => {
  navigateTo('/')
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

            <!-- 新規登録フォーム -->
            <div class="p-8 space-y-6">
                <form @submit.prevent="handleSignUp" class="space-y-4">
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
                            placeholder="8文字以上で入力"
              :class="[
                'w-full px-4 py-3 border-[3px] rounded-md focus:outline-none focus:ring-2 focus:border-transparent',
                passwordError ? 'border-red-500 focus:ring-red-500' : 'border-[var(--meetupr-sub)] focus:ring-[var(--meetupr-sub)]'
              ]"
                        />
                        <p v-if="passwordError" class="mt-1 text-sm text-red-500">
                            {{ passwordError }}
                        </p>
                    </div>

                    <!-- パスワード確認入力欄 -->
                    <div>
                        <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">
                            パスワード確認
                        </label>
                        <input
                            id="confirmPassword"
                            v-model="confirmPassword"
                            type="password"
                            placeholder="パスワードを再入力"
              :class="[
                'w-full px-4 py-3 border-[3px] rounded-md focus:outline-none focus:ring-2 focus:border-transparent',
                confirmPasswordError ? 'border-red-500 focus:ring-red-500' : 'border-[var(--meetupr-sub)] focus:ring-[var(--meetupr-sub)]'
              ]"
                        />
                        <p v-if="confirmPasswordError" class="mt-1 text-sm text-red-500">
                            {{ confirmPasswordError }}
                        </p>
                    </div>

                    <!-- 新規登録ボタン -->
          <button
            type="submit"
            class="w-full bg-[var(--meetupr-color-3)] text-white py-3 rounded-md font-semibold hover:bg-[var(--meetupr-color-3)] transition-colors"
          >
                        新規登録
                    </button>
                </form>

                <!-- 区切り線 -->
                <div class="border-t border-gray-300"></div>

                <!-- ログインセクション -->
                <div class="text-center space-y-3">
                    <p class="text-sm text-gray-600">
                        既にアカウントをお持ちの方はこちら
                    </p>
          <button
            @click="handleBackToLogin"
            class="w-full bg-[var(--meetupr-color-3))] text-white py-3 rounded-md font-semibold hover:bg-[(--meetupr-color-3))] transition-colors"
          >
                        ログイン
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

