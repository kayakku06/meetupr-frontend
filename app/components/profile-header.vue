<script setup>
import { BadgeQuestionMark, BadgeQuestionMarkIcon } from 'lucide-vue-next'
import { useLocale } from '~/composables/useLocale'
import LanguageSwitcher from '~/components/LanguageSwitcher.vue'

const { t } = useLocale()

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  showBackButton: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['back'])

const handleBack = () => {
  emit('back')
}
</script>

<template>
  <header class="talk-header">
    <!-- ヘッダー -->
    <div class="bg-[var(--meetupr-main)]">
      <!-- ロゴとタイトル -->
      <div class="flex items-center justify-between">
        <!-- 戻るボタン（showBackButton=trueの場合）またはロゴ -->
        <div class="flex items-center mt-2">
          <button v-if="showBackButton" @click="handleBack" class="text-gray-700 hover:text-gray-900 p-2">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
          <img v-else src="/meetlogo.svg" :alt="t.header.logo" class="w-14 h-14 " />
        </div>

        <!-- タイトル（カスタムタイトルまたはデフォルトの"プロフィール"） -->
        <h1
          class="text-2xl font-normal text-yellow-950 flex-1 text-center mt-10 flex items-center justify-center gap-2">
          {{ title || t.header.profile }}
          <NuxtLink v-if="!title" to="/guide/guide-search1">
            <BadgeQuestionMarkIcon class="w-5 h-5" />
          </NuxtLink>
        </h1>


        <!-- 右側：言語切り替え -->
        <div class="mt-2 mr-2">
          <LanguageSwitcher />
        </div>
      </div>

      <!-- 緑の線 -->
      <div class="mt-3 h-0.5 bg-[var(--meetupr-color-3)]"></div>
    </div>
  </header>
</template>