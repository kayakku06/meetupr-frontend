<script setup>
import { ref, computed, onMounted } from 'vue'
import SearchUser from '~/components/searchuser.vue'
import Footer from '~/components/Footer.vue'
import CategorySelect from '~/components/CategorySelect.vue'
import { Search, UserRoundPlus, ChevronUp } from 'lucide-vue-next'
import { useAuth } from '~/composables/useAuth'
import { useLocale } from '~/composables/useLocale'
import { normalizeCountryCode, getFlagCodeFromCountryCode } from '~/utils/countryMapping'
import { normalizeLanguageCode } from '~/utils/languageMapping'
import LanguageSwitcher from '~/components/LanguageSwitcher.vue'

const { getAccessToken } = useAuth()
const config = useRuntimeConfig()
const { t, locale } = useLocale()

const showDropdown = ref(false);

const toggleDropdown = () => {
    showDropdown.value = !showDropdown.value;
};

// 選択されたフィルター（コードで管理）- 言語と国を統合
const selectedFilters = ref([]);

// 言語と国を統合したカテゴリ
const searchCategories = computed(() => [
    {
        name: t.value.search.language,
        tags: [
            { code: 'lang:ja', label: t.value.search.languages.japanese },
            { code: 'lang:en', label: t.value.search.languages.english },
            { code: 'lang:ko', label: t.value.search.languages.korean },
            { code: 'lang:zh', label: t.value.search.languages.chinese },
            { code: 'lang:fr', label: t.value.search.languages.french },
            { code: 'lang:es', label: t.value.search.languages.spanish }
        ]
    },
    {
        name: t.value.search.country,
        tags: [
            { code: 'country:JP', label: t.value.search.countries.japan },
            { code: 'country:US', label: t.value.search.countries.usa },
            { code: 'country:KR', label: t.value.search.countries.korea },
            { code: 'country:CN', label: t.value.search.countries.china },
            { code: 'country:GB', label: t.value.search.countries.uk },
            { code: 'country:FR', label: t.value.search.countries.france }
        ]
    }
]);

// 選択されたタグのラベルを取得（表示用）
const selectedLabels = computed(() => {
    return selectedFilters.value.map(code => {
        const allTags = searchCategories.value.flatMap(c => c.tags);
        const tag = allTags.find(t => t.code === code);
        return tag?.label || code;
    });
});

// コードからラベルを取得（テンプレート用ヘルパー）
const getFilterLabel = (code) => {
    const allTags = searchCategories.value.flatMap(c => c.tags);
    const tag = allTags.find(t => t.code === code);
    return tag?.label || code;
};

// API用に言語と国を分離
const selectedLanguages = computed(() => {
    return selectedFilters.value
        .filter(code => code.startsWith('lang:'))
        .map(code => code.replace('lang:', ''));
});

const selectedCountries = computed(() => {
    return selectedFilters.value
        .filter(code => code.startsWith('country:'))
        .map(code => code.replace('country:', ''));
});

// 上限チェック
const LIMIT_LANGUAGE = 2;
const LIMIT_COUNTRY = 2;
const LIMIT_TOTAL = 4;

// フィルター選択時の処理
const onFilterChange = (newValue) => {
    const newLanguages = newValue.filter(code => code.startsWith('lang:'));
    const newCountries = newValue.filter(code => code.startsWith('country:'));
    
    if (newLanguages.length > LIMIT_LANGUAGE) {
        alert(t.value.search.limitLanguage);
        return;
    }
    if (newCountries.length > LIMIT_COUNTRY) {
        alert(t.value.search.limitCountry);
        return;
    }
    if (newValue.length > LIMIT_TOTAL) {
        alert(t.value.search.limitTotal);
        return;
    }
    selectedFilters.value = newValue;
};

// フィルターをクリア
const clearFilter = (code) => {
    selectedFilters.value = selectedFilters.value.filter(c => c !== code);
    // フィルターを削除した場合、検索中なら再検索
    if (isSearching.value && selectedFilters.value.length === 0) {
        runSearch();
    }
};

// 検索結果とローディング状態
const searchResults = ref([]);
const isLoading = ref(false);
const searchError = ref(null);
const isSearching = ref(false);

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
        // selectedLanguages と selectedCountries はすでにコードで管理されているが、
        // 念のため正しい形式であることを確認
        const languageCodes = selectedLanguages.value.filter(code => code && code.length === 2);
        const countryCodes = selectedCountries.value.filter(code => code && code.length === 2);
        
        const requestBody = {
            languages: languageCodes.length > 0 ? languageCodes : [],
            countries: countryCodes.length > 0 ? countryCodes : []
        };

        console.log('[search] Request body:', JSON.stringify(requestBody, null, 2));
        console.log('[search] API URL:', `${config.public.apiBaseUrl}/api/v1/search/users`);

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
        let results = response || [];
        
        // 言語検索の場合、ネイティブ言語でフィルタリング
        if (languageCodes.length > 0) {
            console.log('[search] Filtering by native language. Language codes:', languageCodes);
            console.log('[search] Total users before filtering:', results.length);
            
            results = results.filter(user => {
                // native_languageが含まれている場合は、ネイティブ言語でフィルタリング
                if (user.native_language) {
                    const userNativeLang = String(user.native_language).toLowerCase().trim();
                    const matches = languageCodes.some(langCode => {
                        const normalizedLangCode = langCode.toLowerCase().trim();
                        return userNativeLang === normalizedLangCode;
                    });
                    return matches;
                }
                // native_languageが含まれていない場合は除外
                return false;
            });
            
            console.log(`[search] Filtered results: ${results.length} users (from ${response?.length || 0} total)`);
        }
        
        searchResults.value = results;
        
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
                            <span v-if="selectedLabels.length === 0" class="text-gray-400 text-sm">
                                {{ t.search.searchPlaceholder }}
                            </span>
                            <div v-else class="flex items-center gap-2 flex-wrap">
                                <span
                                    v-for="label in selectedLabels" 
                                    :key="label"
                                    class="bg-white border border-[#FEBC6E] rounded-full px-3 py-1 text-xs whitespace-nowrap text-[#4b3b2b]">
                                    {{ label }}
                                </span>
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
                                v-for="code in selectedFilters" 
                                :key="code"
                                @click.stop="clearFilter(code)"
                                class="bg-white border border-[#FEBC6E] rounded-full px-3 py-1 text-xs whitespace-nowrap text-[#4b3b2b] hover:bg-gray-50">
                                {{ getFilterLabel(code) }} ×
                            </button>
                            <span v-if="selectedFilters.length === 0" class="text-gray-400 text-xs">
                                {{ t.search.selectFilters }}
                            </span>
                        </div>
                        <Search class="w-5 h-5 cursor-pointer text-[#FEBC6E] flex-shrink-0" @click="runSearch" />
                    </div>

                    <!-- 統一されたCategorySelect（言語と国をタブで切り替え） -->
                    <CategorySelect
                        :categories="searchCategories"
                        :modelValue="selectedFilters"
                        @update:modelValue="onFilterChange"
                        :multiple="true"
                        :panelOnly="true"
                        :placeholder="t.search.selectFilters"
                    />
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
                        {{ selectedLabels.length === 0 ? t.search.noUsers : t.search.noResults }}
                    </div>
                </div>

                <!-- 検索結果表示 -->
                <div v-else-if="isSearching && !isLoading && searchResults.length > 0">
                    <!-- おすすめのユーザータイトル（フィルター条件がない場合） -->
                    <div v-if="selectedLabels.length === 0" class="mb-2 px-2">
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
