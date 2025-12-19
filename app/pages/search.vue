<script setup>
import { ref, computed, onMounted } from 'vue'
import SearchUser from '~/components/searchuser.vue'
import Footer from '~/components/Footer.vue'
import { Search, UserRoundPlus, ChevronUp } from 'lucide-vue-next'
import { useAuth } from '~/composables/useAuth'

const { getAccessToken } = useAuth()
const config = useRuntimeConfig()

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
    // フィルターを削除した場合、全ユーザーを取得するために検索を実行
    // ただし、検索中でない場合は自動実行しない（ユーザーが検索ボタンをクリックするまで待つ）
    if (isSearching.value && form.value.hobbies.length === 0) {
        // 既に検索中の場合は、フィルターなしで再検索（全ユーザー取得）
        runSearch();
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

// 検索結果とローディング状態
const searchResults = ref([]);
const isLoading = ref(false);
const searchError = ref(null);
const isSearching = ref(false);

// 言語と国を分離
const selectedLanguages = computed(() => {
    return form.value.hobbies.filter(h => getCategoryByTag(h) === '言語');
});

const selectedCountries = computed(() => {
    return form.value.hobbies.filter(h => getCategoryByTag(h) === '国');
});

// 国旗コードのマッピング（簡易版）
const getFlagCode = (country) => {
    const flagMap = {
        '日本': 'jp',
        'アメリカ': 'us',
        '韓国': 'kr',
        '中国': 'cn',
        'イギリス': 'gb',
        'フランス': 'fr'
    };
    return flagMap[country] || '';
};

// 検索APIを呼び出す
const runSearch = async () => {
    // フィルター条件がない場合でも全ユーザーを取得する
    isSearching.value = true;
    isLoading.value = true;
    searchError.value = null;
    showDropdown.value = false;

    try {
        const token = await getAccessToken();
        if (!token) {
            throw new Error('認証トークンを取得できませんでした');
        }

        // リクエストボディを構築
        // 要件: フィルター条件がない場合（空配列）でもAPIを呼び出して全ユーザー（自分以外）を取得
        // - フィルター条件がない場合: 全ユーザー（自分以外）を返す。プロフィール情報（comment, residence, avatar_url）も取得
        // - フィルター条件がある場合: 条件に一致するユーザーのみを返す。フィルタリングに必要なプロフィール情報のみを取得
        const requestBody = {
            languages: selectedLanguages.value.length > 0 ? selectedLanguages.value : [],
            countries: selectedCountries.value.length > 0 ? selectedCountries.value : []
        };

        console.log('[search] Request body:', JSON.stringify(requestBody, null, 2));
        console.log('[search] Selected languages:', selectedLanguages.value);
        console.log('[search] Selected countries:', selectedCountries.value);
        console.log('[search] API URL:', `${config.public.apiBaseUrl}/api/v1/search/users`);
        console.log('[search] Token length:', token ? token.length : 0);

        // APIを呼び出し
        const response = await $fetch(`${config.public.apiBaseUrl}/api/v1/search/users`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: requestBody
        });

        // レスポンスを検索結果に設定
        searchResults.value = response || [];
        
    } catch (error) {
        console.error('検索エラー:', error);
        console.error('検索エラー詳細:', {
            message: error?.message,
            statusCode: error?.statusCode || error?.status,
            data: error?.data,
            response: error?.response,
            responseText: error?.response?._data
        });
        
        // エラーメッセージを取得
        let errorMessage = '検索に失敗しました';
        if (error?.data?.message) {
            errorMessage = error.data.message;
        } else if (error?.message) {
            errorMessage = error.message;
        }
        
        const statusCode = (error && error.statusCode) || (error && error.status);
        searchError.value = errorMessage;
        searchResults.value = [];
        
        // エラーメッセージを表示
        if (statusCode === 401) {
            alert('認証に失敗しました。再度ログインしてください。');
        } else if (statusCode === 400) {
            alert(`検索条件が無効です。\n詳細: ${errorMessage}`);
        } else if (statusCode === 500) {
            const errorDetail = error?.data?.message || error?.message || 'サーバーエラーが発生しました';
            console.error('[search] サーバーエラー詳細:', {
                errorDetail,
                fullError: error,
                responseData: error?.response?._data
            });
            alert(`サーバーエラーが発生しました。\n詳細: ${errorDetail}\n\nバックエンドサーバー（${config.public.apiBaseUrl}）のログを確認してください。`);
        } else {
            alert(`検索エラー: ${errorMessage}`);
        }
    } finally {
        isLoading.value = false;
    }
};

// 興味・趣味を文字列配列に変換
const formatInterests = (interests) => {
    if (!interests || !Array.isArray(interests)) {
        return [];
    }
    return interests.map(interest => interest.name || interest);
};

// ページマウント時に「おすすめのユーザー」として全ユーザーを取得
onMounted(async () => {
    // 初期表示時はフィルターなしで全ユーザーを取得
    await runSearch();
});

</script>

<template>
    <div class="bg-[#FFF5C9] min-h-screen">
        <!-- 固定ヘッダー -->
        <div class="fixed top-0 left-0 w-full bg-[#FFF5C9] z-50 border-b border-[#3c938b]">
            <!-- 検索バー -->
            <div class="p-4">
                <div 
                    class="p-3 bg-white border-2 border-[#FEBC6E] rounded-lg flex items-center gap-2 cursor-pointer"
                    @click="toggleDropdown">
                    <!-- 検索アイコン -->
                    <Search class="w-5 h-5 text-[#FEBC6E] flex-shrink-0" />
                    
                    <!-- 選択されたタグまたはプレースホルダー -->
                    <div class="flex items-center gap-2 flex-1 overflow-x-auto">
                        <span v-if="form.hobbies.length === 0" class="text-gray-400 text-sm">
                            検索
                        </span>
                        <div v-else class="flex items-center gap-2 flex-wrap">
                            <button
                                v-for="hobby in form.hobbies" 
                                :key="hobby"
                                @click.stop="removeHobby(hobby)"
                                class="bg-white border border-[#FEBC6E] rounded-full px-3 py-1 text-xs whitespace-nowrap text-[#4b3b2b] hover:bg-gray-50">
                                {{ hobby }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- おすすめメッセージ（検索結果が表示されていない場合のみ） -->
            <div v-if="!isSearching || (isSearching && searchResults.length === 0 && !isLoading)" class="px-4 pb-3 flex items-center gap-2 text-[#473c3c] border-b border-[#3c938b]">
                <UserRoundPlus class="w-5 h-5" />
                <span class="text-sm">おすすめの他のプロフィールをチェックしよう。</span>
            </div>

            <!-- フィルターパネル（展開時） -->
            <div v-show="showDropdown" class="bg-transparent border-2 border-[#FEBC6E] rounded-lg shadow-lg">
                <div class="p-4">
                    <div class="flex items-center justify-between mb-3">
                        <label class="text-sm font-semibold text-gray-800">検索</label>
                        <ChevronUp class="w-5 h-5 cursor-pointer text-[#FEBC6E]" @click="toggleDropdown" />
                    </div>
                    
                    <!-- 選択されたフィルター表示エリア -->
                    <div class="mb-3 p-2 bg-white border-2 border-[#FEBC6E] rounded-lg min-h-[46px] flex items-center gap-2">
                        <div class="flex flex-wrap gap-2 flex-1">
                            <button
                                v-for="hobby in form.hobbies" 
                                :key="hobby"
                                @click.stop="removeHobby(hobby)"
                                class="bg-white border border-[#FEBC6E] rounded-full px-3 py-1 text-xs whitespace-nowrap text-[#4b3b2b] hover:bg-gray-50">
                                {{ hobby }} ×
                            </button>
                            <span v-if="form.hobbies.length === 0" class="text-gray-400 text-xs">
                                フィルターを選択してください
                            </span>
                        </div>
                        <Search class="w-5 h-5 cursor-pointer text-[#FEBC6E] flex-shrink-0" @click="runSearch" />
                    </div>

                    <!-- 言語・国のタブ -->
                    <div class="bg-white p-3 border-2 border-[#FEBC6E] rounded-lg">
                        <div class="flex gap-4 pb-3 border-b border-[#FEBC6E] mb-3">
                            <span 
                                v-for="category in choiceCategories" 
                                :key="category.name"
                                @click="activeTab = category.name" 
                                :class="activeTab === category.name
                                    ? 'text-[#4a90e2] font-bold border-b-2 border-[#4a90e2] pb-1'
                                    : 'text-gray-600 font-medium cursor-pointer'">
                                {{ category.name }}
                            </span>
                        </div>

                        <!-- タグ選択エリア -->
                        <div 
                            v-for="category in choiceCategories" 
                            :key="category.name" 
                            v-show="activeTab === category.name"
                            class="flex flex-wrap gap-2">
                            <button 
                                v-for="tag in category.tags" 
                                :key="tag" 
                                @click="toggleHobby(tag)" 
                                :class="form.hobbies.includes(tag)
                                    ? 'bg-[#fceb96] text-gray-800 border border-[#FEBC6E] rounded-full px-3 py-1 text-sm'
                                    : 'bg-white border border-[#FEBC6E] rounded-full px-3 py-1 text-sm hover:bg-gray-50'">
                                {{ tag }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- メインコンテンツ -->
        <main :class="showDropdown ? 'pt-[280px]' : (isSearching ? 'pt-[120px]' : 'pt-[140px]')">
            <div class="p-4">
                <!-- ローディング状態 -->
                <div v-if="isLoading" class="flex items-center justify-center py-8">
                    <div class="text-[#4b3b2b]">検索中...</div>
                </div>

                <!-- エラー表示 -->
                <div v-else-if="searchError" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {{ searchError }}
                </div>

                <!-- 検索結果がない場合 -->
                <div v-else-if="isSearching && !isLoading && searchResults.length === 0" class="flex items-center justify-center py-8">
                    <div class="text-[#4b3b2b]">
                        {{ form.hobbies.length === 0 ? 'ユーザーが見つかりませんでした' : '検索結果が見つかりませんでした' }}
                    </div>
                </div>

                <!-- 検索結果表示 -->
                <div v-else-if="isSearching && !isLoading && searchResults.length > 0">
                    <!-- おすすめのユーザータイトル（フィルター条件がない場合） -->
                    <div v-if="form.hobbies.length === 0" class="mb-4 px-2">
                        <div class="flex items-center gap-2 text-[#473c3c]">
                            <UserRoundPlus class="w-5 h-5" />
                            <span class="text-sm font-semibold">おすすめのユーザー</span>
                        </div>
                    </div>
                    
                    <!-- 検索結果リスト -->
                    <SearchUser 
                        v-for="user in searchResults" 
                        :key="user.user_id"
                        :name="user.username"
                        :message="user.comment || ''"
                        avatarColor="bg-[var(--meetupr-color-3)]"
                        :hobbies="formatInterests(user.interests)"
                        :flag="getFlagCode(user.residence)"
                    />
                </div>

                <!-- おすすめプロフィール（検索していない場合） -->
                <div v-else-if="!isSearching" class="flex items-center justify-center py-8">
                    <div class="text-[#4b3b2b] text-center">
                        <UserRoundPlus class="w-8 h-8 mx-auto mb-2" />
                        <p>検索条件を選択して、ユーザーを探してみましょう！</p>
                    </div>
                </div>
            </div>

            <Footer class="fixed inset-x-0 bottom-0" />
        </main>
    </div>
</template>
