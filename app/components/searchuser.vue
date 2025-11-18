<template>
  <div class="relative flex items-center space-x-3 p-3 border-b border-gray-200 hover:bg-gray-50 transition zen-maru" @click="goProfile">

    <!-- アバター -->
    <div :class="['w-10 h-10 rounded-full -mt-6', avatarColor]"></div>

    <div class="flex flex-col">
      <!-- 名前と国旗を横並び -->
      <div class="flex items-center space-x-2">
        <span class="text- font-medium text-base">{{ name }}</span>
        <span v-if="flag" :class="['flag', `fi fi-${flag}`, 'w-10 h-10']"></span>
      </div>

      <!-- メッセージ -->
      <span class="text-gray-600 text-sm">{{ message }}</span>

      <!-- 趣味チップ（複数） -->
      <div class="flex flex-wrap gap-2 mt-3">
        <span v-for="(hb, i) in hobbies" :key="i"
          class="px-3 py-1 bg-[#fff] border-2 border-container rounded-full cursor-pointer text-xs text-[#4b3b2b]">
          {{ hb }}
        </span>
      </div>
    </div>

  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()

defineProps({
  name: String,
  message: String,
  avatarColor: String,
  hobbies: {
    type: Array,
    default: () => []
  },
  flag: String // ISOコードで国旗指定（例: 'jp', 'us'）
})

const goProfile = () => {
  router.push('/other-profile')
}
</script>
