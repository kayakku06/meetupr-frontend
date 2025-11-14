<script setup>
import { Search, MessageCircleMore, UserRound } from 'lucide-vue-next'
</script>

<template>
  <div class="flex justify-around items-center p-3 border-t border-gray-200 bg-orange-300 zen-maru">
    <Search class="w-8 h-8 text-yellow-100" />
    <MessageCircleMore class="w-8 h-8 text-yellow-100" />
    <UserRound class="w-8 h-8 text-yellow-100" />
  </div>
</template>

<style>
/* フォント */
@import url('https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@400;500;700&display=swap');
.zen-maru { font-family: "Zen Maru Gothic", sans-serif; }
</style>
