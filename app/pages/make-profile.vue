<template>
    <div class="min-h-screen bg-[var(--meetupr-main)] pb-20 font-['Noto_Sans_JP']">

        <main class="max-w-md mx-auto p-5">
            <div class="flex flex-col items-center justify-center gap-3 mb-3">
                <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFileChange" />

                <div class="w-full">
                    <h2 class="m-0 mb-2 text-xl sm:text-2xl font-bold text-teal-900 text-center">プロフィール登録</h2>
                </div>
                <div class="relative inline-block">
                    <div class="w-20 h-20 rounded-full bg-[var(--meetup-color-3)] flex items-center justify-center border-2 border-[var(--meetupr-color-3)] overflow-hidden cursor-pointer"
                        role="button" aria-label="プロフィール画像を選択" @click="onAvatarClick">
                        <template v-if="profileImageDataUrl">
                            <img :src="profileImageDataUrl" alt="avatar" class="w-full h-full object-cover" />
                        </template>
                        <template v-else>
                            <svg viewBox="0 0 64 64" class="w-11 h-11" aria-hidden>
                                <circle cx="32" cy="24" r="12" fill="none" stroke="#6aaea0" stroke-width="2" />
                                <path d="M10 54c4-10 18-14 22-14s18 4 22 14" fill="none" stroke="#6aaea0"
                                    stroke-width="2" />
                            </svg>
                        </template>
                    </div>

                    <div
                        class="absolute bottom-0 right-0 w-7 h-7 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-white" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor" stroke-width="4">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                    </div>
                </div>

                
            </div>
            <form @submit.prevent="registerProfile" class="flex flex-col gap-3">

                <label class="flex flex-col gap-1">
                    <div class="text-sm text-yellow-900">学部</div>
                    <select v-model="form.faculty"
                        class="border-2 border-[var(--meetupr-sub)] p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed bg-white text-sm outline-none">
                        <option value="" disabled selected></option>
                        <option value="business">経営</option>
                        <option value="production_science">政策科学</option>
                        <option value="information_science">情報理工</option>
                        <option value="film_studies">映像</option>
                        <option value="psychology">総合心理</option>
                        <option value="global_liberal_arts">グローバル教養</option>


                    </select>
                </label>

                <fieldset class="flex flex-col gap-2">
                    <legend class="text-xs text-amber-900">性別</legend>
                    <label class="inline-flex items-center gap-1.5 text-sm text-amber-900"><input type="radio"
                            value="male" v-model="form.gender"
                            class="disabled:opacity-50 disabled:cursor-not-allowed" /> 男性</label>
                    <label class="inline-flex items-center gap-1.5 text-sm text-amber-900"><input type="radio"
                            value="female" v-model="form.gender"
                            class="disabled:opacity-50 disabled:cursor-not-allowed" /> 女性</label>
                    <label class="inline-flex items-center gap-1.5 text-sm text-amber-900"><input type="radio"
                            value="other" v-model="form.gender"
                            class="disabled:opacity-50 disabled:cursor-not-allowed" /> その他</label>
                </fieldset>

                <!-- 出身 -->
                <div class="flex flex-col gap-2">
                    <button type="button" @click="showOrigin = !showOrigin"
                        class="border-2 border-[var(--meetupr-sub)] p-2 rounded bg-white text-sm outline-none text-left hover:bg-gray-50 transition">
                        <div class="flex justify-between items-center mb-2">
                            <span class="font-medium text-xs text-amber-900">出身</span>
                            <span :class="showOrigin ? 'rotate-180' : ''">▼</span>
                        </div>
                        <div v-if="form.origin">
                            <span
                                class="bg-white text-amber-900 border-2 border-[var(--meetupr-sub)] rounded-full px-3 py-1 text-xs">
                                {{ getCountryLabel(form.origin) }}
                            </span>
                        </div>
                        <span v-else class="text-gray-400 text-sm">選択してください</span>
                    </button>

                    <div v-if="showOrigin" class="bg-white p-3 border-[3px] border-[var(--meetupr-sub)] rounded-md">
                        <!-- 地域タブ -->
                        <div class="flex gap-4 pb-3 border-b border-[var(--meetupr-sub)] mb-3 overflow-x-auto">
                            <span v-for="category in regionCategories" :key="category.name"
                                @click="activeRegionTab = category.name"
                                class="cursor-pointer pb-2 transition whitespace-nowrap text-[11px]"
                                :class="activeRegionTab === category.name ? 'text-[var(--meetupr-sub)] font-normal border-b-2 border-[var(--meetupr-sub)]' : 'text-gray-600 font-normal'">
                                {{ category.name }}
                            </span>
                        </div>
                        <!-- 国選択ボタン -->
                        <div v-for="category in regionCategories" :key="category.name"
                            v-show="activeRegionTab === category.name" class="flex flex-wrap gap-2">
                            <button v-for="country in category.tags" :key="country.code" type="button"
                                @click="form.origin = country.code"
                                :class="form.origin === country.code ? 'bg-[var(--meetupr-sub)] text-gray-400 border border-[var(--meetupr-sub)] rounded-md px-3 py-1 text-sm line-through cursor-not-allowed' : 'bg-white border border-[var(--meetupr-sub)] rounded-sm px-3 py-1 text-sm cursor-pointer hover:bg-gray-100'">
                                {{ country.label }}
                            </button>
                        </div>
                    </div>
                </div>

                <div class="flex flex-col gap-4">
                    <div class="text-xs text-amber-900">言語</div>
                    <div class="flex flex-col gap-2">

                        <!-- 母国語 -->
                        <div class="flex flex-col gap-2">
                            <button type="button" @click="showNativeLanguage = !showNativeLanguage"
                                class="border-2 border-[var(--meetupr-sub)] p-2 rounded bg-white text-sm outline-none text-left hover:bg-gray-50 transition">
                                <div class="flex justify-between items-center mb-2">
                                    <span class="font-medium">母国語</span>
                                    <span :class="showNativeLanguage ? 'rotate-180' : ''">▼</span>
                                </div>
                                <div v-if="form.langNative">
                                    <span
                                        class="bg-white text-amber-900 border-2 border-[var(--meetupr-sub)] rounded-full px-3 py-1 text-xs">
                                        {{ getLanguageLabel(form.langNative) }}
                                    </span>
                                </div>
                                <span v-else class="text-gray-400 text-sm">選択してください</span>
                            </button>

                            <div v-if="showNativeLanguage"
                                class="bg-white p-3 border-[3px] border-[var(--meetupr-sub)] rounded-md">
                                <div class="flex gap-4 pb-3 border-b border-[var(--meetupr-sub)] mb-3">
                                    <span v-for="category in languageCategories" :key="category.name"
                                        @click="activeLanguageTab = category.name"
                                        class="cursor-pointer pb-1 transition whitespace-nowrap text-[11px]"
                                        :class="activeLanguageTab === category.name ? 'text-[var(--meetupr-sub)] font-normal border-b-2 border-[var(--meetupr-sub)]' : 'text-gray-600 font-normal'">
                                        {{ category.name }}
                                    </span>
                                </div>
                                <div v-for="category in languageCategories" :key="category.name"
                                    v-show="activeLanguageTab === category.name" class="flex flex-wrap gap-2">
                                    <button v-for="lang in category.tags" :key="lang.code" type="button"
                                        @click="form.langNative = lang.code" :disabled="false"
                                        :class="form.langNative === lang.code ? 'bg-[var(--meetupr-sub)] text-gray-400 border border-[var(--meetupr-sub)] rounded-md px-3 py-1 text-sm line-through cursor-not-allowed' : 'bg-white border border-[var(--meetupr-sub)] rounded-sm px-3 py-1 text-sm cursor-pointer hover:bg-gray-100'">
                                        {{ lang.label }}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 話せる言語 -->
                    <div class="flex flex-col gap-2">
                        <button type="button" @click="showSpokenLanguages = !showSpokenLanguages"
                            class="border-2 border-[var(--meetupr-sub)] p-2 rounded bg-white text-sm outline-none text-left hover:bg-gray-50 transition">
                            <div class="flex justify-between items-center mb-2">
                                <span class="font-medium">話せる言語</span>
                                <span :class="showSpokenLanguages ? 'rotate-180' : ''">▼</span>
                            </div>
                            <div class="flex flex-wrap gap-2" v-if="form.langSpoken.length > 0">
                                <span v-for="langCode in form.langSpoken" :key="langCode"
                                    class="bg-white text-amber-900 border-2 border-[var(--meetupr-sub)] rounded-full px-3 py-1 text-xs">
                                    {{ getLanguageLabel(langCode) }}
                                </span>
                            </div>
                            <span v-else class="text-gray-400 text-sm">選択してください</span>
                        </button>

                        <div v-if="showSpokenLanguages"
                            class="bg-white p-3 border-[3px] border-[var(--meetupr-sub)] rounded-md">

                            <div class="flex gap-4 pb-3 border-b border-[var(--meetupr-sub)] mb-3">
                                <span v-for="category in languageCategories" :key="category.name"
                                    @click="activeLanguageTab = category.name"
                                    class="cursor-pointer pb-1 transition whitespace-nowrap text-[11px]"
                                    :class="activeLanguageTab === category.name ? 'text-[var(--meetupr-sub)] font-normal border-b-2 border-[var(--meetupr-sub)]' : 'text-gray-600 font-normal'">
                                    {{ category.name }}
                                </span>
                            </div>
                            <div v-for="category in languageCategories" :key="category.name"
                                v-show="activeLanguageTab === category.name" class="flex flex-wrap gap-2">
                                <button v-for="lang in category.tags" :key="lang.code" type="button"
                                    @click="toggleSpokenLanguage(lang.code)" :disabled="false"
                                    :class="form.langSpoken.includes(lang.code) ? 'bg-[var(--meetupr-sub)] text-gray-400 border border-[var(--meetupr-sub)] rounded-md px-3 py-1 text-sm line-through cursor-not-allowed' : 'bg-white border border-[var(--meetupr-sub)] rounded-sm px-3 py-1 text-sm cursor-pointer hover:bg-gray-100'">
                                    {{ lang.label }}
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- 学びたい言語 -->
                    <div class="flex flex-col gap-2">
                        <button type="button" @click="showLearningLanguages = !showLearningLanguages"
                            class="border-2 border-[var(--meetupr-sub)] p-2 rounded bg-white text-sm outline-none text-left hover:bg-gray-50 transition">
                            <div class="flex justify-between items-center mb-2">
                                <span class="font-medium">学びたい言語</span>
                                <span :class="showLearningLanguages ? 'rotate-180' : ''">▼</span>
                            </div>
                            <div class="flex flex-wrap gap-2" v-if="form.langLearning.length > 0">
                                <span v-for="langCode in form.langLearning" :key="langCode"
                                    class="bg-white text-amber-900 border-2 border-[var(--meetupr-sub)] rounded-full px-3 py-1 text-xs">
                                    {{ getLanguageLabel(langCode) }}
                                </span>
                            </div>
                            <span v-else class="text-gray-400 text-sm">選択してください</span>
                        </button>

                        <div v-if="showLearningLanguages"
                            class="bg-white p-3 border-[3px] border-[var(--meetupr-sub)] rounded-md">
                            <div class="flex gap-4 pb-3 border-b border-[var(--meetupr-sub)] mb-3">
                                <span v-for="category in languageCategories" :key="category.name"
                                    @click="activeLanguageTab = category.name"
                                    class="cursor-pointer pb-1 transition whitespace-nowrap text-[11px]"
                                    :class="activeLanguageTab === category.name ? 'text-[var(--meetupr-sub)] font-normal border-b-2 border-[var(--meetupr-sub)]' : 'text-gray-600 font-normal'">
                                    {{ category.name }}
                                </span>
                            </div>
                            <div v-for="category in languageCategories" :key="category.name"
                                v-show="activeLanguageTab === category.name" class="flex flex-wrap gap-2">
                                <button v-for="lang in category.tags" :key="lang.code" type="button"
                                    @click="toggleLearningLanguage(lang.code)" :disabled="false"
                                    :class="form.langLearning.includes(lang.code) ? 'bg-[var(--meetupr-sub)] text-gray-400 border border-[var(--meetupr-sub)] rounded-md px-3 py-1 text-sm line-through cursor-not-allowed' : 'bg-white border border-[var(--meetupr-sub)] rounded-sm px-3 py-1 text-sm cursor-pointer hover:bg-gray-100'">
                                    {{ lang.label }}
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

                <div class="flex flex-col gap-2">
                    <div class="text-xs text-amber-900">趣味</div>
                    <div class="flex flex-wrap gap-2">
                        <span v-if="!(Array.isArray(form.hobbies) && form.hobbies.length > 0)"
                            class="text-gray-400 text-sm">下の選択肢から趣味を選んでください</span>
                        <button v-for="hobby in (Array.isArray(form.hobbies) ? form.hobbies : [])" :key="hobby"
                            type="button" @click="removeHobby(hobby)"
                            class="bg-white text-amber-900 border-2 border-[var(--meetupr-sub)] rounded-full px-3 py-1 text-xs">
                            {{ hobby }} <span class="ml-1 font-bold opacity-70">×</span>
                        </button>
                    </div>
                </div>


                <div v-if="true">
                    <label class="text-xs text-amber-900 mb-1 block">既存の選択肢</label>
                    <div class="flex gap-2 items-center mt-1.5">
                        <input v-model="newHobby"
                            class="flex-1 border-2 border-[var(--meetupr-sub)] p-2 rounded bg-white text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                            placeholder="趣味を入力してEnter" @keyup.enter="addHobby()" />
                        <button type="button"
                            class="bg-[var(--meetupr-sub)] text-white px-2.5 py-1.5 rounded text-sm cursor-pointer hover:bg-orange-500 transition"
                            @click="addHobby()">追加</button>
                    </div>

                    <div class="bg-white p-3 border-[3px] border-[var(--meetupr-sub)] rounded-md">
                        <div class="flex gap-4 pb-3 border-b border-[var(--meetupr-sub)] mb-3">
                            <span v-for="category in (Array.isArray(choiceCategories) ? choiceCategories : [])"
                                :key="category.name" @click="activeTab = category.name"
                                class="cursor-pointer pb-1 transition whitespace-nowrap text-[11px]"
                                :class="activeTab === category.name ? 'text-[var(--meetupr-sub)] font-normal border-b-2 border-[var(--meetupr-sub)]' : 'text-gray-600 font-normal'">
                                {{ category.name }}
                            </span>
                        </div>
                        <div v-for="category in choiceCategories" :key="category.name"
                            v-show="activeTab === category.name" class="flex flex-wrap gap-2">
                            <button v-for="tag in (Array.isArray(category.tags) ? category.tags : [])" :key="tag"
                                type="button" @click="toggleHobby(tag)" :disabled="false"
                                :class="(Array.isArray(form.hobbies) && form.hobbies.includes(tag)) ? 'bg-[var(--meetupr-sub)] text-gray-400 border border-[var(--meetupr-sub)] rounded-md px-3 py-1 text-sm line-through cursor-not-allowed' : 'bg-white border border-[var(--meetupr-sub)] rounded-sm px-3 py-1 text-sm cursor-pointer hover:bg-gray-100'">
                                {{ tag }}
                            </button>
                        </div>
                    </div>
                </div>

                <label class="flex flex-col gap-2">
                    <div class="text-xs text-amber-900">一言（50文字以内）</div>
                    <textarea v-model="form.bio"
                        class="border-2 border-[var(--meetupr-sub)] p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed bg-white text-sm outline-none min-h-16 resize-none"
                        maxlength="50" placeholder="一言を入力してください"></textarea>
                    <div class="text-xs text-amber-700 text-right mt-1">{{ (form.bio || '').length }}/50</div>
                </label>

                <div class="flex gap-2 mt-1.5">
                    <button type="submit"
                        class="bg-[var(--meetupr-color-3)] text-white px-3.5 py-2 rounded text-sm cursor-pointer hover:bg-teal-600 transition flex-1">登録</button>
                </div>

            </form>
        </main>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    middleware: 'auth'
})

import { ref, onMounted } from 'vue';

// フォームデータをrefで管理
const form = ref({
    // テンプレートと合わせたプロパティを用意
    faculty: '',
    major: '',
    gender: null as string | null,
    origin: '',
    residence: '',
    native_language: '日本語',
    // テンプレートでは langNative/langSpoken/langLearning を使用しているため両方用意
    langNative: '',

    langSpoken: [] as string[],
    langLearning: [] as string[],

    // internal names kept for payload
    spoken_languages: [] as string[],
    learning_languages: [] as string[],
    // テンプレートは `form.hobbies` を参照するため保持
    hobbies: [] as string[],
    bio: '',
    comment: '',
});

// 一時入力用
const newHobby = ref('')

// プロフィール画像を保持するための state
const profileImageDataUrl = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

// アバタークリックでファイル選択を開く
const onAvatarClick = () => {
    if (fileInput.value) {
        fileInput.value.click()
    }
}

// ファイル選択時の処理: サーバに multipart で送信して public URL を受け取る（FileReader を使わない）
const onFileChange = async (e: Event) => {
    const input = e.target as HTMLInputElement
    const file = input?.files?.[0]
    if (!file) return

    // 即時プレビュー用: object URL を一時的に表示
    let objectUrl: string | null = null
    try {
        objectUrl = URL.createObjectURL(file)
        profileImageDataUrl.value = objectUrl
        if (typeof window !== 'undefined') {
            try { localStorage.setItem('make_profile_image', objectUrl) } catch (err) { /* ignore */ }
        }
    } catch (err) {
        /* ignore preview failures */
    }

    // フォームデータ作成
    const formData = new FormData()
    formData.append('file', file, file.name)

    // 可能なら user_id を付与
    try {
        const u = user?.value
        if (u && u.sub) formData.append('user_id', u.sub)
    } catch (e) {
        // ignore
    }

    // Authorization トークンがあれば付与（ヘッダのみ）
    const fetchOptions: any = { method: 'POST', body: formData }
    try {
        const token = await getAccessToken()
        if (token) fetchOptions.headers = { 'Authorization': `Bearer ${token}` }
    } catch (e) {
        // token 取得失敗は続行
        console.info('[make-profile] getAccessToken failed (continuing):', e)
    }

    try {
        const res = await fetch('/api/profile/upload', fetchOptions)
        if (res.ok) {
            const json = await res.json()
            const url = json?.url || null
            if (url) {
                profileImageDataUrl.value = url
                if (typeof window !== 'undefined') {
                    try { localStorage.setItem('make_profile_image', url) } catch (err) { /* ignore */ }
                }
            } else {
                console.warn('[make-profile] upload returned no url')
            }
        } else {
            const txt = await res.text()
            console.warn('[make-profile] upload failed:', res.status, txt)
        }
    } catch (err) {
        console.warn('[make-profile] avatar upload error (non-fatal):', err)
    } finally {
        // 一時 object URL を作成していれば後で revoke してメモリ解放
        if (objectUrl) {
            try { URL.revokeObjectURL(objectUrl) } catch (e) { /* ignore */ }
        }
    }
}

// localStorage から復元
onMounted(() => {
    if (typeof window === 'undefined') return
    try {
        const saved = localStorage.getItem('make_profile_image')
        if (saved) profileImageDataUrl.value = saved
    } catch (err) {
        /* ignore */
    }
})

// (selectedRegion removed — not used)

// 各セクションの展開状態
const showOrigin = ref(false)
const showNativeLanguage = ref(false)
const showSpokenLanguages = ref(false)
const showLearningLanguages = ref(false)

// 現在選択されている地域タブ
const activeRegionTab = ref('')

// 地域ごとの国分類（言語と同じ形式）
const regionCategories = ref([
    {
        name: '東アジア',
        tags: [
            { code: 'JP', label: '日本' },
            { code: 'CN', label: '中国' },
            { code: 'KR', label: '韓国' },
            { code: 'TW', label: '台湾' },
            { code: 'MN', label: 'モンゴル' }
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
            { code: 'AF', label: 'アフガニスタン' }
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
        name: '東アジア(香港)',
        tags: [
            { code: 'HK', label: '香港' }
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

// 初期タブを設定
activeRegionTab.value = regionCategories.value[0]?.name || '東アジア'

// regionCountries/getCountriesByRegion removed — regionCategories を直接使用

// 国コードからラベルを取得する関数
function getCountryLabel(countryCode: string): string {
    const allCountries = regionCategories.value.flatMap(region => region.tags)
    return allCountries.find(country => country.code === countryCode)?.label || countryCode
}

// 言語カテゴリーのデータ
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
]);

// 現在選択されている言語タブ
const activeLanguageTab = ref(languageCategories.value[0]?.name || 'アジア');

// 言語を追加する関数（話せる言語）
function toggleSpokenLanguage(langCode: string) {
    if (form.value.langSpoken.includes(langCode)) {
        form.value.langSpoken = form.value.langSpoken.filter(l => l !== langCode)
    } else {
        form.value.langSpoken.push(langCode)
    }
}

// removeSpokenLanguage removed — UI では使用していないため削除

// 言語を追加する関数（学びたい言語）
function toggleLearningLanguage(langCode: string) {
    if (form.value.langLearning.includes(langCode)) {
        form.value.langLearning = form.value.langLearning.filter(l => l !== langCode)
    } else {
        form.value.langLearning.push(langCode)
    }
}

// removeLearningLanguage removed — UI では使用していないため削除

// 言語コードからラベルを取得する関数
function getLanguageLabel(langCode: string): string {
    const allLanguages = languageCategories.value.flatMap(cat => cat.tags)
    return allLanguages.find(tag => tag.code === langCode)?.label || langCode
}

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
]);

// ★ 現在選択されているタブ
const activeTab = ref(choiceCategories.value[0]?.name || 'スポーツ'); // 初期タブを「スポーツ」に
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
        form.value.hobbies = form.value.hobbies.filter((h: string) => h !== target)
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

// useAuthコンポーザブルを使用
const { user, isAuthenticated, isLoading, getAccessToken } = useAuth()

onMounted(async () => {
    // Auth0のロードが完了するまで待機
    const waitForAuth = (): Promise<void> => {
        return new Promise<void>((resolve) => {
            if (!isLoading.value) {
                resolve()
                return
            }
            // ポーリングでロード状態をチェック
            const checkInterval = setInterval(() => {
                if (!isLoading.value) {
                    clearInterval(checkInterval)
                    resolve()
                }
            }, 100)
            // タイムアウト: 5秒後に強制的に解決
            setTimeout(() => {
                clearInterval(checkInterval)
                resolve()
            }, 5000)
        })
    }

    await waitForAuth()

    // 取得済みのユーザ情報を表示（存在する場合）
    const u = user.value
    if (u && isAuthenticated.value) {
        console.log('[make-profile] User loaded:', { user_id: u.sub, username: u.nickname || u.name, email: u.email })

        // 既にSupabaseにユーザーが存在するかチェック
        const userId = u.sub || ''
        if (userId) {
            try {
                // プロフィールが既に存在するかチェック
                const profileCheck = await $fetch<{ hasProfile?: boolean; hasCompleteProfile?: boolean; error?: string }>('/api/profile/check', {
                    method: 'GET',
                    query: {
                        user_id: userId
                    }
                })

                // 既にプロフィールが存在する場合は、保存処理をスキップ
                // signup.vueで既に保存されているため
                if (profileCheck.hasProfile) {
                    console.log('[make-profile] User already exists in Supabase, skipping registration')
                    return
                }
            } catch (err) {
                console.warn('[make-profile] Error checking profile (non-fatal):', err)
                // エラーが発生した場合は続行（既存の処理を実行）
            }
        }

        // Auth0で新規登録した際に、usersテーブルとprofilesテーブルにnullの状態でデータを保存
        // 注意: この処理は既にsignup.vueで実行されているため、通常は実行されない
        const email = u.email || ''
        const username = u.nickname || u.name || ''

        if (userId && email && username) {
            try {
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

                // nullの状態でusersテーブルとprofilesテーブルにデータを保存
                const initialPayload = {
                    user_id: userId,
                    email: email,
                    username: username,
                    major: null,
                    gender: null,
                    native_language: '日本語', // デフォルト値（NOT NULL制約のため）
                    spoken_languages: [],
                    learning_languages: [],
                    interests: [],
                    residence: null,
                    comment: null,
                    last_updated: new Date().toISOString()
                }

                console.log('[make-profile] Registering user to Supabase:', initialPayload)

                const res = await fetch('/api/profile', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(initialPayload)
                })

                if (res.ok) {
                    console.log('[make-profile] User and profile registered successfully in Supabase')
                } else {
                    const text = await res.text()
                    console.warn('[make-profile] Failed to register user (non-fatal):', res.status, text)
                }
            } catch (err) {
                console.warn('[make-profile] Error registering user (non-fatal):', err)
            }
        }
    } else {
        console.log('[make-profile] User not yet loaded or not authenticated', { user: u, isAuthenticated: isAuthenticated.value })
    }
})

// フォーム送信時の処理
const registerProfile = async () => {
    console.log('[registerProfile] Called')
    console.log('[registerProfile] Auth state:', { isAuthenticated: isAuthenticated.value, isLoading: isLoading.value, user: user.value })

    // 必要ならAuth0のロード待ち
    if (isLoading.value) {
        console.log('[registerProfile] Auth is still loading, waiting...')
        // 最大5秒待機
        let waitCount = 0
        while (isLoading.value && waitCount < 50) {
            await new Promise(resolve => setTimeout(resolve, 100))
            waitCount++
        }
    }

    if (!isAuthenticated.value) {
        console.error('[registerProfile] Not authenticated', { isAuthenticated: isAuthenticated.value, user: user.value })
        alert('認証されていません。ログインしてください。')
        return
    }

    // ユーザー情報を取得
    let u = user.value

    // user.valueがnullの場合、localStorageから直接取得を試みる
    if (!u && typeof window !== 'undefined') {
        try {
            const config = useRuntimeConfig()
            const scope = 'openid profile email'
            const auth0CacheKey = `@@auth0spajs@@::${config.public.auth0ClientId}::${config.public.auth0Domain}::${scope}`
            const cachedData = localStorage.getItem(auth0CacheKey)

            if (cachedData) {
                const parsed = JSON.parse(cachedData)
                const idToken = parsed.body?.id_token

                if (idToken) {
                    const tokenParts = idToken.split('.')
                    if (tokenParts.length === 3 && tokenParts[1]) {
                        const payload = JSON.parse(atob(tokenParts[1]))
                        u = {
                            sub: payload.sub,
                            email: payload.email,
                            nickname: payload.nickname,
                            name: payload.name,
                            picture: payload.picture
                        }
                        console.log('[registerProfile] User retrieved from localStorage:', u)
                    }
                }
            }
        } catch (err) {
            console.warn('[registerProfile] Failed to get user from localStorage:', err)
        }
    }

    if (!u) {
        console.error('[registerProfile] User not found', { user: user.value, isAuthenticated: isAuthenticated.value })
        alert('ユーザー情報の取得に失敗しました。ページを再読み込みしてください。')
        return
    }

    const userId = u.sub || ''
    const email = u.email || ''
    const username = u.nickname || u.name || ''

    if (!userId || !email || !username) {
        console.error('[registerProfile] Missing user information', { userId, email, username })
        alert('ユーザー情報が不完全です。ページを再読み込みしてください。')
        return
    }

    console.log('[registerProfile] Sending as:', { user_id: userId, username, email })

    // もし画像が選択されていれば、先に /api/profile/upload に送信して
    // Supabase に保存された public URL を取得して avatar_url に使う
    let uploadedAvatarUrl: string | null = null
    if (profileImageDataUrl.value) {
        try {
            const uploadHeaders: Record<string, string> = { 'Content-Type': 'application/json' }
            try {
                const token = await getAccessToken()
                if (token) uploadHeaders['Authorization'] = `Bearer ${token}`
            } catch (e) {
                // トークン取得失敗は続行（upload エンドポイントが認証不要な場合もある）
                console.info('[registerProfile] getAccessToken failed (continuing):', e)
            }

            console.log('[registerProfile] Uploading avatar to /api/profile/upload')
            const uploadRes = await fetch('/api/profile/upload', {
                method: 'POST',
                headers: uploadHeaders,
                body: JSON.stringify({ user_id: userId, filename: `${username || userId}-avatar.png`, dataUrl: profileImageDataUrl.value })
            })

            if (uploadRes.ok) {
                const json = await uploadRes.json()
                uploadedAvatarUrl = json?.url || null
                console.log('[registerProfile] upload returned url:', uploadedAvatarUrl)
            } else {
                const txt = await uploadRes.text()
                console.warn('[registerProfile] upload failed:', uploadRes.status, txt)
            }
        } catch (err) {
            console.warn('[registerProfile] avatar upload error (non-fatal):', err)
        }
    }

    // ペイロード作成
    // 話せる言語を配列に変換

    const spokenLanguages = Array.isArray(form.value.langSpoken)
        ? form.value.langSpoken
        : (form.value.langSpoken ? [form.value.langSpoken] : (Array.isArray(form.value.spoken_languages) ? form.value.spoken_languages : []))

    // 学びたい言語を配列に変換
    const learningLanguages = Array.isArray(form.value.langLearning)
        ? form.value.langLearning
        : (form.value.langLearning ? [form.value.langLearning] : (Array.isArray(form.value.learning_languages) ? form.value.learning_languages : []))


    const payload = {
        user_id: userId,
        email: email,
        username: username,
        major: form.value.faculty || form.value.major || null, // facultyをmajorにマッピング
        gender: form.value.gender || null,
        native_language: form.value.langNative || form.value.native_language || '日本語',
        spoken_languages: spokenLanguages,
        learning_languages: learningLanguages,
        interests: Array.isArray(form.value.hobbies) ? form.value.hobbies : [],
        avatar_url: uploadedAvatarUrl || profileImageDataUrl.value || null,
        residence: form.value.origin || form.value.residence || null,
        comment: form.value.bio || form.value.comment || null, // bioをcommentにマッピング
        last_updated: new Date().toISOString()

    }

    console.log('送信ペイロード:', payload)

    try {
        // 可能であればアクセストークンを取得してAuthorizationに付与
        let headers: Record<string, string> = { 'Content-Type': 'application/json' } as Record<string, string>
        try {
            const token = await getAccessToken()
            if (token) {
                headers['Authorization'] = `Bearer ${token}`
            }
        } catch (e) {
            // トークン取得失敗は致命的ではない（パブリックAPI等）
            console.info('アクセストークン取得失敗:', e)
        }

        console.log('[registerProfile] Sending profile data to /api/profile:', payload)

        // $fetchを使用してAPIを呼び出す
        const result = await $fetch<{ status?: string; inserted?: any; error?: string; details?: any }>('/api/profile', {
            method: 'POST',
            headers,
            body: payload
        })

        console.log('[registerProfile] API response:', result)

        if (result && 'error' in result && result.error) {
            console.error('[registerProfile] Profile save failed:', result.error, result.details)
            const errorDetails = result.details ? JSON.stringify(result.details) : ''
            alert(`プロフィールの保存に失敗しました。\nエラー: ${result.error}\n${errorDetails ? `詳細: ${errorDetails}` : ''}`)
            return
        }

        if (!result || !result.inserted) {
            console.warn('[registerProfile] No data inserted:', result)
            alert('プロフィールの保存に失敗しました。データが挿入されませんでした。')
            return
        }

        console.log('[registerProfile] Profile saved successfully:', result)
        alert('プロフィールを保存しました。')
        // プロフィール登録成功後は/homeにリダイレクト
        navigateTo('/home')
    } catch (err: any) {
        console.error('[registerProfile] Error saving profile:', err)
        console.error('[registerProfile] Error details:', {
            status: err.status,
            statusText: err.statusText,
            data: err.data,
            message: err.message
        })
        const errorMessage = err.data?.error || err.data?.details || err.message || 'エラーが発生しました。もう一度お試しください。'
        alert(`エラーが発生しました。\n${errorMessage}`)
    }
};
</script>