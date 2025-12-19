<template>

  <div class="min-h-screen bg-[var(--meetupr-main)] pb-20 font-['Noto_Sans_JP']">
  
   <!--　<header class="fixed top-0 left-0 right-0 h-14 bg-white shadow-md z-40"></header>　-->

    <!-- コンテンツ -->
    <main class="max-w-md mx-auto p-5 ">
      <div class="flex gap-3 items-center mb-3">
        <!-- 画像選択用のhidden input（編集時にだけ使う） -->
        <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFileChange" />

        <!-- アバター + 編集時の＋ボタン（make-profile準拠） -->
        <div class="relative inline-block">
          <div
            class="w-20 h-20 rounded-full bg-[var(--meetup-color-3)] flex items-center justify-center border-2 border-[var(--meetupr-color-3)] overflow-hidden"
            :class="{ 'cursor-pointer': editing }"
            :role="editing ? 'button' : undefined"
            :aria-label="editing ? 'プロフィール画像を選択' : undefined"
            @click="editing && onAvatarClick()"
          >
            <template v-if="avatarUrl">
              <img :src="avatarUrl" alt="avatar" class="w-full h-full object-cover" />
            </template>
            <template v-else>
              <svg viewBox="0 0 64 64" class="w-11 h-11" aria-hidden>
                <circle cx="32" cy="24" r="12" fill="none" stroke="#6aaea0" stroke-width="2" />
                <path d="M10 54c4-10 18-14 22-14s18 4 22 14" fill="none" stroke="#6aaea0" stroke-width="2" />
              </svg>
            </template>
          </div>
          <!-- 右下の＋バッジ（編集時のみ表示。デコレーション用でクリックイベントは親に透過） -->
          <div
            v-if="editing"
            class="absolute bottom-0 right-0 w-7 h-7 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center pointer-events-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="4" aria-hidden>
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
        </div>

        <div class="flex-1">
          <template v-if="!editing">
            <h2 class="m-0 mb-2 text-lg text-teal-900">{{ form.name || 'なまえ' }}</h2>
          </template>
          <template v-else>
            <label class="sr-only" for="username-input">ユーザー名</label>
            <textarea
              id="username-input"
              v-model="form.name"
              :disabled="isLoading"
              rows="1"
              class="w-full border-2 border-[var(--meetupr-sub)] p-1.5 rounded bg-white text-lg outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 h-10 leading-tight disabled:opacity-50 disabled:cursor-not-allowed mb-1"
              placeholder="ユーザー名を入力"
            ></textarea>
          </template>
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
          <div class="text-sm text-yellow-900">学部 <span class="text-red-500">*</span></div>
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

        <fieldset v-if="editing" class="flex flex-col gap-2">
          <legend class="text-xs text-amber-900">性別</legend>
          <label class="inline-flex items-center gap-1.5 text-sm text-amber-900">
            <input
              type="radio"
              :disabled="isLoading"
              value="male"
              v-model="form.gender"
              class="disabled:opacity-50 disabled:cursor-not-allowed"
            />
            男性
          </label>
          <label class="inline-flex items-center gap-1.5 text-sm text-amber-900">
            <input
              type="radio"
              :disabled="isLoading"
              value="female"
              v-model="form.gender"
              class="disabled:opacity-50 disabled:cursor-not-allowed"
            />
            女性
          </label>
          <label class="inline-flex items-center gap-1.5 text-sm text-amber-900">
            <input
              type="radio"
              :disabled="isLoading"
              value="other"
              v-model="form.gender"
              class="disabled:opacity-50 disabled:cursor-not-allowed"
            />
            その他
          </label>
        </fieldset>
        <div v-else class="flex flex-col gap-1">
          <div class="text-xs text-amber-900">性別</div>
          <div class="inline-flex items-center gap-1.5 text-sm text-amber-900">
            <input
              type="radio"
              disabled
              :checked="!!form.gender"
              class="disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {{ getGenderLabel(form.gender) || '未設定' }}
          </div>
        </div>

        <!-- 出身（選択UIのみコンポーネント化） -->
        <div class="flex flex-col gap-4">
          <div class="text-sm text-amber-900">出身 <span class="text-red-500">*</span></div>
          <CategorySelect
            :categories="regionCategories"
            v-model="form.origin"
            :multiple="false"
            :readonly="!editing"
            :disabled="!editing || isLoading"
            placeholder="選択してください"
          />
        </div>

        <div class="flex flex-col gap-4">
          <div class="text-sm text-amber-900">言語</div>
          <!-- ネイティブ・話せる・学びたい をCategorySelectへ統一（選択UIのみコンポーネント化） -->
          <CategorySelect
            title="ネイティブ"
            :required="true"
            :categories="languageCategories"
            v-model="form.nativeLanguage"
            :multiple="true"
            :readonly="!editing"
            :disabled="!editing || isLoading"
            placeholder="選択してください（必須）"
          />

          <CategorySelect
            title="話せる言語"
            :categories="languageCategories"
            v-model="form.spokenLanguages"
            :multiple="true"
            :readonly="!editing"
            :disabled="!editing || isLoading"
            placeholder="選択してください"
          />

          <CategorySelect
            title="学びたい言語"
            :categories="languageCategories"
            v-model="form.learningLanguages"
            :multiple="true"
            :readonly="!editing"
            :disabled="!editing || isLoading"
            placeholder="選択してください"
          />
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
          <!-- make-profileと同じ構成: 上にラベル、入力+追加ボタン、下にpanelOnlyのCategorySelect -->
          <div v-if="editing">
            <label class="text-xs text-amber-900 mb-1 block">既存の選択肢</label>
            <div class="flex gap-2 items-center mt-1.5">
              <input v-model="newHobby"
                class="flex-1 border-2 border-[var(--meetupr-sub)] p-2 rounded bg-white text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                placeholder="趣味を入力してEnter" @keyup.enter="addHobby()" />
              <button type="button"
                class="bg-[var(--meetupr-sub)] text-white px-2.5 py-1.5 rounded text-sm cursor-pointer hover:bg-orange-500 transition"
                @click="addHobby()">追加</button>
            </div>
            <div class="mt-3">
              <CategorySelect
                v-model="form.hobbies"
                :categories="choiceCategories"
                :multiple="true"
                :panelOnly="true"
                placeholder="選択してください"
                title="趣味"
                selectButtonLabel="選択"
              />
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
            :disabled="isSaveDisabled"
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

import { ref, onMounted, computed, watch } from 'vue'
import CategorySelect from '~/components/CategorySelect.vue'
import Footer from '~/components/Footer.vue'
import { useAuth } from '~/composables/useAuth'
import { normalizeCountryCode } from '~/utils/countryMapping'

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
const avatarUrl = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

// make-profile 準拠: 地域・言語分類データとヘルパ（選択UIはCategorySelectで表示）

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

// タブや開閉状態はCategorySelect内部で管理するため不要

function getCountryLabel(countryCode: string): string {
  const all = regionCategories.value.flatMap(r => r.tags)
  return all.find(c => c.code === countryCode)?.label || countryCode
}

function getLanguageLabel(langCode: string): string {
  const all = languageCategories.value.flatMap(c => c.tags)
  return all.find(t => t.code === langCode)?.label || langCode
}

function getGenderLabel(g: string): string {
  switch (g) {
    case 'male':
      return '男性'
    case 'female':
      return '女性'
    case 'other':
      return 'その他'
    default:
      return ''
  }
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
  nativeLanguage: string[] // lang codes (UIはchips形式、先頭1件のみ保持)
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
  nativeLanguage: ['ja'],
  spokenLanguages: [],
  learningLanguages: [],
  hobbies: [],
  bio: ''
})

const newHobby = ref('')

function toggleEdit() {
  editing.value = !editing.value
}

// 言語のトグル/追加はCategorySelect側で管理するため不要

// addHobby: 入力からの追加（既存のボタン挙動）か、引数で名前を渡しての追加の両方に対応
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
  // 必須チェック（学部・出身・母国語）
  if (!form.value.department) {
    alert('学部は必須です。選択してください。')
    return
  }
  if (!form.value.origin) {
    alert('出身は必須です。選択してください。')
    return
  }
  if (!Array.isArray(form.value.nativeLanguage) || form.value.nativeLanguage.length === 0) {
    alert('母国語は必須です。選択してください。')
    return
  }
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
  const nativeLanguageCode = (Array.isArray(form.value.nativeLanguage) && form.value.nativeLanguage[0]) ? form.value.nativeLanguage[0] : 'ja'
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
      residence: normalizeCountryCode(form.value.origin) || null,
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

// 保存ボタンの無効判定
const isSaveDisabled = computed(() => {
  const hasNative = Array.isArray(form.value.nativeLanguage) ? form.value.nativeLanguage.length > 0 : false
  return isSaving.value || !form.value.department || !form.value.origin || !hasNative
})

// ネイティブ言語はchips UIだが常に1件のみ保持
watch(
  () => form.value.nativeLanguage,
  (nv, ov) => {
    const next = Array.isArray(nv) ? nv : (nv ? [nv] : [])
    if (next.length > 1) {
      const prev = Array.isArray(ov) ? ov : (ov ? [ov] : [])
      const added = next.find(x => !prev.includes(x))
      const candidate = added ?? next[0]
      form.value.nativeLanguage = candidate ? [candidate] : []
    }
  }
)

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
  form.value.nativeLanguage = response.native_language ? [response.native_language] : ['ja']
  form.value.spokenLanguages = Array.isArray(response.spoken_languages) ? response.spoken_languages : []
  form.value.learningLanguages = Array.isArray(response.learning_languages) ? response.learning_languages : []
  form.value.hobbies = Array.isArray(response.interests) ? response.interests : []
    form.value.bio = response.comment || ''
    
    // avatar_urlを設定（null、空文字列、undefinedの場合はnullに統一）
    const avatarUrlValue = response.avatar_url
    if (avatarUrlValue && typeof avatarUrlValue === 'string' && avatarUrlValue.trim() !== '') {
      avatarUrl.value = avatarUrlValue.trim()
      console.log('[my-profile] Avatar URL set:', avatarUrl.value)
    } else {
      avatarUrl.value = null
      console.log('[my-profile] Avatar URL not available:', avatarUrlValue)
    }

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

// アバター選択UI（make-profileを参考に、編集中のみ有効）
const onAvatarClick = () => {
  if (fileInput.value) fileInput.value.click()
}

const onFileChange = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input?.files?.[0]
  if (!file) return

  // 即時プレビュー: 一旦 object URL を表示
  let objectUrl: string | null = null
  try {
    objectUrl = URL.createObjectURL(file)
    avatarUrl.value = objectUrl
  } catch (err) {
    // ignore preview failures
  }

  const formData = new FormData()
  formData.append('file', file, file.name)

  try {
    const u = user?.value
    if (u?.sub) formData.append('user_id', u.sub)
  } catch (_) {
    /* ignore */
  }

  const fetchOptions: any = { method: 'POST', body: formData }
  try {
    const token = await getAccessToken()
    if (token) fetchOptions.headers = { Authorization: `Bearer ${token}` }
  } catch (e) {
    // token 取得失敗は続行
    console.info('[my-profile] getAccessToken failed (continuing):', e)
  }

  try {
    const res = await fetch('/api/profile/upload', fetchOptions)
    if (res.ok) {
      const json = await res.json()
      const url = json?.url || null
      if (url) {
        avatarUrl.value = url
      } else {
        console.warn('[my-profile] upload returned no url')
      }
    } else {
      const txt = await res.text()
      console.warn('[my-profile] upload failed:', res.status, txt)
    }
  } catch (err) {
    console.warn('[my-profile] avatar upload error (non-fatal):', err)
  } finally {
    if (objectUrl) {
      try { URL.revokeObjectURL(objectUrl) } catch (_) { /* ignore */ }
    }
  }
}

</script>
