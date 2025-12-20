<script setup>
import GuideSearchUser from '~/components/guide-searchuser2.vue'
import Footer from '~/components/Footer.vue'
import { Search, UserRoundPlus, ChevronUp } from 'lucide-vue-next'
import LogoBubble from '~/components/guide-speech.vue'
import Button from '~/components/meetup-button.vue'

const router = useRouter()

function onBack() {
  router.push('/guide/guide-search1')  // 戻る先のページ
}

function onNext() {
  router.push('/guide/guide-chat1')      // 次へ先のページ
}

function onClose() {
  router.push('/home')     
}

</script>

<template>
    <h1 class="fixed top-8 left-1/2 -translate-x-1/2
         z-[999] text-white text-xl
         m-0 p-0 leading-none pointer-events-none">
        ＜使い方＞検索画面
    </h1>
    <div class="fixed top-0 left-0 translate-y-8 w-full
            flex flex-col items-center
            bg-[#FFF5C9] px-4 pb-4 pt-10
            z-40 border-b-2 border-[#3c938b]">

        <div
            class="p-2 bg-white border-2 border-[#f39a5e] rounded text-sm text-[#4b3b2b] min-h-[40px] w-64 flex items-center gap-2 cursor-pointer overflow-x-auto">
            <div class="flex items-center gap-1 flex-shrink-0">
                <Search class="w-5 h-5 text-[#FEBC6E]" /> <span>検索</span>
            </div> <!-- 選択タグ（ダミー） -->
            <div class="flex items-center gap-2 flex-wrap"> <span
                    class="bg-[#fceb96] border border-[#FEBC6E] rounded-md px-2 py-0.5 text-xs whitespace-nowrap"> 日本語
                </span>
                <span class="bg-[#fceb96] border border-[#FEBC6E] rounded-md px-2 py-0.5 text-xs whitespace-nowrap">
                    アメリカ
                </span>
            </div>
        </div> <!-- おすすめテキスト -->
        <div class="flex items-center gap-2 text-[#473c3c]">
            <UserRoundPlus class="w-5 h-5" /> <span>おすすめのプロフィールをチェックしよう！</span>
        </div>
    </div>
    <!-- メイン（見た目完全固定） -->
    <main class="bg-[#FFF5C9] h-screen pt-[160px] pb-24 overflow-hidden">
        <div class="fixed inset-0 bg-black/70 z-40 pointer-events-none"></div>

        <!-- 中央コンテンツ（高さ固定） -->
        <div class="mx-auto max-w-md p-4 space-y-2 overflow-hidden relative">
            <!-- ★ 明るくしたい1つ目 -->
            <div class="relative z-50">
                <GuideSearchUser />
            </div>

            <!-- 他は暗いまま -->
            <GuideSearchUser v-for="i in 4" :key="i" />
        </div>
        <Footer class="fixed inset-x-0 bottom-0" />
        <div class="min-h-screen">
            <LogoBubble text="出身（国旗）や趣味は
プロフィールを開かなくてもみれます!" />
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
