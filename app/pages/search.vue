<script setup>
import { ref, computed, onMounted } from 'vue'
import SearchUser from '~/components/searchuser.vue'
import Footer from '~/components/Footer.vue'
import { Search, UserRoundPlus, ChevronUp } from 'lucide-vue-next'
import { useAuth } from '~/composables/useAuth'
import { useLocale } from '~/composables/useLocale'
import { normalizeCountryCode, getFlagCodeFromCountryCode } from '~/utils/countryMapping'
import LanguageSwitcher from '~/components/LanguageSwitcher.vue'

const { getAccessToken } = useAuth()
const config = useRuntimeConfig()
const { t, locale } = useLocale()

const showDropdown = ref(false);

const toggleDropdown = () => {
    showDropdown.value = !showDropdown.value;
};

const form = ref({
    hobbies: []
});

// 動的なカテゴリ（言語に応じて切り替え）
const choiceCategories = computed(() => [
    {
        name: t.value.search.language,
        tags: [
            t.value.search.languages.japanese,
            t.value.search.languages.english,
            t.value.search.languages.korean,
            t.value.search.languages.chinese,
            t.value.search.languages.french,
            t.value.search.languages.spanish
        ]
    },
    {
        name: t.value.search.country,
        tags: [
            t.value.search.countries.japan,
            t.value.search.countries.usa,
            t.value.search.countries.korea,
            t.value.search.countries.china,
            t.value.search.countries.uk,
            t.value.search.countries.france
        ]
    }
]);

// ★ 初期タブ
const activeTab = computed(() => choiceCategories.value[0]?.name || '');
const activeTabRef = ref('');

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
        alert(t.value.search.limitTotal);
        return;
    }

    // ▼ 言語の上限チェック
    if (category === t.value.search.language) {
        const countLang = selected.filter(h => getCategoryByTag(h) === t.value.search.language).length;
        if (countLang >= LIMIT_LANGUAGE) {
            alert(t.value.search.limitLanguage);
            return;
        }
    }

    // ▼ 国の上限チェック
    if (category === t.value.search.country) {
        const countCountry = selected.filter(h => getCategoryByTag(h) === t.value.search.country).length;
        if (countCountry >= LIMIT_COUNTRY) {
            alert(t.value.search.limitCountry);
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
    const langCategory = choiceCategories.value.find(c => c.name === t.value.search.language);
    const countryCategory = choiceCategories.value.find(c => c.name === t.value.search.country);

    if (langCategory?.tags.includes(tag)) return t.value.search.language;
    if (countryCategory?.tags.includes(tag)) return t.value.search.country;
    return null;
};

// 検索結果とローディング状態
const searchResults = ref([]);
const isLoading = ref(false);
const searchError = ref(null);
const isSearching = ref(false);

// 言語と国を分離
const selectedLanguages = computed(() => {
    return form.value.hobbies.filter(h => getCategoryByTag(h) === t.value.search.language);
});

const selectedCountries = computed(() => {
    return form.value.hobbies.filter(h => getCategoryByTag(h) === t.value.search.country);
});

// 国旗コードの取得は共通ユーティリティを使用

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
            throw new Error(t.value.search.authError);
        }

        // リクエストボディを構築
        // 要件: フィルター条件がない場合（空配列）でもAPIを呼び出して全ユーザー（自分以外）を取得
        // - フィルター条件がない場合: 全ユーザー（自分以外）を返す。プロフィール情報（comment, residence, avatar_url）も取得
        // - フィルター条件がある場合: 条件に一致するユーザーのみを返す。フィルタリングに必要なプロフィール情報のみを取得
        // 国名を国コードに変換（データベースでは英語の国コードで管理）
        const countryCodes = [];
        for (const country of selectedCountries.value) {
            console.log('[search] Processing country:', country);
            const code = normalizeCountryCode(country);
            console.log('[search] Country conversion result:', { original: country, code: code, type: typeof code });
            if (code && code !== country) {
                countryCodes.push(code);
                console.log('[search] Added country code:', code);
            } else {
                console.warn('[search] Failed to convert country to code:', country, 'result:', code);
            }
        }
        
        const requestBody = {
            languages: selectedLanguages.value.length > 0 ? selectedLanguages.value : [],
            countries: countryCodes.length > 0 ? countryCodes : []
        };

        console.log('[search] Request body:', JSON.stringify(requestBody, null, 2));
        console.log('[search] Selected languages:', selectedLanguages.value);
        console.log('[search] Selected countries (original):', selectedCountries.value);
        console.log('[search] Country codes (converted):', countryCodes);
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
        // バックエンドから受け取ったデータは国コード（英語）なので、そのまま使用
        searchResults.value = response || [];
        
        // デバッグ: 国旗マッピングの確認
        if (searchResults.value.length > 0) {
            console.log('[search] User residences:', searchResults.value.map(u => {
                const flagCode = getFlagCodeFromCountryCode(u.residence);
                console.log(`[search] User ${u.username}: residence="${u.residence}", flagCode="${flagCode}"`);
                // residenceが存在しない場合の警告
                if (!u.residence) {
                    console.warn(`[search] User ${u.username} has no residence field - flag will not be displayed`);
                }
                return { 
                    username: u.username, 
                    residence: u.residence,
                    residenceType: typeof u.residence,
                    flagCode: flagCode
                };
            }));
        }
        
    } catch (error) {
        console.error('Search error:', error);
        console.error('Search error details:', {
            message: error?.message,
            statusCode: error?.statusCode || error?.status,
            data: error?.data,
            response: error?.response,
            responseText: error?.response?._data
        });
        
        // エラーメッセージを取得
        let errorMessage = t.value.search.searchError;
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
            alert(t.value.search.authFailed);
        } else if (statusCode === 400) {
            alert(`${t.value.search.invalidCondition}\n${errorMessage}`);
        } else if (statusCode === 500) {
            const errorDetail = error?.data?.message || error?.message || t.value.search.serverError;
            console.error('[search] Server error details:', {
                errorDetail,
                fullError: error,
                responseData: error?.response?._data
            });
            alert(`${t.value.search.serverError}\n${errorDetail}`);
        } else {
            alert(`${t.value.search.searchError}: ${errorMessage}`);
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
        <div class="fixed top-0 left-0 w-full bg-transparent z-50 border-b border-[#3c938b]">
            <!-- 検索バーと言語切り替え -->
            <div class="p-4 bg-[#FFF5C9]">
                <div class="flex items-center gap-2">
                    <div 
                        class="p-3 bg-white border-2 border-[#FEBC6E] rounded-lg flex items-center gap-2 cursor-pointer flex-1"
                        @click="toggleDropdown">
                        <!-- 検索アイコン -->
                        <Search class="w-5 h-5 text-[#FEBC6E] flex-shrink-0" />
                        
                        <!-- 選択されたタグまたはプレースホルダー -->
                        <div class="flex items-center gap-2 flex-1 overflow-x-auto">
                            <span v-if="form.hobbies.length === 0" class="text-gray-400 text-sm">
                                {{ t.search.searchPlaceholder }}
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
                    <!-- 言語切り替え -->
                    <LanguageSwitcher />
                </div>
            </div>

            <!-- おすすめメッセージ（検索結果が表示されていない場合のみ） -->
            <div v-if="(!isSearching || (isSearching && searchResults.length === 0 && !isLoading)) && !showDropdown" class="px-4 pb-1 flex items-center gap-2 text-[#473c3c] border-b border-[#3c938b] bg-[#FFF5C9]">
                <UserRoundPlus class="w-5 h-5" />
                <span class="text-sm">{{ t.search.recommendedMessage }}</span>
            </div>
        </div>

        <!-- フィルターパネル（モーダル表示） -->
        <div v-show="showDropdown" class="fixed top-0 left-0 w-full h-full z-[60] pointer-events-none">
            <!-- オーバーレイ背景 -->
            <div class="absolute inset-0 bg-black bg-opacity-20 pointer-events-auto" @click="toggleDropdown"></div>
            
            <!-- フィルターパネル -->
            <div class="absolute top-20 left-4 right-4 bg-white border-2 border-[#FEBC6E] rounded-lg shadow-lg pointer-events-auto max-h-[80vh] overflow-y-auto">
                <div class="p-4">
                    <div class="flex items-center justify-between mb-3">
                        <label class="text-sm font-semibold text-gray-800">{{ t.search.searchPlaceholder }}</label>
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
                                {{ t.search.selectFilters }}
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
                                @click="activeTabRef = category.name" 
                                :class="(activeTabRef || activeTab) === category.name
                                    ? 'text-[#4a90e2] font-bold border-b-2 border-[#4a90e2] pb-1'
                                    : 'text-gray-600 font-medium cursor-pointer'">
                                {{ category.name }}
                            </span>
                        </div>

                        <!-- タグ選択エリア -->
                        <div 
                            v-for="category in choiceCategories" 
                            :key="category.name" 
                            v-show="(activeTabRef || activeTab) === category.name"
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
        <main :class="isSearching ? 'pt-[120px]' : 'pt-[140px]'">
            <div class="p-4 pb-24">
                <!-- ローディング状態 -->
                <div v-if="isLoading" class="flex items-center justify-center py-8">
                    <div class="text-[#4b3b2b]">{{ t.search.searching }}</div>
                </div>

                <!-- エラー表示 -->
                <div v-else-if="searchError" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {{ searchError }}
                </div>

                <!-- 検索結果がない場合 -->
                <div v-else-if="isSearching && !isLoading && searchResults.length === 0" class="flex items-center justify-center py-8">
                    <div class="text-[#4b3b2b]">
                        {{ form.hobbies.length === 0 ? t.search.noUsers : t.search.noResults }}
                    </div>
                </div>

                <!-- 検索結果表示 -->
                <div v-else-if="isSearching && !isLoading && searchResults.length > 0">
                    <!-- おすすめのユーザータイトル（フィルター条件がない場合） -->
                    <div v-if="form.hobbies.length === 0" class="mb-2 px-2">
                        <div class="flex items-center gap-2 text-[#473c3c]">
                            <UserRoundPlus class="w-5 h-5" />
                            <span class="text-sm font-semibold">{{ t.search.recommendedUsers }}</span>
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
                        :flag="getFlagCodeFromCountryCode(user.residence)"
                        :userId="user.user_id"
                        :avatarUrl="user.avatar_url || ''"
                    />
                </div>

                <!-- おすすめプロフィール（検索していない場合） -->
                <div v-else-if="!isSearching" class="flex items-center justify-center py-8">
                    <div class="text-[#4b3b2b] text-center">
                        <UserRoundPlus class="w-8 h-8 mx-auto mb-2" />
                        <p>{{ t.search.searchPrompt }}</p>
                    </div>
                </div>
            </div>

            <Footer class="fixed inset-x-0 bottom-0" />
        </main>
    </div>
</template>
