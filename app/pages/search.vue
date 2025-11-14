<script setup>
import SearchUser from '~/components/searchuser.vue'
import Footer from '~/components/Footer.vue'
import { Search, UserRoundPlus } from 'lucide-vue-next'
</script>

<template>
    <!-- ヘッダー -->
    <div class="fixed top-0 left-0 w-full flex flex-col items-center gap-4 bg-[#FFF5C9] p-4 z-50 border-b-2 border-[#3c938b]">
        <!-- 検索ボックス -->
        <div
            class="p-2 bg-white border-2 border-[#f39a5e] rounded text-sm text-[#4b3b2b] min-h-[40px] w-64 flex items-center justify-center gap-2">
            <Search class="w-5 h-5 text-[#FEBC6E]" />
            検索
        </div>

        <!-- おすすめプロフィール -->
        <div class="flex items-center gap-2 text-[#473c3c]">
            <UserRoundPlus class="w-5 h-5" />
            <span>おすすめのプロフィールをチェックしよう！</span>
        </div>
    </div>

    <main class="bg-[#FFF5C9] min-h-screen pt-20">
        <div class="p-4">
            <!-- ChatIcon コンポーネントを呼び出し -->
            <SearchUser name="ユーザー１" message="よろしくお願いします！" avatarColor="bg-teal-600" :hobbies="['サッカー', 'ゲーム']"
                flag="jp" />

            <SearchUser name="ユーザー２" message="仲良くしてください！" avatarColor="bg-teal-600" :hobbies="['アニメ', '旅行']"
                flag="us" />
        </div>

        <Footer class="fixed inset-x-0 bottom-0" />
    </main>
</template>
