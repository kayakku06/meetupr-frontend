<script setup>
import SearchUser from '~/components/searchuser.vue'
import Footer from '~/components/Footer.vue'
</script>

<template>
    <main class="bg-[#FFF5C9] min-h-screen">
        <div class="p-4">
            <h1 class="text-xl mb-4 zen-maru-gothic-regular">Home 11</h1>

            <!-- ChatIcon コンポーネントを呼び出し -->
            <SearchUser name="ユーザー１" message="よろしくお願いします！" avatarColor="bg-teal-600" :hobbies="['サッカー', 'ゲーム']"
                flag="jp" />

            <SearchUser name="ユーザー２" message="仲良くしてください！" avatarColor="bg-teal-600" :hobbies="['アニメ', '旅行']" flag="us" />

        </div>
        <Footer class="fixed inset-x-0 bottom-0" />
    </main>
</template>
