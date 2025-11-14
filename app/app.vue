<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isAuthPage = computed(() => route.path === '/' || route.path === '/signup')
</script>

<template>
  <div>
    <Header v-if="!isAuthPage" />
    <NuxtPage />
  </div>
</template>