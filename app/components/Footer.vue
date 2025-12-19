<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Search, MessageCircleMore, UserRound } from 'lucide-vue-next'

// Router（ページ遷移に必要）
const router = useRouter()
const route = useRoute()

// 現在のページによって初期設定を決める
const selected = ref('') 

const updateSelectedByRoute = () => {
  if (route.path === '/search') {
    selected.value = 'search'
  } else if (route.path === '/my-profile') {
    selected.value = 'user'
  } else {
    // /home など → チャット（message）
    selected.value = 'message'
  }
}

// 初期実行
updateSelectedByRoute()

// ページ遷移したら自動で更新
watch(() => route.path, () => {
  updateSelectedByRoute()
})

// --- ボタン押したとき --- //
const onSearch = () => {
  console.log('[Footer] Search button clicked')
  router.push('/search')
}
const onMessage = () => {
  console.log('[Footer] Message button clicked')
  router.push('/home')
}
const onUser = () => {
  console.log('[Footer] User button clicked')
  router.push('/my-profile')
}
</script>

<template>
  <div class="flex justify-around items-center p-3 relative z-50" :class="['bg-[var(--meetupr-sub)]']">
    
    <!-- 検索ボタン -->
    <button @click.stop="onSearch" class="p-2 transition relative z-10 cursor-pointer">
      <Search
        class="w-8 h-8"
        :class="selected === 'search' ? 'text-[var(--meetupr-color-3)]' : 'text-[var(--meetupr-main)]'"
      />
    </button>

    <!-- メッセージボタン -->
    <button @click.stop="onMessage" class="p-2 transition relative z-10 cursor-pointer">
      <MessageCircleMore
        class="w-8 h-8"
        :class="selected === 'message' ? 'text-[var(--meetupr-color-3)]' : 'text-[var(--meetupr-main)]'"
      />
    </button>

    <!-- ユーザーボタン -->
    <button @click.stop="onUser" class="p-2 transition relative z-10 cursor-pointer">
      <UserRound
        class="w-8 h-8"
        :class="selected === 'user' ? 'text-[var(--meetupr-color-3)]' : 'text-[var(--meetupr-main)]'"
      />
    </button>

  </div>
</template>

