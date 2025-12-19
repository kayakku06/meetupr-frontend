<template>
  <div class="relative flex items-start space-x-3 p-3 border-b border-gray-200 hover:bg-gray-50 transition cursor-pointer" @click="goProfile">

    <!-- アバター -->
    <div :class="['w-16 h-16 rounded-full flex-shrink-0', avatarColor]"></div>

    <div class="flex flex-col flex-1">
      <!-- 名前と国旗を横並び -->
      <div class="flex items-center space-x-2 mb-1">
        <span class="font-medium text-base text-[#4b3b2b]">{{ name }}</span>
        <span v-if="flag" :class="['flag', `fi fi-${flag}`, 'w-6 h-6']"></span>
      </div>

      <!-- メッセージ -->
      <span class="text-gray-600 text-sm mb-2">{{ message }}</span>

      <!-- 趣味チップ（複数） -->
      <div class="flex flex-wrap gap-2">
        <span v-for="(hb, i) in hobbies" :key="i"
          class="px-3 py-1 bg-white border-2 border-[#3c938b] rounded-full text-xs text-[#4b3b2b]">
          {{ hb }}
        </span>
      </div>
    </div>

  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()

const props = defineProps({
  name: String,
  message: String,
  avatarColor: String,
  hobbies: {
    type: Array,
    default: () => []
  },
  flag: String, // ISOコードで国旗指定（例: 'jp', 'us'）
  userId: String // ユーザーID（user_id）
})

const goProfile = () => {
  if (props.userId) {
    router.push(`/other-profile?user_id=${props.userId}`)
  } else {
    router.push('/other-profile')
  }
}
</script>
