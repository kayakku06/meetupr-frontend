<template>
  <div class="p-6 max-w-md mx-auto">
    <h1 class="text-lg mb-4">MeetDesireSlider テスト</h1>
    <MeetDesireSlider v-model="val" />
    <div class="mt-4 text-sm">選択値: <strong>{{ val }}</strong></div>
    <div class="mt-4 flex gap-2">
      <button @click="val = 1" class="px-3 py-1 rounded bg-gray-200">1にする</button>
      <button @click="val = 5" class="px-3 py-1 rounded bg-gray-200">5にする</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import MeetDesireSlider from '~/components/MeetDesireSlider.vue'
const val = ref(3)
</script>