<template>

  <div class="min-h-screen bg-[var(--meetupr-main)] pt-14 pb-20 font-['Noto_Sans_JP']">
  
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
          <select :disabled="!editing || isLoading" v-model="form.department"
            class="border-2 border-[var(--meetupr-sub)] p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed bg-white text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 appearance-none ">
            <option value="" disabled>学部を選択</option>
            <option value="経営学部">経営学部</option>
            <option value="政策科学部">政策科学部</option>
            <option value="情報理工学部">情報理工学部</option>
            <option value="映像学部">映像学部</option>
            <option value="総合心理学部">総合心理学部</option>
            <option value="グローバル教養学部">グローバル教養学部</option>
          </select>
        </label>

        <fieldset class="flex flex-col gap-2">
          <legend class="text-xs text-amber-900">性別</legend>
          <label class="inline-flex items-center gap-1.5 text-sm text-amber-900"><input type="radio"
              :disabled="!editing || isLoading" value="男性" v-model="form.gender"
              class="disabled:opacity-50 disabled:cursor-not-allowed" /> 男性</label>
          <label class="inline-flex items-center gap-1.5 text-sm text-amber-900"><input type="radio"
              :disabled="!editing || isLoading" value="女性" v-model="form.gender"
              class="disabled:opacity-50 disabled:cursor-not-allowed" /> 女性</label>
          <label class="inline-flex items-center gap-1.5 text-sm text-amber-900"><input type="radio"
              :disabled="!editing || isLoading" value="その他" v-model="form.gender"
              class="disabled:opacity-50 disabled:cursor-not-allowed" /> その他</label>
        </fieldset>

        <label class="flex flex-col gap-2">
          <div class="text-xs text-amber-900">出身</div>
          <input :disabled="!editing || isLoading" v-model="form.origin"
            class="border-2 border-[var(--meetupr-sub)] p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed bg-white text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
            placeholder="例：日本" />
        </label>

        <div class="flex flex-col gap-4">
          <div class="text-xs text-amber-900">言語</div>
          <!-- ネイティブ -->
          <div class="flex flex-col gap-1">
            <div class="text-[10px] text-amber-700">ネイティブ</div>
            <select :disabled="!editing || isLoading" v-model="form.nativeLanguage"
              class="border-2 border-[var(--meetupr-sub)] p-2 rounded bg-white text-sm outline-none disabled:opacity-50 disabled:cursor-not-allowed focus:border-orange-500 focus:ring-2 focus:ring-orange-200">
              <option value="" disabled>選択してください</option>
              <option value="日本語">日本語</option>
              <option value="英語">英語</option>
              <option value="中国語">中国語</option>
              <option value="韓国語">韓国語</option>
              <option value="スペイン語">スペイン語</option>
              <option value="フランス語">フランス語</option>
              <option value="ドイツ語">ドイツ語</option>
            </select>
          </div>
          <!-- 話せる言語 -->
          <div class="flex flex-col gap-1">
            <div class="text-[10px] text-amber-700">話せる言語</div>
            <div class="flex gap-2 flex-wrap mb-1.5">
              <template v-for="(lang, i) in form.spokenLanguages" :key="lang + '-' + i">
                <div
                  :class="[
                    'flex items-center bg-white border-2 border-[var(--meetupr-sub)] px-2.5 py-1.5 rounded-full text-xs text-amber-900',
                    !editing ? 'opacity-50 cursor-not-allowed' : ''
                  ]">
                  <span class="select-none">{{ lang }}</span>
                  <button v-if="editing" type="button" @click="removeSpokenLanguage(lang)"
                    class="ml-2 text-[11px] text-gray-500 hover:text-gray-800">×</button>
                </div>
              </template>
            </div>
            <div class="flex gap-2 items-center" v-if="editing">
              <select v-model="newSpokenLanguage"
                class="flex-1 border-2 border-[var(--meetupr-sub)] p-2 rounded bg-white text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200">
                <option value="" disabled>言語を選択</option>
                <option value="日本語">日本語</option>
                <option value="英語">英語</option>
                <option value="中国語">中国語</option>
                <option value="韓国語">韓国語</option>
                <option value="スペイン語">スペイン語</option>
                <option value="フランス語">フランス語</option>
                <option value="ドイツ語">ドイツ語</option>
              </select>
              <button type="button"
                class="bg-[var(--meetupr-sub)] text-white px-2.5 py-1.5 rounded text-sm cursor-pointer hover:bg-orange-500 transition"
                @click="addSpokenLanguage()">追加</button>
            </div>
          </div>
          <!-- 学びたい言語 -->
          <div class="flex flex-col gap-1">
            <div class="text-[10px] text-amber-700">学びたい言語</div>
            <div class="flex gap-2 flex-wrap mb-1.5">
              <template v-for="(lang, i) in form.learningLanguages" :key="lang + '-' + i">
                <div
                  :class="[
                    'flex items-center bg-white border-2 border-[var(--meetupr-sub)] px-2.5 py-1.5 rounded-full text-xs text-amber-900',
                    !editing ? 'opacity-50 cursor-not-allowed' : ''
                  ]">
                  <span class="select-none">{{ lang }}</span>
                  <button v-if="editing" type="button" @click="removeLearningLanguage(lang)"
                    class="ml-2 text-[11px] text-gray-500 hover:text-gray-800">×</button>
                </div>
              </template>
            </div>
            <div class="flex gap-2 items-center" v-if="editing">
              <select v-model="newLearningLanguage"
                class="flex-1 border-2 border-[var(--meetupr-sub)] p-2 rounded bg-white text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200">
                <option value="" disabled>言語を選択</option>
                <option value="日本語">日本語</option>
                <option value="英語">英語</option>
                <option value="中国語">中国語</option>
                <option value="韓国語">韓国語</option>
                <option value="スペイン語">スペイン語</option>
                <option value="フランス語">フランス語</option>
                <option value="ドイツ語">ドイツ語</option>
              </select>
              <button type="button"
                class="bg-[var(--meetupr-sub)] text-white px-2.5 py-1.5 rounded text-sm cursor-pointer hover:bg-orange-500 transition"
                @click="addLearningLanguage()">追加</button>
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
    </main>

    
     <Footer class="fixed inset-x-0 bottom-0" />
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth'
})

import { ref, onMounted } from 'vue'
import Footer from '~/components/Footer.vue'
import { useAuth } from '~/composables/useAuth'

const { user, getAccessToken } = useAuth()
const editing = ref(false)
const isLoading = ref(true)
const isSaving = ref(false)

// 言語名から言語コードへの逆マッピング
const languageLabelToCode = {
  '日本語': 'ja',
  '中国語': 'zh',
  '韓国語': 'ko',
  'ベトナム語': 'vi',
  'インドネシア語': 'id',
  'タイ語': 'th',
  'ヒンディー語': 'hi',
  'ベンガル語': 'bn',
  'パンジャブ語': 'pa',
  '英語': 'en',
  'フランス語': 'fr',
  'ドイツ語': 'de',
  'スペイン語': 'es',
  'ポルトガル語': 'pt',
  'ロシア語': 'ru',
  'アラビア語': 'ar'
}

// 言語名を言語コードに変換する関数
function getLanguageCode(label: string): string {
  return languageLabelToCode[label] || label
}

// 言語名の配列を言語コードの配列に変換
function convertLanguageLabelsToCodes(labels: string[]): string[] {
  return labels.map(label => getLanguageCode(label))
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
const activeTab = ref(choiceCategories.value[0].name)

const form = ref({
  name: '',
  department: '',
  gender: '',
  origin: '',
  nativeLanguage: '',
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

function removeSpokenLanguage(lang) {
  form.value.spokenLanguages = form.value.spokenLanguages.filter(l => l !== lang)
}

// 学びたい言語の追加・削除
function addLearningLanguage() {
  const v = newLearningLanguage.value.trim()
  if (v && !form.value.learningLanguages.includes(v)) {
    form.value.learningLanguages.push(v)
    newLearningLanguage.value = ''
  }
}

function removeLearningLanguage(lang) {
  form.value.learningLanguages = form.value.learningLanguages.filter(l => l !== lang)
}

// addHobby: 入力からの追加（既存のボタン挙動）か、引数で名前を渡しての追加の両方に対応
function addHobby(hobby) {
  const v = hobby !== undefined ? String(hobby).trim() : newHobby.value.trim()
  if (v && !form.value.hobbies.includes(v)) {
    form.value.hobbies.push(v)
  }
  // 引数がない場合は入力フィールドをクリア
  if (hobby === undefined) newHobby.value = ''
}

// removeHobby: インデックス指定（既存の編集UI）か、名前指定の両方に対応
function removeHobby(target) {
  if (typeof target === 'number') {
    form.value.hobbies.splice(target, 1)
  } else {
    form.value.hobbies = form.value.hobbies.filter(h => h !== target)
  }
}

// toggleHobby: 指定した名前があれば削除、なければ追加
function toggleHobby(hobbyName) {
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

    // 言語名を言語コードに変換
    const nativeLanguageCode = form.value.nativeLanguage 
      ? getLanguageCode(form.value.nativeLanguage)
      : 'ja' // デフォルト値
    const spokenLanguagesCodes = Array.isArray(form.value.spokenLanguages)
      ? convertLanguageLabelsToCodes(form.value.spokenLanguages)
      : []
    const learningLanguagesCodes = Array.isArray(form.value.learningLanguages)
      ? convertLanguageLabelsToCodes(form.value.learningLanguages)
      : []

    // ペイロード作成
    const payload = {
      user_id: userId,
      email: email,
      username: username,
      major: form.value.department || null,
      gender: form.value.gender || null,
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
    const result = await $fetch<{ status?: string; inserted?: any; error?: string; details?: any }>('/api/profile', {
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

let original = ref(JSON.parse(JSON.stringify(form.value)))

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
    const response = await $fetch('/api/profile', {
      query: {
        user_id: user.value.sub
      }
    })

    if (response.error) {
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
    form.value.nativeLanguage = response.native_language || ''
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
