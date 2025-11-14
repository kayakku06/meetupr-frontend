<script setup>
import { ref, watch } from 'vue';

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const emailError = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')

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

// パスワードのバリデーション
const validatePassword = (passwordValue) => {
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
const validateConfirmPassword = (confirmPasswordValue) => {
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
    // サーバーAPI経由でAuth0に新規登録
    const response = await $fetch('/api/auth/signup', {
      method: 'POST',
      body: {
        email: email.value,
        password: password.value
      }
    })

    if (response.success) {
      alert('新規登録が完了しました。ログインページに移動します。')
      navigateTo('/')
    }
  } catch (error) {
    const errorMessage = error?.data?.message || '新規登録に失敗しました'
    alert(errorMessage)
  }
}

const handleBackToLogin = () => {
  navigateTo('/')
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
                            placeholder="8文字以上で入力"
                            :class="[
                                'w-full px-4 py-3 border-[3px] rounded-md focus:outline-none focus:ring-2 focus:border-transparent',
                                passwordError ? 'border-red-500 focus:ring-red-500' : 'border-[#FEBC6E] focus:ring-[#FEBC6E]'
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
                                confirmPasswordError ? 'border-red-500 focus:ring-red-500' : 'border-[#FEBC6E] focus:ring-[#FEBC6E]'
                            ]"
                        />
                        <p v-if="confirmPasswordError" class="mt-1 text-sm text-red-500">
                            {{ confirmPasswordError }}
                        </p>
                    </div>

                    <!-- 新規登録ボタン -->
                    <button
                        type="submit"
                        class="w-full bg-selected text-white py-3 rounded-md font-semibold hover:bg-[#4a8079] transition-colors"
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
                        class="w-full bg-selected text-white py-3 rounded-md font-semibold hover:bg-[#4a8079] transition-colors"
                    >
                        ログイン
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

