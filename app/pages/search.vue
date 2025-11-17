<script setup>
import { ref } from 'vue'
import SearchUser from '~/components/searchuser.vue'
import Footer from '~/components/Footer.vue'
import { Search, UserRoundPlus, ChevronUp } from 'lucide-vue-next'

const showDropdown = ref(false);

const toggleDropdown = () => {
    showDropdown.value = !showDropdown.value;
};

const form = ref({
    hobbies: []
});

const choiceCategories = ref([
    {
        name: '言語',
        tags: ['日本語', '英語', '韓国語', '中国語', 'フランス語', 'スペイン語']
    },
    {
        name: '国',
        tags: ['日本', 'アメリカ', '韓国', '中国', 'イギリス', 'フランス']
    }
]);


// ★ 初期タブ
const activeTab = ref(choiceCategories.value[0].name);

const addHobby = (hobby) => {
    if (!form.value.hobbies.includes(hobby)) {
        form.value.hobbies.push(hobby);
    }
};

const removeHobby = (hobby) => {
    form.value.hobbies = form.value.hobbies.filter(h => h !== hobby);
    // 検索タグが0になったらおすすめを再表示
    if (form.value.hobbies.length === 0) {
        isSearching.value = false;
    }
};

const toggleHobby = (tag) => {
    const category = getCategoryByTag(tag);

    const selected = form.value.hobbies;

    // すでに選択されていれば削除
    if (selected.includes(tag)) {
        removeHobby(tag);
        return;
    }

    // ▼ 合計 4 個まで
    if (selected.length >= LIMIT_TOTAL) {
        alert("選択できるのは合計4つまでです！");
        return;
    }

    // ▼ 言語の上限チェック
    if (category === '言語') {
        const countLang = selected.filter(h => getCategoryByTag(h) === '言語').length;
        if (countLang >= LIMIT_LANGUAGE) {
            alert("言語は2つまで選択できます！");
            return;
        }
    }

    // ▼ 国の上限チェック
    if (category === '国') {
        const countCountry = selected.filter(h => getCategoryByTag(h) === '国').length;
        if (countCountry >= LIMIT_COUNTRY) {
            alert("国は2つまで選択できます！");
            return;
        }
    }

    // 条件クリア → 追加
    addHobby(tag);
};

const LIMIT_LANGUAGE = 2;
const LIMIT_COUNTRY = 2;
const LIMIT_TOTAL = 4;

const getCategoryByTag = (tag) => {
    const langCategory = choiceCategories.value.find(c => c.name === '言語');
    const countryCategory = choiceCategories.value.find(c => c.name === '国');

    if (langCategory.tags.includes(tag)) return '言語';
    if (countryCategory.tags.includes(tag)) return '国';
    return null;
};

const tempSelected = ref([]);
const isSearching = ref(false);

const runSearch = () => {
    // 選択が 1 つ以上 → 検索モードへ
    if (form.value.hobbies.length > 0) {
        isSearching.value = true;
    } else {
        isSearching.value = false;
    }

    // ドロップダウン閉じる
    showDropdown.value = false;
};

const handleSearch = () => {
    isOpen.value = false;           // ドロップダウン閉じる
    selectedItems.value = [...tempSelected.value]; // 追加
    runSearch();
};

</script>

<template>
    <!-- ヘッダー -->
    <div
        class="fixed top-0 left-0 w-full flex flex-col items-center gap-4 bg-[#FFF5C9] p-4 z-50 border-b-2 border-[#3c938b]">
        <!-- 検索ボックス -->
        <div class="p-2 bg-white border-2 border-[#f39a5e] rounded text-sm text-[#4b3b2b] min-h-[40px] w-64 flex items-center gap-2 cursor-pointer overflow-x-auto"
            @click="toggleDropdown">
            <!-- 🔍 検索（固定） -->
            <div class="flex items-center gap-1 flex-shrink-0">
                <Search class="w-5 h-5 text-[#FEBC6E]" />
                <span>検索</span>
            </div>

            <!-- ▼ 選択されたタグを横に並べる -->
            <div class="flex items-center gap-2 flex-wrap">
                <span v-for="hobby in form.hobbies" :key="hobby"
                    class="bg-[#fceb96] border border-[#FEBC6E] rounded-md px-2 py-0.5 text-xs whitespace-nowrap">
                    {{ hobby }}
                </span>

                <!-- タグがない場合の placeholder -->
                <span v-if="form.hobbies.length === 0" class="text-gray-400 text-xs">
                </span>
            </div>
        </div>


        <!-- おすすめプロフィール -->
        <div v-if="!isSearching" class="flex items-center gap-2 text-[#473c3c]">
            <UserRoundPlus class="w-5 h-5" />
            <span>おすすめのプロフィールをチェックしよう！</span>
        </div>


        <!-- ▼ ドロップダウン本体 -->
        <div v-show="showDropdown"
            class="mt-2 bg-white border-[3px] border-[#FEBC6E] rounded-md shadow-lg p-4 absolute w-full z-50 "
            @keydown.enter.prevent="runSearch">
            <div>
                <div class="flex items-center justify-between mb-1">
                    <label class="text-sm font-semibold text-gray-800">検索</label>
                    <ChevronUp class="w-5 h-5 cursor-pointer" @click="toggleDropdown" />
                </div>
                <div
                    class="flex items-center justify-between p-2 border-[3px] border-[#FEBC6E] rounded-md bg-white min-h-[46px]">

                    <!-- 左側：選択された趣味のボタン一覧 -->
                    <div class="flex flex-wrap gap-2">
                        <button v-for="hobby in form.hobbies" :key="hobby" @click="removeHobby(hobby)"
                            class="bg-[#fceb96] text-gray-800 border border-[#FEBC6E] rounded-md px-3 py-1 text-sm">
                            {{ hobby }} <span class="ml-1 font-bold opacity-70">×</span>
                        </button>
                    </div>

                    <!-- 右端：検索アイコン -->
                    <Search class="w-5 h-5 cursor-pointer text-[#FEBC6E] flex-shrink-0" @click="runSearch" />


                </div>

            </div>

            <div class="mt-3">
                <div class="bg-white p-3 border-[3px] border-[#FEBC6E] rounded-md">
                    <div class="flex gap-4 pb-3 border-b border-[#FEBC6E] mb-3">
                        <span v-for="category in choiceCategories" :key="category.name"
                            @click="activeTab = category.name" :class="activeTab === category.name
                                ? 'text-[#4a90e2] font-bold border-b-2 border-[#4a90e2]'
                                : 'text-gray-600 font-medium'">
                            {{ category.name }}
                        </span>
                    </div>

                    <div v-for="category in choiceCategories" :key="category.name" v-show="activeTab === category.name"
                        class="flex flex-wrap gap-2">
                        <button v-for="tag in category.tags" :key="tag" @click="toggleHobby(tag)" :class="form.hobbies.includes(tag)
                            ? 'bg-[#fceb96] text-gray-400 border border-[#FEBC6E] rounded-md px-3 py-1 text-sm line-through cursor-not-allowed'
                            : 'bg-white border border-[#FEBC6E] rounded-sm px-3 py-1 text-sm hover:bg-gray-100'">
                            {{ tag }}
                        </button>
                    </div>
                </div>
            </div>
        </div>

    </div>
    <main class="bg-[#FFF5C9] min-h-screen pt-20">
        <div class="p-4">
            <SearchUser name="ユーザー１" message="よろしくお願いします！" avatarColor="bg-[var(--meetupr-color-3)]" :hobbies="['サッカー', 'ゲーム']"
                flag="jp" />

            <SearchUser name="ユーザー２" message="仲良くしてください！" avatarColor="bg-[var(--meetupr-color-3)]" :hobbies="['アニメ', '旅行']"
                flag="us" />
        </div>

        <Footer class="fixed inset-x-0 bottom-0" />
    </main>
</template>
