<script setup lang="ts">
import { Smile } from 'lucide-vue-next'
import LogoBubble from '~/components/guide-speech.vue'
import Button from '~/components/meetup-button.vue'
import MeetDesireIcon from '~/components/guide-meetdesire-icon.vue'

const router = useRouter()

function onBack() {
  router.push('/guide/guide-chat1')  // 戻る先のページ
}
function onNext() {
  router.push('/home') 
}

function onClose() {
  router.push('/home')     
}

</script>

<template>
    <h1 class="fixed top-6 sm:top-8 left-1/2 -translate-x-1/2
       z-[999] text-white text-base sm:text-xl
       m-0 p-0 leading-none pointer-events-none">
        ＜使い方＞チャット画面
    </h1>

    <div class="relative h-screen bg-gray-50 overflow-hidden">

        <!-- チャット画面 -->
        <div class="h-full flex items-center justify-center">
            <div
                class="max-w-[420px] w-full mx-auto bg-white border rounded-xl shadow-md overflow-hidden flex flex-col h-full">

                <!-- ヘッダー -->
                <div class="bg-white border-b border-gray-200 px-3 sm:px-4 py-2 sm:py-3 pt-16 sm:pt-20 flex items-center justify-between">
                    <button class="text-gray-700">
                        <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <div class="flex-1 text-center">
                        <span class="text-base sm:text-lg font-medium text-black">ユーザー１</span>
                    </div>
                </div>

                <!-- ヘッダーの下 -->
                <div class="relative z-50 flex justify-end mt-4 pointer-events-none pr-4">
                    <MeetDesireIcon />
                </div>


                <!-- メッセージ -->
                <div class="flex-1 bg-[var(--meetupr-main)]" />

                <!-- 入力エリア -->
                <div class="bg-[var(--meetupr-sub)] px-3 sm:px-4 py-3 sm:py-4">
                    <div class="relative">
                        <input type="text" readonly placeholder="メッセージを入力"
                            class="w-full bg-yellow-50 border-2 border-orange-300 rounded-full px-4 sm:px-6 pr-12 sm:pr-14 py-2 sm:py-3 text-sm sm:text-base text-gray-800 placeholder-gray-500" />
                        <button class="absolute right-2 top-1/2 -translate-y-1/2
                     w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center">
                            <Smile class="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                        </button>
                    </div>
                </div>

            </div>
        </div>

        <!-- オーバーレイ -->
        <div class="fixed inset-0 bg-black/70 z-40 pointer-events-none"></div>
        <!-- LogoBubble（オーバーレイの上に固定） -->
        <div class="fixed inset-0 z-50 pointer-events-auto">
            <LogoBubble text="押すとメーターが開き
            会いたい度を変更できます。
            いつでも変更OK!
            気持ちは変わっても大丈夫です!" />
        </div>

        <!-- ボタン -->
        <div class="fixed inset-0 z-50 pointer-events-auto">
            <Button position="bottom" back-text="戻る" next-text="終了" @back="onBack" @next="onNext" />
            <Button position="top-right" @close="onClose" />
        </div>

    </div>
</template>
