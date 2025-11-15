<script setup>
import ChatIcon from '~/components/chaticon.vue'
import Footer from '~/components/Footer.vue'
</script>

<!-- public/index.html の <head> の中に追加 -->

<template>
  <div class="p-4 bg-[var(--meetupr-main)] min-h-screen">
    

    <!-- ChatIcon コンポーネントを呼び出し -->
    <ChatIcon 
      name="ユーザー１"
      message="メッセージ"
      date="11/3"
  avatarColor="bg-[var(--meetupr-color-3)]"
    />
    <ChatIcon 
      name="ユーザー２"
      message="こんにちは！"
      date="11/10"
  avatarColor="bg-[var(--meetupr-color-3)]"
    />
  </div>
  <Footer class="fixed inset-x-0 bottom-0"/>

</template>



<style scoped>
/* 必要ならスタイルをここに追加 */
</style>
