<script setup>
import { ref, nextTick } from 'vue'
import { Smile, Send } from 'lucide-vue-next'

const message = ref('')
const messages = ref([
    { id: 1, from: 'other', text: 'ああああああああああああああああああ' },
    { id: 2, from: 'me', text: 'tesuto' }
])

const messagesContainer = ref(null)

const scrollToBottom = async () => {
    await nextTick()
    if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
}

const sendMessage = async () => {
    if (!message.value.trim()) return
    messages.value.push({ id: Date.now(), from: 'me', text: message.value })
    message.value = ''
    await scrollToBottom()
}
</script>

<template>
    <div class="h-screen flex items-center justify-center bg-gray-50">
        <div
            class="max-w-[420px] w-full mx-auto bg-white border rounded-xl shadow-md overflow-hidden flex flex-col h-full">
            <div class="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between">
                <div class="flex items-center space-x-4">
                    <button class="text-gray-700 hover:text-gray-900">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7">
                            </path>
                        </svg>
                    </button>
                    <div class="flex items-center space-x-2">
                        <span class="text-lg font-medium text-gray-800">ユーザー1</span>
                        <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7">
                            </path>
                        </svg>
                    </div>
                </div>
                <button class="text-[var(--meetupr-main)] hover:text-orange-600">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z">
                        </path>
                    </svg>
                </button>
            </div>

            <div ref="messagesContainer" class="flex-1 overflow-y-auto bg-[var(--meetupr-main)] p-4 space-y-4">
                <template v-for="msg in messages" :key="msg.id">
                    <div v-if="msg.from === 'other'" class="flex items-start space-x-3">
                        <div class="w-10 h-10 rounded-full bg-gray-500 flex-shrink-0"></div>
                        <div class="space-y-2 max-w-[75%]">
                            <div class="bg-[var(--chat-other-color)] rounded-2xl rounded-tl-sm px-4 py-3">
                                <p class="text-gray-800 text-sm leading-relaxed" v-html="msg.text"></p>
                            </div>
                            <p class="text-xs text-gray-500 px-2">just now</p>
                        </div>
                    </div>
                    <div v-else class="flex justify-end">
                        <div class="max-w-[75%]">
                            <div class="bg-[var(--chat-my-color)] rounded-2xl rounded-tr-sm px-4 py-3">
                                <p class="text-white text-sm leading-relaxed" v-html="msg.text"></p>
                            </div>
                            <p class="text-xs text-gray-500 text-right px-2 mt-1">just now</p>
                        </div>
                    </div>
                </template>
            </div>

            <div class="bg-[var(--meetupr-sub)] px-4 py-4">
                <div class="flex items-center space-x-3">

                    <div class="flex-1 relative">
                        <input v-model="message" @keydown.enter.prevent="sendMessage" type="text" placeholder="メッセージを入力"
                            class="w-full bg-yellow-50 border-2 border-orange-300 rounded-full px-6 pr-12 py-3 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-orange-400 transition-colors" />
                        <button class="text-gray-500 hover:text-gray-700 absolute right-4 top-1/2 -translate-y-1/2">
                            <Smile class="w-7 h-7" />
                        </button>
                    </div>
                    <button @click="sendMessage" class="ml-2 bg-orange-400 text-white rounded-full px-4 py-2 hover:bg-orange-500 flex items-center justify-center">
                        <Send class="w-5 h-5" />
                    </button>

                </div>
            </div>

        </div>
    </div>
</template>
