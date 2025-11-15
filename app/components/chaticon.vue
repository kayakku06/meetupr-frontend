<template>
  <div class="flex items-center justify-between p-3 border-b border-gray-200 hover:bg-gray-50 transition zen-maru"
  @click="goProfile">
    <!-- 左側（アイコン＋名前＋メッセージ） -->
    <div class="flex items-center space-x-3">
      <!-- アバター -->
      <div :class="['w-10 h-10 rounded-full', avatarColor]"></div>

      <!-- 名前とメッセージ -->
      <div class="flex flex-col">
        <span class="text-gray-600 font-medium">{{ name }}</span>
        <span class="text-gray-600 text-sm">{{ message }}</span>
      </div>
    </div>

    <!-- 右側（日付） -->
    <span class="text-gray-400 text-sm">{{ date }}</span>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()

defineProps({
  name: String,
  message: String,
  date: String,
  avatarColor: String
})

// クリックしたら other-profile に飛ぶ
const goProfile = () => {
  router.push('/chat')
}
</script>

<style scoped>
/* アバターの見た目を少し整えたい場合（任意） */
.rounded-full {
  border: 1px solid #ddd;
}
</style>

<style>
/* 全体・共通に使いたいフォントとかをここに書く */
@import url('https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@400;500;700&display=swap');

.zen-maru {
  font-family: "Zen Maru Gothic", sans-serif;
}
</style>

