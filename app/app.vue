<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isLoginPage = computed(() => route.path === '/')
</script>

<template>
  <div>
    <Header v-if="!isLoginPage" />
    <NuxtPage />
  </div>
</template>