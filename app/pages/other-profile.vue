<template>
  <div class="min-h-screen pb-20 font-sans bg-[var(--meetupr-main)]">
    <header class="h-9">
      <button @click="handleBack" class="text-gray-700 hover:text-gray-900">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7">
          </path>
        </svg>
      </button>

    </header>

    <main class="max-w-[420px] mx-2 sm:mx-auto p-5 bg-transparent">
      <div class="flex items-center gap-3 mb-3">
        <div class="w-18 h-18 rounded-full flex items-center justify-center border-2"
          :class="['border-[var(--container-border-color)]', 'bg-[var(--meetupr-main)]']">
          <svg viewBox="0 0 64 64" class="w-11 h-11" aria-hidden>
            <circle cx="32" cy="24" r="12" fill="none" stroke="#6aaea0" stroke-width="2" />
            <path d="M10 54c4-10 18-14 22-14s18 4 22 14" fill="none" stroke="#6aaea0" stroke-width="2" />
          </svg>
        </div>

        <div class="flex-1">
          <h2 class="m-0 mb-2 text-lg text-[#2f5f56]">{{ user.name }}</h2>
          <button @click="sendMessage(user.id)"
            class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm text-white"
            :class="['bg-[var(--meetupr-color-3)]']">
            <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden>
              <path
                d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm4 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h12v14z"
                fill="#fff" />
            </svg>
            メッセージ
          </button>
        </div>
      </div>

      <div class="flex flex-col gap-3">
        <label class="flex flex-col gap-2">
          <div class="text-sm text-[#6a5a3b]">学部</div>
          <div class="px-2 py-2 bg-white border-2 rounded-md text-sm text-[#4b3b2b]"
            :class="['border-[var(--meetupr-sub)]']">{{ user.department }}</div>
        </label>

        <fieldset class="flex flex-col gap-2">
          <legend class="text-sm text-[#6a5a3b]">性別</legend>
          <div class="flex gap-3 text-sm text-[#4b3b2b]">
            <span v-for="g in ['男性', '女性', 'その他']" :key="g" class="flex items-center gap-2">
              <input type="radio" :checked="user.gender === g" disabled />
              <span>{{ g }}</span>
            </span>
          </div>
        </fieldset>

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
          <div class="text-sm text-[#6a5a3b]">一言（50文字以内）</div>
          <div
            class="px-2 py-2 bg-white border-2 rounded-md text-sm text-[#4b3b2b] min-h-[60px] whitespace-pre-wrap break-words"
            :class="['border-[var(--meetupr-sub)]']">{{ user.bio }}</div>
        </label>
      </div>
    </main>

    <!-- footer は共通コンポーネントを利用 -->
    <Footer class="fixed inset-x-0 bottom-0" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Footer from '~/components/Footer.vue'

const user = ref({
  name: 'ユーザー1',
  department: '情報理工学部',
  gender: 'その他',
  origin: '日本',
  languages: ['日本語', '日本語、英語', '韓国語、フランス語'],
  hobbies: ['料理', '野球'],
  bio: 'よろしくお願いします！！'
})

const router = useRouter()

const sendMessage = (chatId) => {
  router.push(`/chat/${chatId}`)
}

// 戻るボタンの処理
const handleBack = () => {
  router.back()
}

</script>