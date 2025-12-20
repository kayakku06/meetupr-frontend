<template>
  <ProfileHeader 
    class="fixed inset-x-0 top-0 z-50" 
    :title="user.name || t.profile.user" 
    :showBackButton="true" 
    @back="handleBack" 
  />
  <div class="min-h-screen pb-20 font-sans bg-[var(--meetupr-main)]">
    <main class="max-w-[420px] mx-2 sm:mx-auto p-5 pt-28 bg-transparent">
      <div v-if="isLoading" class="flex items-center justify-center py-8">
        <div class="text-[#4b3b2b]">{{ t.profile.loading }}</div>
      </div>
      <div v-else>
        <div class="flex items-center gap-3 mb-3">
          <div class="w-24 h-24 rounded-full flex items-center justify-center border-2 overflow-hidden"
            :class="['border-[var(--container-border-color)]', 'bg-[var(--meetupr-main)]']">
            <img v-if="user.avatarUrl" :src="user.avatarUrl" :alt="user.name || t.profile.user" class="w-full h-full object-cover" />
            <svg v-else viewBox="0 0 64 64" class="w-16 h-16" aria-hidden>
              <circle cx="32" cy="24" r="12" fill="none" stroke="#6aaea0" stroke-width="2" />
              <path d="M10 54c4-10 18-14 22-14s18 4 22 14" fill="none" stroke="#6aaea0" stroke-width="2" />
            </svg>
          </div>

          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <h2 class="m-0 text-lg text-[#2f5f56]">{{ user.name || t.profile.user }}</h2>
              <span v-if="user.flag" :class="['flag', `fi fi-${user.flag}`, 'w-6 h-6']"></span>
            </div>
            <button v-if="user.id" @click="sendMessage(user.id)"
              class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed"
              :class="['bg-[var(--meetupr-color-3)]']">
              {{ t.otherProfile.sendMessage }}
              <MessageCircle class="w-4 h-4" />
            </button>
          </div>
        </div>

      <div class="flex flex-col gap-3">
        <label class="flex flex-col gap-2">
          <div class="text-sm text-[#6a5a3b]">{{ t.otherProfile.faculty }}</div>
          <div class="px-2 py-2 bg-white border-2 rounded-md text-sm text-[#4b3b2b]"
            :class="['border-[var(--meetupr-sub)]']">{{ user.department }}</div>
        </label>

        <div class="flex flex-col gap-2">
          <div class="text-sm text-[#6a5a3b]">{{ t.otherProfile.gender }}</div>
          <div class="inline-flex items-center gap-1.5 text-sm text-[#4b3b2b]">
            <input
              type="radio"
              disabled
              :checked="!!user.gender"
              class="disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {{ user.gender || t.profile.notSet }}
          </div>
        </div>

        <label class="flex flex-col gap-2">
          <div class="text-sm text-[#6a5a3b]">{{ t.otherProfile.origin }}</div>
          <div class="px-2 py-2 bg-white border-2 rounded-md text-sm text-[#4b3b2b]"
            :class="['border-[var(--meetupr-sub)]']">{{ localizedOrigin }}</div>
        </label>

        <div class="flex flex-col gap-3">
          <div class="text-sm text-[#6a5a3b]">{{ t.otherProfile.language }}</div>

          <div class="flex flex-col gap-2">
            <div class="text-xs text-[#6a5a3b]">{{ t.otherProfile.nativeLanguage }}</div>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="(l, i) in user.nativeLanguages"
                :key="`native-${i}`"
                class="px-3 py-1 rounded-full text-sm bg-white"
                :class="['border-2', 'border-[var(--meetupr-sub)]', 'text-[#4b3b2b]']"
              >{{ l }}</span>
              <span v-if="!(Array.isArray(user.nativeLanguages) && user.nativeLanguages.length)" class="text-sm text-gray-400">{{ t.profile.notSet }}</span>
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <div class="text-xs text-[#6a5a3b]">{{ t.otherProfile.spokenLanguages }}</div>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="(l, i) in user.spokenLanguages"
                :key="`spoken-${i}`"
                class="px-3 py-1 rounded-full text-sm bg-white"
                :class="['border-2', 'border-[var(--meetupr-sub)]', 'text-[#4b3b2b]']"
              >{{ l }}</span>
              <span v-if="!(Array.isArray(user.spokenLanguages) && user.spokenLanguages.length)" class="text-sm text-gray-400">{{ t.profile.notSet }}</span>
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <div class="text-xs text-[#6a5a3b]">{{ t.otherProfile.learningLanguages }}</div>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="(l, i) in user.learningLanguages"
                :key="`learning-${i}`"
                class="px-3 py-1 rounded-full text-sm bg-white"
                :class="['border-2', 'border-[var(--meetupr-sub)]', 'text-[#4b3b2b]']"
              >{{ l }}</span>
              <span v-if="!(Array.isArray(user.learningLanguages) && user.learningLanguages.length)" class="text-sm text-gray-400">{{ t.profile.notSet }}</span>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <div class="text-sm text-[#6a5a3b]">{{ t.otherProfile.hobbies }}</div>
          <div class="flex flex-wrap gap-2">
            <span v-for="(h, i) in user.hobbies" :key="i" class="px-3 py-1 rounded-full text-sm bg-white"
              :class="['border-2', 'border-[var(--meetupr-sub)]', 'text-[#4b3b2b]']">{{ h }}</span>
          </div>
        </div>

        <label class="flex flex-col gap-2">
          <div class="text-sm text-[#6a5a3b]">{{ t.otherProfile.bio }}</div>
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
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useRuntimeConfig } from '#app'
import { useAuth } from '~/composables/useAuth'
import { getFlagCodeFromCountryCode, getCountryNameByLocale } from '~/utils/countryMapping'
import { getMajorLabel } from '~/utils/majorMapping'
import { getGenderLabel } from '~/utils/genderMapping'
import { getLanguageLabel } from '~/utils/languageMapping'
import { MessageCircle } from 'lucide-vue-next'
import Footer from '~/components/Footer.vue'
import ProfileHeader from '~/components/profile-header.vue'
import { useLocale } from '~/composables/useLocale'

const { t, locale } = useLocale()
const router = useRouter()
const route = useRoute()
const config = useRuntimeConfig()
const { getAccessToken } = useAuth()

// residenceコード（生データ）を保持
const residenceCode = ref('')

const user = ref({
  name: '',
  department: '',
  gender: '',
  origin: '',
  flag: '',
  languages: [],
  nativeLanguages: [],
  spokenLanguages: [],
  learningLanguages: [],
  hobbies: [],
  bio: '',
  id: '',
  avatarUrl: ''
})

// ロケールに応じて出身国名を取得
const localizedOrigin = computed(() => {
  return getCountryNameByLocale(residenceCode.value, locale.value) || residenceCode.value || ''
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

    const nativeLanguages = response.native_language
      ? [getLanguageLabel(response.native_language)].filter((l) => l != null && l !== '')
      : []
    const spokenLanguages = Array.isArray(response.spoken_languages)
      ? response.spoken_languages
          .map((l) => getLanguageLabel(l))
          .filter((l) => l != null && l !== '')
      : []
    const learningLanguages = Array.isArray(response.learning_languages)
      ? response.learning_languages
          .map((l) => getLanguageLabel(l))
          .filter((l) => l != null && l !== '')
      : []

    const languageLabels = [...new Set([...nativeLanguages, ...spokenLanguages, ...learningLanguages])]

    // residenceCodeを保存（ロケール切り替え時に使用）
    residenceCode.value = response.residence || ''

    // データを反映
    user.value = {
      name: response.username || '',
      department: getMajorLabel(response.major) || '',
      gender: getGenderLabel(response.gender) || '',
      origin: '', // localizedOriginを使用
      flag: getFlagCodeFromCountryCode(response.residence) || '',
      languages: languageLabels,
      nativeLanguages,
      spokenLanguages,
      learningLanguages,
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
      console.error('Chat ID not found')
      alert(t.otherProfile.chatStartError)
    }
  } catch (error) {
    console.error('Chat start error:', error)
    
    // エラーメッセージを表示
    let errorMessage = t.otherProfile.chatStartError
    if (error?.statusCode === 400) {
      errorMessage = t.otherProfile.cannotChatSelf
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
