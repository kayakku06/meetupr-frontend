<script setup lang="ts">
import { useLocale } from '~/composables/useLocale'

const { locale, setLocale } = useLocale()

// 言語を切り替える関数
const toggleLocale = (newLocale: 'ja' | 'en') => {
  setLocale(newLocale)
}
</script>

<template>
  <div class="flex items-center font-bold text-lg tracking-wider select-none">
    <button
      @click="toggleLocale('ja')"
      :class="[
        'transition-colors duration-200',
        locale === 'ja' ? 'text-[var(--meetupr-sub)]' : 'text-gray-400 hover:text-gray-600'
      ]"
    >
      JP
    </button>

    <span class="mx-2 text-gray-400 font-light">/</span>

    <button
      @click="toggleLocale('en')"
      :class="[
        'transition-colors duration-200',
        locale === 'en' ? 'text-[var(--meetupr-sub)]' : 'text-gray-400 hover:text-gray-600'
      ]"
    >
      EN
    </button>
  </div>
</template>

<style scoped>
/* 必要に応じてフォントサイズやマージンを微調整してください */
button {
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
}
</style>