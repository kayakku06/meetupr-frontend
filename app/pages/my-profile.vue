<template>
  <div class="min-h-screen bg-yellow-50 pt-14 pb-20 font-['Noto_Sans_JP']">
    <!-- 固定ヘッダー -->
    <header class="fixed top-0 left-0 right-0 h-14 bg-white shadow-md z-40"></header>

    <!-- コンテンツ -->
    <main class="max-w-md mx-auto bg-transparent p-5">
      <div class="flex gap-3 items-center mb-3">
        <div class="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center border-2 border-amber-200">
          <svg viewBox="0 0 64 64" class="w-11 h-11" aria-hidden><circle cx="32" cy="24" r="12" fill="none" stroke="#6aaea0" stroke-width="2"/><path d="M10 54c4-10 18-14 22-14s18 4 22 14" fill="none" stroke="#6aaea0" stroke-width="2"/></svg>
        </div>

        <div class="flex-1">
          <h2 class="m-0 mb-2 text-lg text-teal-900">{{ form.name || 'なまえ' }}</h2>
          <button class="bg-teal-500 text-white px-2.5 py-1.5 rounded-full inline-flex gap-1.5 items-center text-xs hover:bg-teal-600 transition" @click="toggleEdit">
            <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="#fff"/></svg>
            プロフィール編集
          </button>
        </div>
      </div>

      <form class="flex flex-col gap-3" @submit.prevent>
        <label class="flex flex-col gap-1">
          <div class="text-sm text-yellow-900">学部</div>
          <select :disabled="!editing" v-model="form.department" class="border-2 border-orange-400 p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed bg-white text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200">
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
          <label class="inline-flex items-center gap-1.5 text-sm text-amber-900"><input type="radio" :disabled="!editing" value="男性" v-model="form.gender" class="disabled:opacity-50 disabled:cursor-not-allowed" /> 男性</label>
          <label class="inline-flex items-center gap-1.5 text-sm text-amber-900"><input type="radio" :disabled="!editing" value="女性" v-model="form.gender" class="disabled:opacity-50 disabled:cursor-not-allowed" /> 女性</label>
          <label class="inline-flex items-center gap-1.5 text-sm text-amber-900"><input type="radio" :disabled="!editing" value="その他" v-model="form.gender" class="disabled:opacity-50 disabled:cursor-not-allowed" /> その他</label>
        </fieldset>

        <label class="flex flex-col gap-2">
          <div class="text-xs text-amber-900">出身</div>
          <input :disabled="!editing" v-model="form.origin" class="border-2 border-orange-400 p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed bg-white text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200" placeholder="例：日本" />
        </label>

        <div class="flex flex-col gap-4">
          <div class="text-xs text-amber-900">言語</div>
          <!-- ネイティブ -->
          <div class="flex flex-col gap-1">
            <div class="text-[10px] text-amber-700">ネイティブ</div>
            <select :disabled="!editing" v-model="form.nativeLanguage" class="border-2 border-orange-400 p-2 rounded bg-white text-sm outline-none disabled:opacity-50 disabled:cursor-not-allowed focus:border-orange-500 focus:ring-2 focus:ring-orange-200">
              <option value="" disabled>選択してください</option>
              <option value="日本語">日本語</option>
              <option value="英語">英語</option>
            </select>
          </div>
          <!-- 話せる言語 -->
          <div class="flex flex-col gap-1">
            <div class="text-[10px] text-amber-700">話せる言語</div>
            <select :disabled="!editing" v-model="form.spokenLanguages" class="border-2 border-orange-400 p-2 rounded bg-white text-sm outline-none disabled:opacity-50 disabled:cursor-not-allowed focus:border-orange-500 focus:ring-2 focus:ring-orange-200">
              <option value="" disabled>選択してください</option>
              <option value="日本語">日本語</option>
              <option value="英語">英語</option>
            </select>
          </div>
          <!-- 学びたい言語 -->
          <div class="flex flex-col gap-1">
            <div class="text-[10px] text-amber-700">学びたい言語</div>
            <select :disabled="!editing" v-model="form.learningLanguages" class="border-2 border-orange-400 p-2 rounded bg-white text-sm outline-none disabled:opacity-50 disabled:cursor-not-allowed focus:border-orange-500 focus:ring-2 focus:ring-orange-200">
              <option value="" disabled>選択してください</option>
              <option value="日本語">日本語</option>
              <option value="英語">英語</option>
            </select>
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <div class="text-xs text-amber-900">趣味</div>
          <div class="flex gap-2 flex-wrap">
            <!-- 統合したタグ表示: 選択・入力どちらでもここに追加され、×で削除可能にする -->
            <template v-for="(h, i) in form.hobbies" :key="h + '-' + i">
              <div class="flex items-center bg-white border-2 border-orange-400 px-2.5 py-1.5 rounded-full text-xs text-amber-900">
                <span class="select-none">{{ h }}</span>
                  <button v-if="editing" type="button" @click="removeHobby(h)" class="ml-2 text-[11px] text-gray-500 hover:text-gray-800">×</button>
              </div>
            </template>
          </div>
          <div class="flex gap-2 items-center mt-1.5" v-if="editing">
            <input v-model="newHobby" class="flex-1 border-2 border-orange-400 p-2 rounded bg-white text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200" placeholder="趣味を入力してEnter" @keyup.enter="addHobby()" />
            <button type="button" class="bg-orange-400 text-white px-2.5 py-1.5 rounded text-sm cursor-pointer hover:bg-orange-500 transition" @click="addHobby()">追加</button>
          </div>
        </div>

     <div v-if="editing">
       <label class="text-xs text-amber-900 mb-1 block">既存の選択肢</label>
             <div class="bg-white p-3 border-[3px] border-[#FEBC6E] rounded-md">
                <div class="flex gap-4 pb-3 border-b border-[#FEBC6E] mb-3">
                  <span v-for="category in choiceCategories" :key="category.name" @click="activeTab = category.name" :class="activeTab === category.name ? 'text-[#FEBC6E] font-bold border-b-2 border-[#FEBC6E]' : 'text-gray-600 font-medium'">
                    {{ category.name }}
                  </span>
                </div>
                <div v-for="category in choiceCategories" :key="category.name" v-show="activeTab === category.name" class="flex flex-wrap gap-2">
                  <button v-for="tag in category.tags" :key="tag" type="button" @click="toggleHobby(tag)" :disabled="false" :class="form.hobbies.includes(tag) ? 'bg-[#FEBC6E] text-gray-400 border border-[#FEBC6E] rounded-md px-3 py-1 text-sm line-through cursor-not-allowed' : 'bg-white border border-[#FEBC6E] rounded-sm px-3 py-1 text-sm cursor-pointer hover:bg-gray-100'">
                    {{ tag }}
                  </button>
               </div>
             </div>
        </div>

        <label class="flex flex-col gap-2">
          <div class="text-xs text-amber-900">一言（50文字以内）</div>
          <textarea :disabled="!editing" v-model="form.bio" class="border-2 border-orange-400 p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed bg-white text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 min-h-16 resize-none" maxlength="50" placeholder="よろしくお願いします！！"></textarea>
          <div class="text-xs text-amber-700 text-right mt-1">{{ form.bio.length }}/50</div>
        </label>

        <div class="flex gap-2 mt-1.5" v-if="editing">
          <button type="button" class="bg-teal-500 text-white px-3.5 py-2 rounded text-sm cursor-pointer hover:bg-teal-600 transition flex-1" @click="save">保存</button>
          <button type="button" class="bg-gray-300 text-gray-800 px-3.5 py-2 rounded text-sm cursor-pointer hover:bg-gray-400 transition flex-1" @click="cancel">キャンセル</button>
        </div>
      </form>
    </main>

    <!-- 固定フッター -->
    <Footer class="fixed inset-x-0 bottom-0" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Footer from '~/components/Footer.vue'

const editing = ref(false)

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
  name: 'なまえ',
  department: '学部を選択',
  gender: 'その他',
  origin: '日本',
  nativeLanguage: '',
  spokenLanguages: '',
  learningLanguages: '',
  hobbies: ['料理', '野球'],
  bio: 'よろしくお願いします！！'
})

const newLanguage = ref('')
const newHobby = ref('')

function toggleEdit() {
  editing.value = !editing.value
}

function addLanguage() {
  const v = newLanguage.value.trim()
  if (v) {
    // languages プロパティが存在しないため、この関数は削除
    newLanguage.value = ''
  }
}

function removeLanguage(i) {
  // languages プロパティが存在しないため、この関数は削除
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

function save() {
  // 実際は API 呼び出しをここに入れる
  editing.value = false
  alert('保存しました（サンプル）')
}

const original = JSON.parse(JSON.stringify(form.value))
function cancel() {
  Object.assign(form.value, JSON.parse(JSON.stringify(original)))
  editing.value = false
}

</script>
