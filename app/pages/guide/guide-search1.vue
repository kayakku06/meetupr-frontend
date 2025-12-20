<script setup>
import GuideSearchUser from '~/components/guide-searchuser.vue'
import Footer from '~/components/Footer.vue'
import { Search, UserRoundPlus, ChevronUp } from 'lucide-vue-next'
import LogoBubble from '~/components/guide-speech.vue'
import Button from '~/components/meetup-button.vue'

const router = useRouter()

function onBack() {
  router.push('/home')  // 戻る先のページ
}

function onNext() {
  router.push('/guide/guide-search2')      // 次へ先のページ
}

function onClose() {
  router.push('/home')     
}

</script>

<template>
  <div class="fixed top-0 left-0 w-full flex flex-col items-center gap-2 sm:gap-4
          p-2 sm:p-4 pt-8 sm:pt-10 z-50">
    <h1 class="z-[100] text-white text-base sm:text-xl">＜使い方＞検索画面</h1>
    <!-- 検索ボックス（デザインのみ） -->
    <div class="bg-white border-[3px] border-[#FEBC6E] rounded-md shadow-lg p-2 sm:p-4
         absolute top-full left-0 mt-1 sm:mt-2 w-full z-50">
      <div>
        <div class="flex items-center justify-between mb-1"> <label
            class="text-sm font-semibold text-gray-800">検索</label>
          <ChevronUp class="w-5 h-5 cursor-pointer" />
        </div>
        <div
          class="flex items-center justify-between p-2 border-[3px] border-[#FEBC6E] rounded-md bg-white min-h-[46px]">
          <!-- 選択タグ（ダミー） -->
          <div class="flex flex-wrap gap-2"> <button
              class="bg-[#fceb96] text-gray-800 border border-[#FEBC6E] rounded-md px-3 py-1 text-sm"> 日本語 × </button>
            <button class="bg-[#fceb96] text-gray-800 border border-[#FEBC6E] rounded-md px-3 py-1 text-sm"> アメリカ ×
            </button>
          </div>
          <Search class="w-5 h-5 text-[#FEBC6E]" />
        </div>
      </div> <!-- カテゴリ & タグ（固定） -->
      <div class="mt-3">
        <div class="bg-white p-3 border-[3px] border-[#FEBC6E] rounded-md">
          <div class="flex gap-4 pb-3 border-b border-[#FEBC6E] mb-3"> <span
              class="text-[#FEBC6E] font-bold border-b-2 border-[#FEBC6E]"> 言語 </span> <span
              class="text-gray-600 font-medium"> 国 </span> </div> <!-- 言語タグ -->
          <div class="flex flex-wrap gap-2"> <button
              class="bg-[#fceb96] text-gray-400 border border-[#FEBC6E] rounded-md px-3 py-1 text-sm line-through"> 日本語
            </button> <button class="bg-white border border-[#FEBC6E] rounded-sm px-3 py-1 text-sm"> 英語 </button>
            <button class="bg-white border border-[#FEBC6E] rounded-sm px-3 py-1 text-sm"> 韓国語 </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- メイン（見た目完全固定） -->
  <main class="bg-[#FFF5C9] h-screen pt-[220px] sm:pt-[260px] pb-20 sm:pb-24 overflow-hidden">

    <!-- 中央コンテンツ（高さ固定） -->
    <div class="mx-auto max-w-md p-2 sm:p-4 space-y-2 h-[calc(100vh-300px)] sm:h-[calc(100vh-360px)] overflow-hidden">
      <GuideSearchUser v-for="i in 7" :key="i" />
    </div>
    <Footer class="fixed inset-x-0 bottom-0" />
    <div class="fixed inset-0 bg-black/70 pointer-events-none z-40"></div>
    <div class="min-h-screen">
      <LogoBubble text="学びたい言語や国を絞って
      検索できます
      気になる人はタップして
      プロフィールをみてみましょう!" />
    </div>

    <div class="relative z-50">
      <Button back-text="戻る" next-text="次へ" @back="onBack" @next="onNext" />
    </div>

    <div class="relative z-50">
      <Button position="bottom" back-text="戻る" next-text="次へ" @back="onBack" @next="onNext" />
    </div>

    <div class="relative z-50">
      <Button position="top-right" @close="onClose" />
    </div>

  </main>
</template>
