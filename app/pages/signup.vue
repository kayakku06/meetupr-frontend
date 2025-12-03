<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useAuth0 } from '@auth0/auth0-vue';

const { login, isAuthenticated, isLoading } = useAuth()
const route = useRoute()

// デバッグログ用のヘルパー関数(開発環境でのみ出力)
const isDev = process.env.NODE_ENV === 'development'
const debugLog = (...args: any[]) => {
  if (isDev) console.log('[signup]', ...args)
}
const debugError = (...args: any[]) => {
  if (isDev) console.error('[signup]', ...args)
}
const debugWarn = (...args: any[]) => {
  if (isDev) console.warn('[signup]', ...args)
}

// 認証成功後のリダイレクト処理
watch([isLoading, isAuthenticated], ([loading, authenticated]) => {
  if (!loading && authenticated && route.path === '/signup') {
    // 新規登録フラグを確認
    if (typeof window !== 'undefined') {
      const isNewSignup = localStorage.getItem('isNewSignup')
      if (isNewSignup === 'true') {
        debugLog('New signup detected, redirecting to /make-profile')
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
const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const emailError = ref('')
const usernameError = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')

// パスワード要件のチェック状態
const passwordChecks = ref({
  length: false,
  uppercase: false,
  lowercase: false,
  number: false
})

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
  // 大文字、小文字、数字を含むかチェック
  const hasUpperCase = /[A-Z]/.test(passwordValue)
  const hasLowerCase = /[a-z]/.test(passwordValue)
  const hasNumber = /[0-9]/.test(passwordValue)
  
  if (!hasUpperCase || !hasLowerCase || !hasNumber) {
    passwordError.value = 'パスワードは大文字・小文字・数字を全て含む必要があります'
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

// ユーザーネームのバリデーション
const validateUsername = (usernameValue: string) => {
  if (!usernameValue) {
    usernameError.value = 'ユーザーネームを入力してください'
    return false
  }
  if (usernameValue.length < 1) {
    usernameError.value = 'ユーザーネームは1文字以上で入力してください'
    return false
  }
  if (usernameValue.length > 15) {
    usernameError.value = 'ユーザーネームは15文字以下で入力してください'
    return false
  }
  // Auth0が許可している文字のみかチェック: 英数字、'_', '+', '-', '.', '!', '#', '$', ''', '^', '`', '~', '@'
  const allowedPattern = /^[a-zA-Z0-9_+\-\.!#$'^`~@]+$/
  if (!allowedPattern.test(usernameValue)) {
    usernameError.value = 'ユーザーネームは英数字と以下の文字のみ使用できます: _ + - . ! # $ \' ^ ` ~ @'
    return false
  }
  usernameError.value = ''
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

// パスワードの入力時にリアルタイムでバリデーション
watch(password, () => {
  if (password.value && password.value.length > 0) {
    const hasUpperCase = /[A-Z]/.test(password.value)
    const hasLowerCase = /[a-z]/.test(password.value)
    const hasNumber = /[0-9]/.test(password.value)
    
    // チェック状態を更新
    passwordChecks.value = {
      length: password.value.length >= 8,
      uppercase: hasUpperCase,
      lowercase: hasLowerCase,
      number: hasNumber
    }
    
    if (password.value.length < 8) {
      passwordError.value = 'パスワードは8文字以上で入力してください'
    } else if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      passwordError.value = 'パスワードは大文字・小文字・数字を全て含む必要があります'
    } else {
      passwordError.value = ''
    }
  } else {
    passwordError.value = ''
    // チェック状態をリセット
    passwordChecks.value = {
      length: false,
      uppercase: false,
      lowercase: false,
      number: false
    }
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

// ユーザーネームの入力時にリアルタイムでバリデーション
watch(username, () => {
  if (username.value && username.value.length > 15) {
    usernameError.value = 'ユーザーネームは15文字以下で入力してください'
  } else {
    usernameError.value = ''
  }
})

const handleSignUp = async () => {
  // バリデーション
  if (!validateEmail(email.value)) {
    return
  }
  if (!validateUsername(username.value)) {
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
      username: username.value,
      password: password.value
    }
    
    debugLog('Sending signup request:', { 
      email: requestBody.email, 
      username: requestBody.username,
      password: '***' 
    })
    
    // サーバーサイドAPIエンドポイントを呼び出してAuth0にユーザーを登録
    const response = await $fetch<{ success?: boolean; user?: { email: string; _id: string }; error?: string; error_description?: string; code?: string; message?: string }>('/api/auth/signup', {
      method: 'POST',
      body: requestBody
    })
    
    debugLog('Signup response:', response)

    if ('error' in response && response.error) {
      // エラーハンドリング
      debugError('Signup API error response:', response)
      
      if (response.error === 'user_exists') {
        emailError.value = 'このメールアドレスは既に登録されています'
      } else {
        // エラーメッセージを確認
        const errorDescription = ('error_description' in response && response.error_description) || response.error
        const errorDescriptionStr = typeof errorDescription === 'string' ? errorDescription : JSON.stringify(errorDescription)
        
        // username関連のエラーかどうかを判定
        const isUsernameError = errorDescriptionStr.toLowerCase().includes('username') || 
                                 errorDescriptionStr.toLowerCase().includes('ユーザーネーム')
        
        if (isUsernameError) {
          usernameError.value = 'このユーザーネームは使用できません'
        } else {
          emailError.value = '登録に失敗しました。入力内容をご確認ください'
        }
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
        debugError('Login after signup failed:', loginResponse.error)
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
              const userName = username.value // 入力されたユーザーネームを使用
              
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
                  interests: [],
                  residence: null,
                  comment: null,
                  last_updated: new Date().toISOString()
                }
                
                debugLog('Registering user to Supabase:', initialPayload)
                
                try {
                  const profileResponse = await $fetch('/api/profile', {
                    method: 'POST',
                    body: initialPayload
                  })
                  
                  if (profileResponse && !('error' in profileResponse)) {
                    debugLog('User and profile registered successfully in Supabase')
                  } else {
                    debugWarn('Failed to register user to Supabase:', profileResponse)
                  }
                } catch (profileError) {
                  debugWarn('Error registering user to Supabase (non-fatal):', profileError)
                }
              }
            }
          } catch (tokenError) {
            debugWarn('Failed to decode ID token (non-fatal):', tokenError)
          }
          
          // ページをリロードしてAuth0のSDKに状態を認識させる
          window.location.href = '/make-profile'
          return
        }
      }
    } catch (loginError: any) {
      debugError('Login after signup error:', loginError)
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
    debugError('Signup error:', error)
    debugError('Error details:', {
      data: error.data,
      status: error.status,
      statusText: error.statusText
    })
    
    // $fetchのエラーレスポンスから詳細を取得
    const errorData = error.data || error.response?.data || error
    
    // エラーコードとメッセージを取得
    const errorCode = errorData?.code || errorData?.error
    const errorMessage = errorData?.message || errorData?.error_description || errorData?.error
    const errorMessageStr = typeof errorMessage === 'string' ? errorMessage : ''
    
    // エラーの種類に応じて適切なメッセージを表示
    if (errorCode === 'invalid_password' || errorMessageStr.toLowerCase().includes('password')) {
      passwordError.value = 'パスワードは8文字以上で、大文字・小文字・数字を全て含む必要があります'
    } else if (errorData?.error === 'user_exists' || errorData?.code === 'user_exists') {
      emailError.value = 'このメールアドレスは既に登録されています'
    } else if (errorData?.error === 'empty_body') {
      emailError.value = 'リクエストが正しく送信されませんでした。もう一度お試しください。'
    } else if (errorData?.error === 'email and password are required') {
      emailError.value = 'メールアドレスとパスワードを入力してください'
    } else if (errorMessageStr.toLowerCase().includes('username') || errorMessageStr.toLowerCase().includes('ユーザーネーム')) {
      usernameError.value = 'このユーザーネームは使用できません'
    } else {
      emailError.value = '登録に失敗しました。しばらく時間をおいてから再度お試しください。'
    }
  }
}

const handleBackToLogin = () => {
  navigateTo('/')
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-[var(--meetupr-main)] px-4">
        <div class="w-full max-w-md space-y-1">
            <!-- ロゴとタイトル -->
            <div class="text-center space-y-4">
                <!-- ロゴエリア -->
                <div class="flex justify-center mb-4">
                    <div class="w-48 h-48 rounded-full overflow-hidden">
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
                    <!-- ユーザーネーム入力欄 -->
                    <div>
                        <label for="username" class="block text-sm font-medium text-gray-700 mb-2">
                            ユーザーネーム
                        </label>
                        <input
                            id="username"
                            v-model="username"
                            type="text"
                            placeholder="ユーザーネームを入力（1-15文字）"
                            maxlength="15"
              :class="[
                'w-full px-4 py-3 border-[3px] rounded-md focus:outline-none focus:ring-2 focus:border-transparent',
                usernameError ? 'border-red-500 focus:ring-red-500' : 'border-[var(--meetupr-sub)] focus:ring-[var(--meetupr-sub)]'
              ]"
                        />
                        <p v-if="usernameError" class="mt-1 text-sm text-red-500">
                            {{ usernameError }}
                        </p>
                    </div>

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
                            placeholder="大文字・小文字・数字を含む8文字以上"
                            
              :class="[
                'w-full px-4 py-3 border-[3px] rounded-md focus:outline-none focus:ring-2 focus:border-transparent',
                passwordError ? 'border-red-500 focus:ring-red-500' : 'border-[var(--meetupr-sub)] focus:ring-[var(--meetupr-sub)]'
              ]"
                        />
                        <!-- パスワード要件チェックリスト -->
                        <div v-if="password.length > 0" class="mt-2 space-y-1">
                            <div class="flex items-center text-xs">
                                <input 
                                    type="checkbox" 
                                    :checked="passwordChecks.length" 
                                    disabled 
                                    class="mr-2 cursor-default"
                                    :class="passwordChecks.length ? 'accent-green-600' : 'accent-gray-400'"
                                />
                                <span :class="passwordChecks.length ? 'text-green-600' : 'text-gray-500'">
                                    8文字以上
                                </span>
                            </div>
                            <div class="flex items-center text-xs">
                                <input 
                                    type="checkbox" 
                                    :checked="passwordChecks.uppercase" 
                                    disabled 
                                    class="mr-2 cursor-default"
                                    :class="passwordChecks.uppercase ? 'accent-green-600' : 'accent-gray-400'"
                                />
                                <span :class="passwordChecks.uppercase ? 'text-green-600' : 'text-gray-500'">
                                    大文字(A-Z)を含む
                                </span>
                            </div>
                            <div class="flex items-center text-xs">
                                <input 
                                    type="checkbox" 
                                    :checked="passwordChecks.lowercase" 
                                    disabled 
                                    class="mr-2 cursor-default"
                                    :class="passwordChecks.lowercase ? 'accent-green-600' : 'accent-gray-400'"
                                />
                                <span :class="passwordChecks.lowercase ? 'text-green-600' : 'text-gray-500'">
                                    小文字(a-z)を含む
                                </span>
                            </div>
                            <div class="flex items-center text-xs">
                                <input 
                                    type="checkbox" 
                                    :checked="passwordChecks.number" 
                                    disabled 
                                    class="mr-2 cursor-default"
                                    :class="passwordChecks.number ? 'accent-green-600' : 'accent-gray-400'"
                                />
                                <span :class="passwordChecks.number ? 'text-green-600' : 'text-gray-500'">
                                    数字(0-9)を含む
                                </span>
                            </div>
                        </div>
                        <p v-else class="mt-1 text-xs text-gray-500">
                            ※ 大文字(A-Z)・小文字(a-z)・数字(0-9)を全て含む必要があります
                        </p>
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
            class="w-full bg-[var(--meetupr-color-3)] text-white py-3 rounded-md font-semibold hover:bg-[#4a8079] transition-colors"
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
            class="w-full bg-[var(--meetupr-color-3)] text-white py-3 rounded-md font-semibold hover:bg-[#4a8079] transition-colors"
          >
                        ログイン
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

