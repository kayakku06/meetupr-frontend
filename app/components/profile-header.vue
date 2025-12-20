<script setup>
import { BadgeQuestionMark, BadgeQuestionMarkIcon } from 'lucide-vue-next'
import { useLocale } from '~/composables/useLocale'
import LanguageSwitcher from '~/components/LanguageSwitcher.vue'

const { t } = useLocale()
</script>

<template>
  <header class="talk-header">
    <!-- ヘッダー -->
    <div class="bg-[var(--meetupr-main)]">
      <!-- ロゴとタイトル -->
      <div class="flex items-center justify-between">
        <!-- ロゴ -->
        <div class="flex items-center mt-2">
          <img src="/meetlogo.svg" :alt="t.header.logo" class="w-14 h-14 " />
        </div>

        <!-- タイトル"プロフィール" -->
        <h1
          class="text-2xl font-normal text-yellow-950 flex-1 text-center mt-10 flex items-center justify-center gap-2">
          {{ t.header.profile }}
          <NuxtLink to="/guide/guide-search1">
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