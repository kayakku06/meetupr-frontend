<template>
  <div class="p-6 max-w-md mx-auto">
    <!-- ここがメーターのコンポーネントを持ってきてる部分 -->
    <MeetDesireSlider v-model="val" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import MeetDesireSlider from '~/components/MeetDesireSlider.vue'
const val = ref(3)
</script>