<template>
  <div class="min-h-screen bg-[var(--meetupr-main)] pt-14 pb-20 font-['Noto_Sans_JP']">
    <!-- 固定ヘッダー -->
    <!-- <header class="fixed top-0 left-0 right-0 h-14 bg-white shadow-md z-40"></header> -->

    <!-- コンテンツ -->
    <main class="max-w-md mx-auto p-5">
      <div class="flex gap-3 items-center mb-3">
        <div class="w-20 h-20 rounded-full bg-[var(--meetup-color-3)] flex items-center justify-center border-2 border-[var(--meetupr-color-3)]">
          <svg viewBox="0 0 64 64" class="w-11 h-11" aria-hidden>
            <circle cx="32" cy="24" r="12" fill="none" stroke="#6aaea0" stroke-width="2" />
            <path d="M10 54c4-10 18-14 22-14s18 4 22 14" fill="none" stroke="#6aaea0" stroke-width="2" />
          </svg>
        </div>

        <div class="flex-1">
          <h2 class="m-0 mb-2 text-lg text-teal-900">{{ user.name }}</h2>
          <button
            class="border-[var(--meetupr-color-3)] text-white px-2.5 py-1.5 rounded-full inline-flex gap-1.5 items-center text-xs hover:border-[var(--meetupr-color-3)] transition bg-[var(--meetupr-color-3)]"
            @click="goMessage">
            メッセージ
            <MessageCircle :size="14" />
          </button>
        </div>
      </div>

      <div class="flex flex-col gap-3">
        <label class="flex flex-col gap-1">
          <div class="text-sm text-yellow-900">学部</div>
          <div class="border-2 border-[var(--meetupr-sub)] p-2 rounded bg-white text-sm text-amber-900">{{ user.department }}</div>
        </label>

        <fieldset class="flex flex-col gap-2">
          <legend class="text-xs text-amber-900">性別</legend>
          <div class="flex flex-col gap-1.5">
            <label class="inline-flex items-center gap-1.5 text-sm text-amber-900">
              <input type="radio" :checked="user.gender === '男性'" disabled />
              男性
            </label>
            <label class="inline-flex items-center gap-1.5 text-sm text-amber-900">
              <input type="radio" :checked="user.gender === '女性'" disabled />
              女性
            </label>
            <label class="inline-flex items-center gap-1.5 text-sm text-amber-900">
              <input type="radio" :checked="user.gender === 'その他'" disabled />
              その他
            </label>
          </div>
        </fieldset>

        <label class="flex flex-col gap-2">
          <div class="text-xs text-amber-900">出身</div>
          <div class="border-2 border-[var(--meetupr-sub)] p-2 rounded bg-white text-sm text-amber-900">{{ user.origin }}</div>
        </label>

        <div class="flex flex-col gap-4">
          <div class="text-xs text-amber-900">言語</div>
          <!-- ネイティブ -->
          <div class="flex flex-col gap-1">
            <div class="text-[10px] text-amber-700">ネイティブ</div>
            <div class="border-2 border-[var(--meetupr-sub)] p-2 rounded bg-white text-sm text-amber-900">{{ user.nativeLanguage }}</div>
          </div>
          <!-- 話せる言語 -->
          <div class="flex flex-col gap-1">
            <div class="text-[10px] text-amber-700">話せる言語</div>
            <div class="border-2 border-[var(--meetupr-sub)] p-2 rounded bg-white text-sm text-amber-900">{{ user.spokenLanguages }}</div>
          </div>
          <!-- 学びたい言語 -->
          <div class="flex flex-col gap-1">
            <div class="text-[10px] text-amber-700">学びたい言語</div>
            <div class="border-2 border-[var(--meetupr-sub)] p-2 rounded bg-white text-sm text-amber-900">{{ user.learningLanguages }}</div>
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <div class="text-xs text-amber-900">趣味</div>
          <div class="flex gap-2 flex-wrap">
            <!-- 統合したタグ表示 -->
            <template v-for="(h, i) in user.hobbies" :key="h + '-' + i">
              <div class="flex items-center bg-white border-2 border-[var(--meetupr-sub)] px-2.5 py-1.5 rounded-full text-xs text-amber-900">
                <span class="select-none">{{ h }}</span>
              </div>
            </template>
          </div>
        </div>

        <label class="flex flex-col gap-2">
          <div class="text-xs text-amber-900">一言（50文字以内）</div>
          <div class="border-2 border-[var(--meetupr-sub)] p-2 rounded bg-white text-sm text-amber-900 min-h-16 resize-none whitespace-pre-wrap break-words">{{ user.bio }}</div>
        </label>
      </div>
    </main>

    <!-- 固定フッター -->
    <Footer class="fixed inset-x-0 bottom-0" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Footer from '~/components/Footer.vue'
import { MessageCircle } from 'lucide-vue-next'

const user = ref({
  name: 'ユーザー1',
  department: '情報理工学部',
  gender: 'その他',
  origin: '日本',
  nativeLanguage: '日本語',
  spokenLanguages: '日本語、英語',
  learningLanguages: '韓国語、フランス語',
  hobbies: ['料理', '野球'],
  bio: 'よろしくお願いします！！'
})

function goMessage() {
  alert(`${user.value.name} さんにメッセージを送信しますか？`)
  // 実際はメッセージ画面に遷移
}
</script>