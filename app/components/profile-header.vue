<script setup>
import { BadgeQuestionMark, BadgeQuestionMarkIcon } from 'lucide-vue-next'
</script>

<template>
  <header class="talk-header">
    <!-- ヘッダー -->
    <div class="bg-[var(--meetupr-main)]">
      <!-- ロゴとタイトル -->
      <div class="flex items-center justify-between">
        <!-- ロゴ -->
        <div class="flex items-center mt-2">
          <img src="/meetlogo.svg" alt="MeetUp+R ロゴ" class="w-14 h-14 " />
        </div>

        <!-- タイトル"トーク" -->
        <h1
          class="text-2xl font-normal text-yellow-950 flex-1 text-center mt-10 flex items-center justify-center gap-2">
          プロフィール
          <NuxtLink to="/guide/guide-search1">
            <BadgeQuestionMarkIcon class="w-5 h-5" />
          </NuxtLink>
        </h1>


        <!-- 右側のスペーサー（ロゴとタイトルのバランスを取る） -->
        <div class="w-12"></div>
      </div>

      <!-- 緑の線 -->
      <div class="mt-3 h-0.5 bg-[var(--meetupr-color-3)]"></div>
    </div>
  </header>
</template>