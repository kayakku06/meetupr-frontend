<template>
  <div class="min-h-screen pb-20 font-sans bg-[var(--meetupr-main)]">
    <header class="h-9 fixed top-0 left-0 right-0 z-50 bg-[var(--meetupr-main)]">
      <button @click="handleBack" class="text-gray-700 hover:text-gray-900 p-2">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7">
          </path>
        </svg>
      </button>

    </header>

    <main class="max-w-[420px] mx-2 sm:mx-auto p-5 pt-16 bg-transparent">
      <div v-if="isLoading" class="flex items-center justify-center py-8">
        <div class="text-[#4b3b2b]">読み込み中...</div>
      </div>
      <div v-else>
        <div class="flex items-center gap-3 mb-3">
          <div class="w-24 h-24 rounded-full flex items-center justify-center border-2 overflow-hidden"
            :class="['border-[var(--container-border-color)]', 'bg-[var(--meetupr-main)]']">
            <img v-if="user.avatarUrl" :src="user.avatarUrl" :alt="user.name || 'ユーザー'" class="w-full h-full object-cover" />
            <svg v-else viewBox="0 0 64 64" class="w-16 h-16" aria-hidden>
              <circle cx="32" cy="24" r="12" fill="none" stroke="#6aaea0" stroke-width="2" />
              <path d="M10 54c4-10 18-14 22-14s18 4 22 14" fill="none" stroke="#6aaea0" stroke-width="2" />
            </svg>
          </div>

          <div class="flex-1">
            <h2 class="m-0 mb-2 text-lg text-[#2f5f56]">{{ user.name || 'ユーザー' }}</h2>
            <button v-if="user.id" @click="sendMessage(user.id)"
              class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed"
              :class="['bg-[var(--meetupr-color-3)]']">
              メッセージ
              <MessageCircle class="w-4 h-4" />
            </button>
          </div>
        </div>

      <div class="flex flex-col gap-3">
        <label class="flex flex-col gap-2">
          <div class="text-sm text-[#6a5a3b]">学部</div>
          <div class="px-2 py-2 bg-white border-2 rounded-md text-sm text-[#4b3b2b]"
            :class="['border-[var(--meetupr-sub)]']">{{ user.department }}</div>
        </label>

        <label class="flex flex-col gap-2">
          <div class="text-sm text-[#6a5a3b]">性別</div>
          <div class="px-2 py-2 bg-white border-2 rounded-md text-sm text-[#4b3b2b]"
            :class="['border-[var(--meetupr-sub)]']">{{ user.gender || '' }}</div>
        </label>

        <label class="flex flex-col gap-2">
          <div class="text-sm text-[#6a5a3b]">出身</div>
          <div class="px-2 py-2 bg-white border-2 rounded-md text-sm text-[#4b3b2b]"
            :class="['border-[var(--meetupr-sub)]']">{{ user.origin }}</div>
        </label>

        <div class="flex flex-col gap-2">
          <div class="text-sm text-[#6a5a3b]">言語</div>
          <div class="flex flex-wrap gap-2">
            <span v-for="(l, i) in user.languages" :key="i" class="px-3 py-1 rounded-full text-sm bg-white"
              :class="['border-2', 'border-[var(--meetupr-sub)]', 'text-[#4b3b2b]']">{{ l }}</span>
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <div class="text-sm text-[#6a5a3b]">趣味</div>
          <div class="flex flex-wrap gap-2">
            <span v-for="(h, i) in user.hobbies" :key="i" class="px-3 py-1 rounded-full text-sm bg-white"
              :class="['border-2', 'border-[var(--meetupr-sub)]', 'text-[#4b3b2b]']">{{ h }}</span>
          </div>
        </div>

        <label class="flex flex-col gap-2">
          <div class="text-sm text-[#6a5a3b]">一言</div>
          <div
            class="px-2 py-2 bg-white border-2 rounded-md text-sm text-[#4b3b2b] min-h-[60px] whitespace-pre-wrap break-words"
            :class="['border-[var(--meetupr-sub)]']">{{ user.bio }}</div>
        </label>
      </div>
      </div>
    </main>

    <!-- footer は共通コンポーネントを利用 -->
    <Footer class="fixed inset-x-0 bottom-0" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useRuntimeConfig } from '#app'
import { useAuth } from '~/composables/useAuth'
import { getJapaneseCountryName } from '~/utils/countryMapping'
import { getMajorLabel } from '~/utils/majorMapping'
import { MessageCircle } from 'lucide-vue-next'
import Footer from '~/components/Footer.vue'

const router = useRouter()
const route = useRoute()
const config = useRuntimeConfig()
const { getAccessToken } = useAuth()

const user = ref({
  name: '',
  department: '',
  gender: '',
  origin: '',
  languages: [],
  hobbies: [],
  bio: '',
  id: '',
  avatarUrl: ''
})

const isLoading = ref(true)

// プロフィールデータを取得
async function fetchProfile() {
  const userId = typeof route.query.user_id === 'string' ? route.query.user_id : Array.isArray(route.query.user_id) ? route.query.user_id[0] : null
  
  if (!userId) {
    console.error('User ID not found in query parameters')
    isLoading.value = false
    return
  }

  try {
    isLoading.value = true
    const response = await $fetch('/api/profile', {
      query: {
        user_id: userId
      }
    })

    if (response.error) {
      console.error('Error fetching profile:', response.error)
      isLoading.value = false
      return
    }

    // 言語を結合（母国語、話せる言語、学習中の言語）
    const allLanguages = []
    if (response.native_language) {
      allLanguages.push(response.native_language)
    }
    if (Array.isArray(response.spoken_languages)) {
      allLanguages.push(...response.spoken_languages)
    }
    if (Array.isArray(response.learning_languages)) {
      allLanguages.push(...response.learning_languages)
    }
    // 重複を削除
    const uniqueLanguages = [...new Set(allLanguages)]

    // データを反映
    user.value = {
      name: response.username || '',
      department: getMajorLabel(response.major) || '',
      gender: response.gender || '',
      origin: getJapaneseCountryName(response.residence) || response.residence || '',
      languages: uniqueLanguages,
      hobbies: Array.isArray(response.interests) ? response.interests.map((i) => i.name || i) : [],
      bio: response.comment || '',
      id: userId,
      avatarUrl: response.avatar_url || ''
    }
  } catch (error) {
    console.error('Failed to fetch profile:', error)
  } finally {
    isLoading.value = false
  }
}

const sendMessage = async (otherUserId) => {
  if (!otherUserId) {
    console.error('User ID not found')
    return
  }

  try {
    const token = await getAccessToken()
    if (!token) {
      alert('認証トークンを取得できませんでした。ログインしてください。')
      return
    }

    // チャット開始APIを呼び出してチャットIDを取得または作成
    const response = await $fetch(`${config.public.apiBaseUrl}/api/v1/chats/with/${otherUserId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    // レスポンスからchat_idを取得（API仕様に合わせてchat_idまたはidを確認）
    const chatId = response.chat_id || response.id
    
    if (chatId) {
      router.push(`/chat/${chatId}`)
    } else {
      console.error('チャットIDが取得できませんでした')
      alert('チャットの開始に失敗しました。')
    }
  } catch (error) {
    console.error('チャット開始エラー:', error)
    
    // エラーメッセージを表示
    let errorMessage = 'チャットの開始に失敗しました。'
    if (error?.statusCode === 400) {
      errorMessage = '自分自身とはチャットできません。'
    } else if (error?.data?.message) {
      errorMessage = error.data.message
    } else if (error?.message) {
      errorMessage = error.message
    }
    
    alert(errorMessage)
  }
}

// 戻るボタンの処理
const handleBack = () => {
  router.back()
}

// ページマウント時にデータを取得
onMounted(() => {
  fetchProfile()
})

</script>
