<script setup lang="ts">
import { Smile } from 'lucide-vue-next'
import LogoBubble from '~/components/guide-speech.vue'
import Button from '~/components/meetup-button.vue'
import MeetDesire from '~/components/guide-meetdesire.vue'

const router = useRouter()

function onBack() {
  router.push('/guide/guide-search2')  // 戻る先のページ
}

function onNext() {
  router.push('/guide/guide-chat2')      // 次へ先のページ
}

function onClose() {
  router.push('/home')     
}

</script>

<template>
    <h1 class="fixed top-8 left-1/2 -translate-x-1/2
       z-[999] text-white text-xl
       m-0 p-0 leading-none pointer-events-none">
        ＜使い方＞チャット画面
    </h1>

    <div class="relative h-screen bg-gray-50 overflow-hidden">

        <!-- チャット画面 -->
        <div class="h-full flex items-center justify-center">
            <div
                class="max-w-[420px] w-full mx-auto bg-white border rounded-xl shadow-md overflow-hidden flex flex-col h-full">

                <!-- ヘッダー -->
                <div class="bg-white border-b border-gray-200 px-4 py-3 pt-20 flex items-center justify-between">
                    <button class="text-gray-700">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <div class="flex-1 text-center">
                        <span class="text-lg font-medium text-black">ユーザー１</span>
                    </div>
                </div>

                <!-- ヘッダーの下に表示 -->
                <div class="relative z-50 bg-yellow-50 flex items-center justify-center mt-4 pointer-events-none">
                    <MeetDesire />
                </div>

                <!-- メッセージ -->
                <div class="flex-1 bg-[var(--meetupr-main)]" />

                <!-- 入力エリア -->
                <div class="bg-[var(--meetupr-sub)] px-4 py-4">
                    <div class="relative">
                        <input type="text" readonly placeholder="メッセージを入力"
                            class="w-full bg-yellow-50 border-2 border-orange-300 rounded-full px-6 pr-14 py-3 text-gray-800 placeholder-gray-500" />
                        <button class="absolute right-2 top-1/2 -translate-y-1/2
                     w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center">
                            <Smile class="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                </div>

            </div>
        </div>

        <!-- オーバーレイ -->
        <div class="fixed inset-0 bg-black/70 z-40 pointer-events-none"></div>
        <!-- LogoBubble（オーバーレイの上に固定） -->
        <div class="fixed inset-0 z-50 pointer-events-auto">
            <LogoBubble text="「会いたい度」はあなたにだけ見えます
            ボタンを押すと最小化できます" />
        </div>

        <!-- ボタン -->
        <div class="fixed inset-0 z-50 pointer-events-auto">
            <Button position="bottom" back-text="戻る" next-text="次へ" @back="onBack" @next="onNext" />
            <Button position="top-right" @close="onClose" />
        </div>

    </div>
</template>
