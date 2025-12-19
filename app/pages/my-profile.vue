<template>

  <div class="min-h-screen bg-[var(--meetupr-main)] pb-20 font-['Noto_Sans_JP']">
  
   <!--　<header class="fixed top-0 left-0 right-0 h-14 bg-white shadow-md z-40"></header>　-->

    <!-- コンテンツ -->
    <main class="max-w-md mx-auto p-5 ">
      <div class="flex gap-3 items-center mb-3">
        <div class="w-20 h-20 rounded-full bg-[var(--meetup-color-3)] flex items-center justify-center border-2 border-[var(--meetupr-color-3)]">
          <svg viewBox="0 0 64 64" class="w-11 h-11" aria-hidden>
            <circle cx="32" cy="24" r="12" fill="none" stroke="#6aaea0" stroke-width="2" />
            <path d="M10 54c4-10 18-14 22-14s18 4 22 14" fill="none" stroke="#6aaea0" stroke-width="2" />
          </svg>
        </div>

        <div class="flex-1">
          <h2 class="m-0 mb-2 text-lg text-teal-900">{{ form.name || 'なまえ' }}</h2>
          <button v-if="!editing && !isLoading"
            class="border-[var(--meetupr-color-3)] text-white px-2.5 py-1.5 rounded-full inline-flex gap-1.5 items-center text-xs hover:border-[var(--meetupr-color-3)] transition bg-[var(--meetupr-color-3)]"
            @click="toggleEdit">
            <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden>
              <path
                d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
                fill="#fff" />
            </svg>
            プロフィール編集
          </button>
        </div>
      </div>

      <form class="flex flex-col gap-3" @submit.prevent>
        <label class="flex flex-col gap-1">
          <div class="text-sm text-yellow-900">学部</div>
          <!-- 値はコードに統一（make-profile準拠） -->
          <select :disabled="!editing || isLoading" v-model="form.department"
            class="border-2 border-[var(--meetupr-sub)] p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed bg-white text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 appearance-none ">
            <option value="" disabled>学部を選択</option>
            <option value="business">経営学部</option>
            <option value="production_science">政策科学部</option>
            <option value="information_science">情報理工学部</option>
            <option value="film_studies">映像学部</option>
            <option value="psychology">総合心理学部</option>
            <option value="global_liberal_arts">グローバル教養学部</option>
          </select>
        </label>

        <fieldset class="flex flex-col gap-2">
          <legend class="text-xs text-amber-900">性別</legend>
          <label class="inline-flex items-center gap-1.5 text-sm text-amber-900"><input type="radio"
              :disabled="!editing || isLoading" value="male" v-model="form.gender"
              class="disabled:opacity-50 disabled:cursor-not-allowed" /> 男性</label>
          <label class="inline-flex items-center gap-1.5 text-sm text-amber-900"><input type="radio"
              :disabled="!editing || isLoading" value="female" v-model="form.gender"
              class="disabled:opacity-50 disabled:cursor-not-allowed" /> 女性</label>
          <label class="inline-flex items-center gap-1.5 text-sm text-amber-900"><input type="radio"
              :disabled="!editing || isLoading" value="other" v-model="form.gender"
              class="disabled:opacity-50 disabled:cursor-not-allowed" /> その他</label>
        </fieldset>

        <!-- 出身：make-profile 準拠（地域タブ＋国タグ） -->
        <div class="flex flex-col gap-4">
          <div class="text-xs text-amber-900">出身</div>
          <div class="flex flex-col gap-2">
            <button type="button" @click="showOrigin = !showOrigin"
              :disabled="!editing || isLoading"
              class="flex justify-between items-center bg-white border-[3px] border-[var(--meetupr-sub)] rounded-md px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
              <span class="text-amber-900">
                {{ form.origin ? getCountryLabel(form.origin) : '選択してください' }}
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-amber-800" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
              </svg>
            </button>

            <div v-if="showOrigin" class="bg-white p-3 border-[3px] border-[var(--meetupr-sub)] rounded-md">
              <div class="flex gap-4 pb-3 border-b border-[var(--meetupr-sub)] mb-3 text-sm">
                <span v-for="region in regionCategories" :key="region.name" @click="activeRegionTab = region.name"
                  :class="activeRegionTab === region.name ? 'text-[var(--meetupr-sub)] font-bold border-b-2 border-[var(--meetupr-sub)] cursor-pointer' : 'text-gray-600 font-medium cursor-pointer'">
                  {{ region.name }}
                </span>
              </div>
              <div v-for="region in regionCategories" :key="region.name" v-show="activeRegionTab === region.name" class="flex flex-wrap gap-2">
                <button v-for="c in region.tags" :key="c.code" type="button" :disabled="!editing || isLoading"
                  @click="form.origin = c.code"
                  :class="form.origin === c.code ? 'bg-[var(--meetupr-sub)] text-white border border-[var(--meetupr-sub)] rounded-md px-3 py-1 text-sm cursor-pointer' : 'bg-white border border-[var(--meetupr-sub)] rounded-sm px-3 py-1 text-sm cursor-pointer hover:bg-gray-100'">
                  {{ c.label }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-4">
          <div class="text-xs text-amber-900">言語</div>
          <!-- ネイティブ（make-profile準拠：カテゴリタブ＋タグ選択） -->
          <div class="flex flex-col gap-2">
            <button type="button" @click="showNativeLanguage = !showNativeLanguage"
              :disabled="!editing || isLoading"
              class="flex justify-between items-center bg-white border-[3px] border-[var(--meetupr-sub)] rounded-md px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
              <span class="text-amber-900">ネイティブ: {{ form.nativeLanguage ? getLanguageLabel(form.nativeLanguage) : '選択してください' }}</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-amber-800" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
              </svg>
            </button>
            <div v-if="showNativeLanguage" class="bg-white p-3 border-[3px] border-[var(--meetupr-sub)] rounded-md">
              <div class="flex gap-4 pb-3 border-b border-[var(--meetupr-sub)] mb-3 text-sm">
                <span v-for="cat in languageCategories" :key="cat.name" @click="activeLanguageTab = cat.name"
                  :class="activeLanguageTab === cat.name ? 'text-[var(--meetupr-sub)] font-bold border-b-2 border-[var(--meetupr-sub)] cursor-pointer' : 'text-gray-600 font-medium cursor-pointer'">
                  {{ cat.name }}
                </span>
              </div>
              <div v-for="cat in languageCategories" :key="cat.name" v-show="activeLanguageTab === cat.name" class="flex flex-wrap gap-2">
                <button v-for="t in cat.tags" :key="t.code" type="button" :disabled="!editing || isLoading"
                  @click="form.nativeLanguage = t.code"
                  :class="form.nativeLanguage === t.code ? 'bg-[var(--meetupr-sub)] text-white border border-[var(--meetupr-sub)] rounded-md px-3 py-1 text-sm cursor-pointer' : 'bg-white border border-[var(--meetupr-sub)] rounded-sm px-3 py-1 text-sm cursor-pointer hover:bg-gray-100'">
                  {{ t.label }}
                </button>
              </div>
            </div>
          </div>

          <!-- 話せる言語（chips表示＋カテゴリ選択） -->
          <div class="flex flex-col gap-2">
            <div class="text-[10px] text-amber-700">話せる言語</div>
            <div class="flex gap-2 flex-wrap mb-1.5">
              <template v-for="(lang, i) in form.spokenLanguages" :key="lang + '-' + i">
                <div :class="['flex items-center bg-white border-2 border-[var(--meetupr-sub)] px-2.5 py-1.5 rounded-full text-xs text-amber-900', !editing ? 'opacity-50 cursor-not-allowed' : '']">
                  <span class="select-none">{{ getLanguageLabel(lang) }}</span>
                  <button v-if="editing" type="button" @click="removeSpokenLanguage(lang)" class="ml-2 text-[11px] text-gray-500 hover:text-gray-800">×</button>
                </div>
              </template>
            </div>
            <button type="button" v-if="editing" @click="showSpokenLanguages = !showSpokenLanguages"
              class="self-start bg-[var(--meetupr-sub)] text-white px-2.5 py-1.5 rounded text-sm cursor-pointer hover:bg-orange-500 transition">選択</button>
            <div v-if="showSpokenLanguages" class="bg-white p-3 border-[3px] border-[var(--meetupr-sub)] rounded-md">
              <div class="flex gap-4 pb-3 border-b border-[var(--meetupr-sub)] mb-3 text-sm">
                <span v-for="cat in languageCategories" :key="cat.name" @click="activeLanguageTab = cat.name"
                  :class="activeLanguageTab === cat.name ? 'text-[var(--meetupr-sub)] font-bold border-b-2 border-[var(--meetupr-sub)] cursor-pointer' : 'text-gray-600 font-medium cursor-pointer'">
                  {{ cat.name }}
                </span>
              </div>
              <div v-for="cat in languageCategories" :key="cat.name" v-show="activeLanguageTab === cat.name" class="flex flex-wrap gap-2">
                <button v-for="t in cat.tags" :key="t.code" type="button" :disabled="!editing || isLoading"
                  @click="toggleSpokenLanguage(t.code)"
                  :class="form.spokenLanguages.includes(t.code) ? 'bg-[var(--meetupr-sub)] text-white border border-[var(--meetupr-sub)] rounded-md px-3 py-1 text-sm cursor-pointer' : 'bg-white border border-[var(--meetupr-sub)] rounded-sm px-3 py-1 text-sm cursor-pointer hover:bg-gray-100'">
                  {{ t.label }}
                </button>
              </div>
            </div>
          </div>

          <!-- 学びたい言語（chips表示＋カテゴリ選択） -->
          <div class="flex flex-col gap-2">
            <div class="text-[10px] text-amber-700">学びたい言語</div>
            <div class="flex gap-2 flex-wrap mb-1.5">
              <template v-for="(lang, i) in form.learningLanguages" :key="lang + '-' + i">
                <div :class="['flex items-center bg-white border-2 border-[var(--meetupr-sub)] px-2.5 py-1.5 rounded-full text-xs text-amber-900', !editing ? 'opacity-50 cursor-not-allowed' : '']">
                  <span class="select-none">{{ getLanguageLabel(lang) }}</span>
                  <button v-if="editing" type="button" @click="removeLearningLanguage(lang)" class="ml-2 text-[11px] text-gray-500 hover:text-gray-800">×</button>
                </div>
              </template>
            </div>
            <button type="button" v-if="editing" @click="showLearningLanguages = !showLearningLanguages"
              class="self-start bg-[var(--meetupr-sub)] text-white px-2.5 py-1.5 rounded text-sm cursor-pointer hover:bg-orange-500 transition">選択</button>
            <div v-if="showLearningLanguages" class="bg-white p-3 border-[3px] border-[var(--meetupr-sub)] rounded-md">
              <div class="flex gap-4 pb-3 border-b border-[var(--meetupr-sub)] mb-3 text-sm">
                <span v-for="cat in languageCategories" :key="cat.name" @click="activeLanguageTab = cat.name"
                  :class="activeLanguageTab === cat.name ? 'text-[var(--meetupr-sub)] font-bold border-b-2 border-[var(--meetupr-sub)] cursor-pointer' : 'text-gray-600 font-medium cursor-pointer'">
                  {{ cat.name }}
                </span>
              </div>
              <div v-for="cat in languageCategories" :key="cat.name" v-show="activeLanguageTab === cat.name" class="flex flex-wrap gap-2">
                <button v-for="t in cat.tags" :key="t.code" type="button" :disabled="!editing || isLoading"
                  @click="toggleLearningLanguage(t.code)"
                  :class="form.learningLanguages.includes(t.code) ? 'bg-[var(--meetupr-sub)] text-white border border-[var(--meetupr-sub)] rounded-md px-3 py-1 text-sm cursor-pointer' : 'bg-white border border-[var(--meetupr-sub)] rounded-sm px-3 py-1 text-sm cursor-pointer hover:bg-gray-100'">
                  {{ t.label }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <div class="text-xs text-amber-900">趣味</div>
          <div class="flex gap-2 flex-wrap">
            <!-- 統合したタグ表示: 選択・入力どちらでもここに追加され、×で削除可能にする -->
            <template v-for="(h, i) in form.hobbies" :key="h + '-' + i">
              <div
                :class="[
                  'flex items-center bg-white border-2 border-[var(--meetupr-sub)] px-2.5 py-1.5 rounded-full text-xs text-amber-900',
                  !editing ? 'opacity-50 cursor-not-allowed' : ''
                ]">
                <span class="select-none">{{ h }}</span>
                <button v-if="editing" type="button" @click="removeHobby(h)"
                  class="ml-2 text-[11px] text-gray-500 hover:text-gray-800">×</button>
              </div>
            </template>
          </div>
          <div class="flex gap-2 items-center mt-1.5" v-if="editing">
            <input v-model="newHobby"
              class="flex-1 border-2 border-[var(--meetupr-sub)] p-2 rounded bg-white text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              placeholder="趣味を入力してEnter" @keyup.enter="addHobby()" />
            <button type="button"
              class="bg-[var(--meetupr-sub)] text-white px-2.5 py-1.5 rounded text-sm cursor-pointer hover:bg-orange-500 transition"
              @click="addHobby()">追加</button>
          </div>
        </div>

        <div v-if="editing">
          <label class="text-xs text-amber-900 mb-1 block">既存の選択肢</label>
          <div class="bg-white p-3 border-[3px] border-[var(--meetupr-sub)] rounded-md">
            <div class="flex gap-4 pb-3 border-b border-[var(--meetupr-sub)] mb-3">
              <span v-for="category in choiceCategories" :key="category.name" @click="activeTab = category.name"
                :class="activeTab === category.name ? 'text-[var(--meetupr-sub)] font-bold border-b-2 border-[var(--meetupr-sub)]' : 'text-gray-600 font-medium'">
                {{ category.name }}
              </span>
            </div>
            <div v-for="category in choiceCategories" :key="category.name" v-show="activeTab === category.name"
              class="flex flex-wrap gap-2">
              <button v-for="tag in category.tags" :key="tag" type="button" @click="toggleHobby(tag)" :disabled="false"
                :class="form.hobbies.includes(tag) ? 'bg-[var(--meetupr-sub)] text-gray-400 border border-[var(--meetupr-sub)] rounded-md px-3 py-1 text-sm line-through cursor-not-allowed' : 'bg-white border border-[var(--meetupr-sub)] rounded-sm px-3 py-1 text-sm cursor-pointer hover:bg-gray-100'">
                {{ tag }}
              </button>
            </div>
          </div>
        </div>

        <label class="flex flex-col gap-2">
          <div class="text-xs text-amber-900">一言（50文字以内）</div>
          <textarea :disabled="!editing || isLoading" v-model="form.bio"
            class="border-2 border-[var(--meetupr-sub)] p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed bg-white text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 min-h-16 resize-none"
            maxlength="50" placeholder="よろしくお願いします！！"></textarea>
          <div class="text-xs text-amber-700 text-right mt-1">{{ (form.bio || '').length }}/50</div>
        </label>

        <div class="flex gap-2 mt-1.5" v-if="editing">
          <button type="button"
            :disabled="isSaving"
            class="bg-[var(--meetupr-color-3)]  text-white px-3.5 py-2 rounded text-sm cursor-pointer hover:bg-teal-600 transition flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            @click="save">{{ isSaving ? '保存中...' : '保存' }}</button>
          <button type="button"
            :disabled="isSaving"
            class="bg-gray-300 text-gray-800 px-3.5  py-2 rounded text-sm cursor-pointer hover:bg-gray-400 transition flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            @click="cancel">キャンセル</button>
        </div>
      </form>

      <!-- ログアウトボタン -->
      <div class="mt-8 mb-4">
        <button
          @click="handleLogout"
          class="w-full px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
        >
          ログアウト
        </button>
      </div>
    </main>

    
     <Footer class="fixed inset-x-0 bottom-0" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

import { ref, onMounted } from 'vue'
import Footer from '~/components/Footer.vue'
import { useAuth } from '~/composables/useAuth'

const { user, getAccessToken, logout } = useAuth()

// ログアウト処理
const handleLogout = async () => {
  await logout({
    logoutParams: {
      returnTo: window.location.origin
    }
  })
}
const editing = ref(false)
const isLoading = ref(true)
const isSaving = ref(false)

// make-profile 準拠: 地域・言語分類データとヘルパ
const showOrigin = ref(false)
const showNativeLanguage = ref(false)
const showSpokenLanguages = ref(false)
const showLearningLanguages = ref(false)

const regionCategories = ref([
  {
    name: '東アジア',
    tags: [
      { code: 'JP', label: '日本' },
      { code: 'CN', label: '中国' },
      { code: 'KR', label: '韓国' },
      { code: 'TW', label: '台湾' },
      { code: 'HK', label: '香港' }
    ]
  },
  {
    name: '東南アジア',
    tags: [
      { code: 'ID', label: 'インドネシア' },
      { code: 'VN', label: 'ベトナム' },
      { code: 'MY', label: 'マレーシア' },
      { code: 'MM', label: 'ミャンマー' },
      { code: 'KH', label: 'カンボジア' },
      { code: 'SG', label: 'シンガポール' },
      { code: 'LA', label: 'ラオス' },
      { code: 'TH', label: 'タイ' },
      { code: 'PH', label: 'フィリピン' },
      { code: 'BN', label: 'ブルネイ' }
    ]
  },
  {
    name: '南アジア',
    tags: [
      { code: 'IN', label: 'インド' },
      { code: 'BD', label: 'バングラディシュ' },
      { code: 'PK', label: 'パキスタン' },
      { code: 'NP', label: 'ネパール' },
      { code: 'LK', label: 'スリランカ' },
      { code: 'MV', label: 'モルディブ' }
    ]
  },
  {
    name: '中央アジア',
    tags: [
      { code: 'KG', label: 'キルギス' },
      { code: 'UZ', label: 'ウズベキスタン' },
      { code: 'TJ', label: 'タジキスタン' },
      { code: 'KZ', label: 'カザフスタン' },
      { code: 'AF', label: 'アフガニスタン' },
      { code: 'MN', label: 'モンゴル' }
    ]
  },
  {
    name: '西アジア・中東',
    tags: [
      { code: 'TR', label: 'トルコ' },
      { code: 'IL', label: 'イスラエル' },
      { code: 'OM', label: 'オマーン' }
    ]
  },
  {
    name: 'オセアニア',
    tags: [
      { code: 'AU', label: 'オーストラリア' }
    ]
  },
  {
    name: '北米',
    tags: [
      { code: 'US', label: 'アメリカ' },
      { code: 'CA', label: 'カナダ' }
    ]
  },
  {
    name: '中米・南米',
    tags: [
      { code: 'MX', label: 'メキシコ' },
      { code: 'GT', label: 'グアテマラ' },
      { code: 'PE', label: 'ペルー' }
    ]
  },
  {
    name: 'ヨーロッパ',
    tags: [
      { code: 'GB', label: 'イギリス' },
      { code: 'FR', label: 'フランス' },
      { code: 'DE', label: 'ドイツ' },
      { code: 'IT', label: 'イタリア' },
      { code: 'ES', label: 'スペイン' },
      { code: 'CH', label: 'スイス' },
      { code: 'UA', label: 'ウクライナ' },
      { code: 'RU', label: 'ロシア' },
      { code: 'LT', label: 'リトアニア' },
      { code: 'SE', label: 'スウェーデン' },
      { code: 'NO', label: 'ノルウェー' },
      { code: 'HU', label: 'ハンガリー' },
      { code: 'AT', label: 'オーストリア' }
    ]
  },
  {
    name: 'アフリカ',
    tags: [
      { code: 'EG', label: 'エジプト' },
      { code: 'GH', label: 'ガーナ' },
      { code: 'NG', label: 'ナイジェリア' },
      { code: 'ET', label: 'エチオピア' },
      { code: 'BF', label: 'ブルキナファソ' },
      { code: 'UG', label: 'ウガンダ' },
      { code: 'NA', label: 'ナミビア' },
      { code: 'MA', label: 'モロッコ' },
      { code: 'GA', label: 'ガボン' }
    ]
  }
])

const languageCategories = ref([
  {
    name: 'アジア',
    tags: [
      { code: 'ja', label: '日本語' },
      { code: 'zh', label: '中国語' },
      { code: 'ko', label: '韓国語' },
      { code: 'vi', label: 'ベトナム語' },
      { code: 'id', label: 'インドネシア語' },
      { code: 'th', label: 'タイ語' },
      { code: 'hi', label: 'ヒンディー語' },
      { code: 'bn', label: 'ベンガル語' },
      { code: 'pa', label: 'パンジャブ語' }
    ]
  },
  {
    name: 'ヨーロッパ',
    tags: [
      { code: 'en', label: '英語' },
      { code: 'fr', label: 'フランス語' },
      { code: 'de', label: 'ドイツ語' },
      { code: 'es', label: 'スペイン語' },
      { code: 'pt', label: 'ポルトガル語' },
      { code: 'ru', label: 'ロシア語' }
    ]
  },
  {
    name: 'その他',
    tags: [
      { code: 'ar', label: 'アラビア語' }
    ]
  }
])

const activeRegionTab = ref(regionCategories.value[0]?.name || '東アジア')
const activeLanguageTab = ref(languageCategories.value[0]?.name || 'アジア')

function getCountryLabel(countryCode: string): string {
  const all = regionCategories.value.flatMap(r => r.tags)
  return all.find(c => c.code === countryCode)?.label || countryCode
}

function getLanguageLabel(langCode: string): string {
  const all = languageCategories.value.flatMap(c => c.tags)
  return all.find(t => t.code === langCode)?.label || langCode
}

// ★ 既存の選択肢のデータ（サンプル）
const choiceCategories = ref([
  {
    name: 'スポーツ',
    tags: ['野球', 'サッカー', 'バスケ', 'テニス', 'ゴルフ']
  },
  {
    name: '音楽',
    tags: ['J-POP', 'ロック', 'クラシック', 'ジャズ', 'K-POP']
  },
  {
    name: '食べ物',
    tags: ['寿司', 'ラーメン', '焼肉', 'イタリアン', '中華']
  },
  {
    name: '国',
    tags: ['日本', '中国', '韓国', 'アメリカ', 'イギリス']
  },
])

// ★ 現在選択されているタブ（初期は最初のカテゴリ）
const activeTab = ref(choiceCategories.value[0]?.name || 'スポーツ')

type FormState = {
  name: string
  department: string // major code
  gender: string // male/female/other
  origin: string // country code
  nativeLanguage: string // lang code
  spokenLanguages: string[]
  learningLanguages: string[]
  hobbies: string[]
  bio: string
}

const form = ref<FormState>({
  name: '',
  department: '',
  gender: '',
  origin: '',
  nativeLanguage: 'ja',
  spokenLanguages: [],
  learningLanguages: [],
  hobbies: [],
  bio: ''
})

const newSpokenLanguage = ref('')
const newLearningLanguage = ref('')
const newHobby = ref('')

function toggleEdit() {
  editing.value = !editing.value
}

// 話せる言語の追加・削除
function addSpokenLanguage() {
  const v = newSpokenLanguage.value.trim()
  if (v && !form.value.spokenLanguages.includes(v)) {
    form.value.spokenLanguages.push(v)
    newSpokenLanguage.value = ''
  }
}

function removeSpokenLanguage(lang: string) {
  form.value.spokenLanguages = form.value.spokenLanguages.filter(l => l !== lang)
}

function toggleSpokenLanguage(langCode: string) {
  if (form.value.spokenLanguages.includes(langCode)) {
    removeSpokenLanguage(langCode)
  } else {
    form.value.spokenLanguages.push(langCode)
  }
}

// 学びたい言語の追加・削除
function addLearningLanguage() {
  const v = newLearningLanguage.value.trim()
  if (v && !form.value.learningLanguages.includes(v)) {
    form.value.learningLanguages.push(v)
    newLearningLanguage.value = ''
  }
}

function removeLearningLanguage(lang: string) {
  form.value.learningLanguages = form.value.learningLanguages.filter(l => l !== lang)
}

function toggleLearningLanguage(langCode: string) {
  if (form.value.learningLanguages.includes(langCode)) {
    removeLearningLanguage(langCode)
  } else {
    form.value.learningLanguages.push(langCode)
  }
}

// addHobby: 入力からの追加（既存のボタン挙動）か、引数で名前を渡しての追加の両方に対応
function addHobby(hobby?: string) {
  const v = hobby !== undefined ? String(hobby).trim() : newHobby.value.trim()
  if (v && !form.value.hobbies.includes(v)) {
    form.value.hobbies.push(v)
  }
  // 引数がない場合は入力フィールドをクリア
  if (hobby === undefined) newHobby.value = ''
}

// removeHobby: インデックス指定（既存の編集UI）か、名前指定の両方に対応
function removeHobby(target: number | string) {
  if (typeof target === 'number') {
    form.value.hobbies.splice(target, 1)
  } else {
    form.value.hobbies = form.value.hobbies.filter(h => h !== target)
  }
}

// toggleHobby: 指定した名前があれば削除、なければ追加
function toggleHobby(hobbyName: string) {
  if (form.value.hobbies.includes(hobbyName)) {
    removeHobby(hobbyName)
  } else {
    addHobby(hobbyName)
  }
}

async function save() {
  if (!user.value?.sub) {
    alert('ユーザー情報の取得に失敗しました。ページを再読み込みしてください。')
    return
  }

  const userId = user.value.sub
  const email = user.value.email || ''
  const username = form.value.name || user.value.nickname || user.value.name || ''

  if (!userId || !email || !username) {
    alert('ユーザー情報が不完全です。ページを再読み込みしてください。')
    return
  }

  try {
    isSaving.value = true

    // アクセストークンを取得
    let headers: Record<string, string> = { 'Content-Type': 'application/json' }
    try {
      const token = await getAccessToken()
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    } catch (e) {
      console.info('アクセストークン取得失敗（続行）:', e)
    }

    // すでにコードで保持する（make-profile準拠）
    const nativeLanguageCode = form.value.nativeLanguage || 'ja'
    const spokenLanguagesCodes = Array.isArray(form.value.spokenLanguages) ? form.value.spokenLanguages : []
    const learningLanguagesCodes = Array.isArray(form.value.learningLanguages) ? form.value.learningLanguages : []
    const majorCode = form.value.department || null
    const genderCode = form.value.gender || null

    // ペイロード作成
    const payload = {
      user_id: userId,
      email: email,
      username: username,
      major: majorCode,
      gender: genderCode,
      native_language: nativeLanguageCode,
      spoken_languages: spokenLanguagesCodes,
      learning_languages: learningLanguagesCodes,
      interests: Array.isArray(form.value.hobbies) ? form.value.hobbies : [],
      residence: form.value.origin || null,
      comment: form.value.bio || null,
      last_updated: new Date().toISOString()
    }

    console.log('[my-profile] Sending profile data to /api/profile:', payload)

    // APIを呼び出して保存
    const result = await $fetch<any>('/api/profile', {
      method: 'POST',
      headers,
      body: payload
    })

    console.log('[my-profile] API response:', result)

    if (result && 'error' in result && result.error) {
      console.error('[my-profile] Profile save failed:', result.error, result.details)
      const errorDetails = result.details ? JSON.stringify(result.details) : ''
      alert(`プロフィールの保存に失敗しました。\nエラー: ${result.error}\n${errorDetails ? `詳細: ${errorDetails}` : ''}`)
      return
    }

    if (!result || !result.inserted) {
      console.warn('[my-profile] No data inserted:', result)
      alert('プロフィールの保存に失敗しました。データが挿入されませんでした。')
      return
    }

    console.log('[my-profile] Profile saved successfully:', result)
    
    // オリジナルデータを更新
    original.value = JSON.parse(JSON.stringify(form.value))
    editing.value = false
    alert('プロフィールを保存しました。')
    
    // データを再取得して最新の状態を反映
    await fetchProfile()
  } catch (err: any) {
    console.error('[my-profile] Error saving profile:', err)
    alert(`プロフィールの保存中にエラーが発生しました。\n${err.message || '不明なエラー'}`)
  } finally {
    isSaving.value = false
  }
}

let original = ref<FormState>(JSON.parse(JSON.stringify(form.value)))

function cancel() {
  Object.assign(form.value, JSON.parse(JSON.stringify(original.value)))
  editing.value = false
}

// プロフィールデータを取得
async function fetchProfile() {
  if (!user.value?.sub) {
    console.warn('User ID not available')
    isLoading.value = false
    return
  }

  try {
    isLoading.value = true
    const response: any = await $fetch('/api/profile', {
      query: {
        user_id: user.value.sub
      }
    })

    if (response && response.error) {
      console.error('Error fetching profile:', response.error)
      // エラーが発生してもフォームは表示する（デフォルト値で）
      isLoading.value = false
      return
    }

    // データをフォームに反映
    form.value.name = response.username || ''
  form.value.department = response.major || ''
  form.value.gender = response.gender || ''
  form.value.origin = response.residence || ''
  form.value.nativeLanguage = response.native_language || 'ja'
  form.value.spokenLanguages = Array.isArray(response.spoken_languages) ? response.spoken_languages : []
  form.value.learningLanguages = Array.isArray(response.learning_languages) ? response.learning_languages : []
  form.value.hobbies = Array.isArray(response.interests) ? response.interests : []
    form.value.bio = response.comment || ''

    // オリジナルデータを更新
    original.value = JSON.parse(JSON.stringify(form.value))
  } catch (error) {
    console.error('Failed to fetch profile:', error)
  } finally {
    isLoading.value = false
  }
}

// ページマウント時にデータを取得
onMounted(() => {
  fetchProfile()
})

</script>
