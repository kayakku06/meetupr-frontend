<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import SearchUser from '~/components/searchuser.vue'
import Footer from '~/components/Footer.vue'
import { Search, UserRoundPlus, ChevronUp } from 'lucide-vue-next'
import { useSearch, type SearchParams } from '~/composables/useSearch'

const { results, isLoading, error, searchUsers, clearResults } = useSearch()

const showDropdown = ref(false)
const isSearching = ref(false)
const hasSearched = ref(false)

const form = ref({
  hobbies: [] as string[]
})

const choiceCategories = ref([
  {
    name: '言語',
    tags: ['日本語', '英語', '韓国語', '中国語', 'フランス語', 'スペイン語']
  },
  {
    name: '国',
    tags: ['日本', 'アメリカ', '韓国', '中国', 'イギリス', 'フランス']
  }
])

// 初期タブ
const activeTab = ref(choiceCategories.value[0].name)

const LIMIT_LANGUAGE = 2
const LIMIT_COUNTRY = 2
const LIMIT_TOTAL = 4

const getCategoryByTag = (tag: string) => {
  const langCategory = choiceCategories.value.find(c => c.name === '言語')
  const countryCategory = choiceCategories.value.find(c => c.name === '国')

  if (langCategory?.tags.includes(tag)) return '言語'
  if (countryCategory?.tags.includes(tag)) return '国'
  return null
}

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const addHobby = (hobby: string) => {
  if (!form.value.hobbies.includes(hobby)) {
    form.value.hobbies.push(hobby)
  }
}

const removeHobby = (hobby: string) => {
  form.value.hobbies = form.value.hobbies.filter(h => h !== hobby)
  // 検索タグが0になったらおすすめを再表示
  if (form.value.hobbies.length === 0) {
    isSearching.value = false
    hasSearched.value = false
    clearResults()
  }
}

const toggleHobby = (tag: string) => {
  const category = getCategoryByTag(tag)
  const selected = form.value.hobbies

  // すでに選択されていれば削除
  if (selected.includes(tag)) {
    removeHobby(tag)
    return
  }

  // 合計4個まで
  if (selected.length >= LIMIT_TOTAL) {
    alert('選択できるのは合計4つまでです！')
    return
  }

  // 言語の上限チェック
  if (category === '言語') {
    const countLang = selected.filter(h => getCategoryByTag(h) === '言語').length
    if (countLang >= LIMIT_LANGUAGE) {
      alert('言語は2つまで選択できます！')
      return
    }
  }

  // 国の上限チェック
  if (category === '国') {
    const countCountry = selected.filter(h => getCategoryByTag(h) === '国').length
    if (countCountry >= LIMIT_COUNTRY) {
      alert('国は2つまで選択できます！')
      return
    }
  }

  addHobby(tag)
}

// 言語名から言語コードへのマッピング
const languageNameToCode: Record<string, string> = {
  '日本語': 'ja',
  '英語': 'en',
  '韓国語': 'ko',
  '中国語': 'zh',
  'フランス語': 'fr',
  'スペイン語': 'es',
  'ドイツ語': 'de',
  'イタリア語': 'it',
  'ポルトガル語': 'pt',
  'ロシア語': 'ru',
  'アラビア語': 'ar'
}

// 言語名を言語コードに変換
const convertLanguageNameToCode = (languageName: string): string => {
  return languageNameToCode[languageName] || languageName
}

const runSearch = async () => {
  // 選択が1つ以上 → 検索モードへ
  if (form.value.hobbies.length > 0) {
    isSearching.value = true
    hasSearched.value = true
    
    // ドロップダウン閉じる
    showDropdown.value = false

    // 検索パラメータを構築
    const languages: string[] = []
    const countries: string[] = []

    form.value.hobbies.forEach(tag => {
      const category = getCategoryByTag(tag)
      if (category === '言語') {
        // 言語名を言語コードに変換
        languages.push(convertLanguageNameToCode(tag))
      } else if (category === '国') {
        // 国名はそのまま使用（APIが国名を受け付ける場合）
        countries.push(tag)
      }
    })

    const searchParams: SearchParams = {
      languages: languages.length > 0 ? languages : undefined,
      countries: countries.length > 0 ? countries : undefined
    }

    await searchUsers(searchParams)
  } else {
    isSearching.value = false
    hasSearched.value = false
    clearResults()
  }
}

// 国名から国旗コードへのマッピング
const getCountryFlagCode = (country: string | null | undefined): string | null => {
  if (!country) return null
  
  const countryMap: Record<string, string> = {
    '日本': 'jp',
    'アメリカ': 'us',
    '韓国': 'kr',
    '中国': 'cn',
    'イギリス': 'gb',
    'フランス': 'fr',
    'カナダ': 'ca',
    'オーストラリア': 'au',
    'ドイツ': 'de',
    'イタリア': 'it',
    'スペイン': 'es',
    'ブラジル': 'br',
    'メキシコ': 'mx',
    'インド': 'in',
    'タイ': 'th',
    'ベトナム': 'vn',
    'インドネシア': 'id',
    'フィリピン': 'ph',
    'シンガポール': 'sg',
    'マレーシア': 'my'
  }

  return countryMap[country] || null
}

// 検索結果をSearchUserコンポーネント用の形式に変換
const formatSearchResults = computed(() => {
  return results.value.map(user => ({
    userId: user.user_id,
    name: user.username,
    message: user.comment || 'よろしくお願いします！',
    avatarColor: 'bg-[var(--meetupr-color-3)]',
    hobbies: user.interests?.map(i => i.name) || [],
    flag: getCountryFlagCode(user.residence)
  }))
})

// おすすめプロフィール（検索結果がない場合に表示）
const recommendedUsers = ref([
  {
    userId: '1',
    name: 'ユーザー1',
    message: 'よろしくお願いします！',
    avatarColor: 'bg-[var(--meetupr-color-3)]',
    hobbies: ['サッカー', 'ゲーム'],
    flag: 'jp'
  },
  {
    userId: '2',
    name: 'ユーザー2',
    message: '仲良くしてください！',
    avatarColor: 'bg-[var(--meetupr-color-3)]',
    hobbies: ['アニメ', '旅行'],
    flag: 'us'
  }
])
</script>

<template>
  <div class="min-h-screen bg-[#FFF5C9]">
    <!-- ヘッダー（固定） -->
    <div class="fixed top-0 left-0 w-full z-50 bg-[#FFF5C9] border-b-2 border-[#3c938b]">
      <!-- 上部の白いバー -->
      <div class="bg-white px-4 pt-2 pb-1">
        <div class="text-xs text-gray-400 mb-1">search</div>
      </div>

      <!-- 検索エリア -->
      <div class="px-4 pb-4 pt-2 flex flex-col items-center gap-4">
        <!-- 検索ボックス -->
        <div
          class="p-2 bg-white border-2 border-[#f39a5e] rounded text-sm text-[#4b3b2b] min-h-[40px] w-64 flex items-center gap-2 cursor-pointer overflow-x-auto"
          @click="toggleDropdown"
        >
          <!-- 🔍 検索（固定） -->
          <div class="flex items-center gap-1 flex-shrink-0">
            <Search class="w-5 h-5 text-[#FEBC6E]" />
            <span v-if="form.hobbies.length === 0">検索</span>
          </div>

          <!-- 選択されたタグを横に並べる -->
          <div class="flex items-center gap-2 flex-wrap">
            <span
              v-for="hobby in form.hobbies"
              :key="hobby"
              class="bg-[#fceb96] border border-[#FEBC6E] rounded-md px-2 py-0.5 text-xs whitespace-nowrap"
            >
              {{ hobby }}
            </span>
          </div>
        </div>

        <!-- おすすめプロフィール -->
        <div v-if="!isSearching" class="flex items-center gap-2 text-[#473c3c]">
          <UserRoundPlus class="w-5 h-5" />
          <span class="text-sm">おすすめのプロフィールをチェックしよう！</span>
        </div>

        <!-- ドロップダウン本体 -->
        <div
          v-show="showDropdown"
          class="mt-2 bg-white border-[3px] border-[#FEBC6E] rounded-md shadow-lg p-4 w-full max-w-[calc(100%-2rem)] z-50 relative"
        >
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="text-sm font-semibold text-gray-800">検索</label>
              <ChevronUp class="w-5 h-5 cursor-pointer" @click="toggleDropdown" />
            </div>
            <div
              class="flex items-center justify-between p-2 border-[3px] border-[#FEBC6E] rounded-md bg-white min-h-[46px]"
            >
              <!-- 左側：選択されたタグのボタン一覧 -->
              <div class="flex flex-wrap gap-2 flex-1">
                <button
                  v-for="hobby in form.hobbies"
                  :key="hobby"
                  @click="removeHobby(hobby)"
                  class="bg-[#fceb96] text-gray-800 border border-[#FEBC6E] rounded-md px-3 py-1 text-sm whitespace-nowrap"
                >
                  {{ hobby }} <span class="ml-1 font-bold opacity-70">×</span>
                </button>
              </div>

              <!-- 右端：検索アイコン -->
              <Search
                class="w-5 h-5 cursor-pointer text-[#FEBC6E] flex-shrink-0 ml-2"
                @click="runSearch"
              />
            </div>
          </div>

          <div class="mt-3">
            <div class="bg-white p-3 border-[3px] border-[#FEBC6E] rounded-md">
              <div class="flex gap-4 pb-3 border-b border-[#FEBC6E] mb-3">
                <span
                  v-for="category in choiceCategories"
                  :key="category.name"
                  @click="activeTab = category.name"
                  :class="
                    activeTab === category.name
                      ? 'text-[#4a90e2] font-bold border-b-2 border-[#4a90e2] cursor-pointer'
                      : 'text-gray-600 font-medium cursor-pointer'
                  "
                >
                  {{ category.name }}
                </span>
              </div>

              <div
                v-for="category in choiceCategories"
                :key="category.name"
                v-show="activeTab === category.name"
                class="flex flex-wrap gap-2"
              >
                <button
                  v-for="tag in category.tags"
                  :key="tag"
                  @click="toggleHobby(tag)"
                  :class="
                    form.hobbies.includes(tag)
                      ? 'bg-[#fceb96] text-gray-400 border border-[#FEBC6E] rounded-md px-3 py-1 text-sm line-through cursor-not-allowed'
                      : 'bg-white border border-[#FEBC6E] rounded-sm px-3 py-1 text-sm hover:bg-gray-100 cursor-pointer'
                  "
                >
                  {{ tag }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- メインコンテンツ -->
    <main class="bg-[#FFF5C9] min-h-screen pt-40 pb-20">
      <div class="p-4">
        <!-- ローディング状態 -->
        <div v-if="isLoading" class="text-center text-gray-500 py-8">
          <p>検索中...</p>
        </div>

        <!-- エラー表示 -->
        <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p class="text-red-600">{{ error }}</p>
        </div>

        <!-- 検索結果 -->
        <div v-else-if="isSearching && formatSearchResults.length > 0">
          <div
            v-for="user in formatSearchResults"
            :key="user.userId"
          >
            <SearchUser
              :name="user.name"
              :message="user.message"
              :avatarColor="user.avatarColor"
              :hobbies="user.hobbies"
              :flag="user.flag"
              :userId="user.userId"
            />
          </div>
        </div>

        <!-- 結果なし -->
        <div
          v-else-if="isSearching && !isLoading && formatSearchResults.length === 0"
          class="text-center text-gray-500 py-8"
        >
          <p>検索結果が見つかりませんでした</p>
        </div>

        <!-- おすすめプロフィール（検索していない場合） -->
        <div v-else-if="!isSearching && !hasSearched">
          <div
            v-for="user in recommendedUsers"
            :key="user.userId"
          >
            <SearchUser
              :name="user.name"
              :message="user.message"
              :avatarColor="user.avatarColor"
              :hobbies="user.hobbies"
              :flag="user.flag"
            />
          </div>
        </div>
      </div>

      <Footer class="fixed inset-x-0 bottom-0" />
    </main>
  </div>
</template>
