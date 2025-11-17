<template>
    <div class="min-h-screen bg-[var(--meetupr-main)] pt-14 pb-20 font-['Noto_Sans_JP']">

        <main class="max-w-md mx-auto p-5 ">
            <div class="flex gap-3 items-center mb-3">
                <div
                    class="w-20 h-20 rounded-full bg-[var(--meetup-color-3)] flex items-center justify-center border-2 border-[var(--meetupr-color-3)]">
                    <svg viewBox="0 0 64 64" class="w-11 h-11" aria-hidden>
                        <circle cx="32" cy="24" r="12" fill="none" stroke="#6aaea0" stroke-width="2" />
                        <path d="M10 54c4-10 18-14 22-14s18 4 22 14" fill="none" stroke="#6aaea0" stroke-width="2" />
                    </svg>
                </div>

                <div class="flex-1">
                    <h2 class="m-0 mb-2 text-lg text-teal-900">プロフィール登録</h2>
                </div>
            </div>

            <form @submit.prevent="registerProfile" class="flex flex-col gap-3">

                <label class="flex flex-col gap-1">
                    <div class="text-sm text-yellow-900">学部</div>
                    <select v-model="form.faculty"
                        class="border-2 border-[var(--meetupr-sub)] p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed bg-white text-sm outline-none">
                        <option value="" disabled selected></option>
                        <option value="engineering">工学部</option>
                        <option value="economics">経済学部</option>
                        <option value="literature">文学部</option>
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

                <label class="flex flex-col gap-2">
                    <div class="text-xs text-amber-900">出身</div>
                    <input v-model="form.origin"
                        class="border-2 border-[var(--meetupr-sub)] p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed bg-white text-sm outline-none"
                        placeholder="例：日本" />
                </label>

                <div class="flex flex-col gap-4">
                    <div class="text-xs text-amber-900">言語</div>
                    <div class="flex flex-col gap-2">
                        <select v-model="form.langNative"
                            class="border-2 border-[var(--meetupr-sub)] p-2 rounded bg-white text-sm outline-none disabled:opacity-50 disabled:cursor-not-allowed">
                            <option value="native">ネイティブ</option>
                        </select>
                        <select v-model="form.langSpoken"
                            class="border-2 border-[var(--meetupr-sub)] p-2 rounded bg-white text-sm outline-none disabled:opacity-50 disabled:cursor-not-allowed">
                            <option value="">話せる言語</option>
                            <option value="en">英語</option>
                            <option value="cn">中国語</option>
                        </select>
                        <select v-model="form.langLearning"
                            class="border-2 border-[var(--meetupr-sub)] p-2 rounded bg-white text-sm outline-none disabled:opacity-50 disabled:cursor-not-allowed">
                            <option value="">学びたい言語</option>
                            <option value="fr">フランス語</option>
                            <option value="es">スペイン語</option>
                        </select>
                    </div>
                </div>

                <div class="flex flex-col gap-2">
                    <div class="text-xs text-amber-900">趣味</div>
                    <div class="flex flex-wrap gap-2">
                        <span v-if="!(Array.isArray(form.hobbies) && form.hobbies.length > 0)" class="text-gray-400 text-sm">下の選択肢から趣味を選んでください</span>
                        <button v-for="hobby in (Array.isArray(form.hobbies) ? form.hobbies : [])" :key="hobby" type="button" @click="removeHobby(hobby)"
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
                            <span v-for="category in (Array.isArray(choiceCategories) ? choiceCategories : [])" :key="category.name"
                                @click="activeTab = category.name"
                                :class="activeTab === category.name ? 'text-[var(--meetupr-sub)] font-bold border-b-2 border-[var(--meetupr-sub)]' : 'text-gray-600 font-medium'">
                                {{ category.name }}
                            </span>
                        </div>
                        <div v-for="category in choiceCategories" :key="category.name"
                            v-show="activeTab === category.name" class="flex flex-wrap gap-2">
                            <button v-for="tag in (Array.isArray(category.tags) ? category.tags : [])" :key="tag" type="button" @click="toggleHobby(tag)"
                                :disabled="false"
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

        <Footer class="fixed inset-x-0 bottom-0" />
    </div>
</template>

<script setup>
definePageMeta({
    middleware: 'auth'
})

import { ref, onMounted } from 'vue';
import { useAuth0 } from '@auth0/auth0-vue'
// Auth0のComposableはクライアントでのみ利用可能なため、トップレベルで分割代入しない

// フォームデータをrefで管理
const form = ref({
    // テンプレートと合わせたプロパティを用意
    faculty: '',
    major: '',
    gender: null,
    origin: '',
    residence: '',
    native_language: '日本語',
    // テンプレートでは langNative/langSpoken/langLearning を使用しているため両方用意
    langNative: '日本語',
    langSpoken: '',
    langLearning: '',
    // internal names kept for payload
    spoken_languages: [],
    learning_languages: [],
    // テンプレートは `form.hobbies` を参照するため保持
    hobbies: [],
    bio: '',
    comment: '',
});

// 一時入力用
const newHobby = ref('')

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
]);

// ★ 現在選択されているタブ
const activeTab = ref(choiceCategories.value[0].name); // 初期タブを「スポーツ」に
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

// Auth0関連の参照をクライアントで初期化
let auth = null
let getAccessTokenSilently = null

onMounted(async () => {
    try {
        auth = (typeof useAuth0 !== 'undefined') ? useAuth0() : null
        if (auth) {
            getAccessTokenSilently = auth.getAccessTokenSilently
            console.log('[Auth0] initialized (auth ref) in make-profile.vue', { isAuthenticated: auth.isAuthenticated?.value, isLoading: auth.isLoading?.value })
            
            // Auth0のロードが完了するまで待機
            const waitForAuth = () => {
                return new Promise((resolve) => {
                    if (!auth.isLoading?.value) {
                        resolve()
                        return
                    }
                    // ポーリングでロード状態をチェック
                    const checkInterval = setInterval(() => {
                        if (!auth.isLoading?.value) {
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
            const u = auth.user?.value
            if (u && auth.isAuthenticated?.value) {
                console.log('[Auth0] user loaded:', { user_id: u.sub, username: u.nickname || u.name, email: u.email })
                
                // Auth0で新規登録した際に、usersテーブルとprofilesテーブルにnullの状態でデータを保存
                const userId = u.sub || ''
                const email = u.email || ''
                const username = u.nickname || u.name || ''
                
                if (userId && email && username) {
                    try {
                        // アクセストークンを取得
                        let headers = { 'Content-Type': 'application/json' }
                        try {
                            const token = getAccessTokenSilently ? await getAccessTokenSilently() : null
                            if (token) headers['Authorization'] = `Bearer ${token}`
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
                console.log('[Auth0] user not yet loaded or not authenticated')
            }
        } else {
            console.log('[Auth0] useAuth0 returned undefined in make-profile.vue')
        }
    } catch (e) {
        console.warn('useAuth0 を初期化できませんでした:', e)
    }
})

// フォーム送信時の処理
const registerProfile = async () => {
    console.log('[registerProfile] Called')
    
    // Auth0が初期化されていない場合は初期化を試みる
    if (!auth) {
        try {
            auth = (typeof useAuth0 !== 'undefined') ? useAuth0() : null
            if (auth) {
                getAccessTokenSilently = auth.getAccessTokenSilently
            }
        } catch (e) {
            console.warn('useAuth0 を初期化できませんでした:', e)
        }
    }

    // Auth0が初期化されていない場合
    if (!auth) {
        console.error('Auth0 not initialized')
        alert('認証情報の取得に失敗しました。ページを再読み込みしてください。')
        return
    }

    // 必要ならAuth0のロード待ち
    if (auth.isLoading?.value) {
        console.log('[registerProfile] Auth0 is still loading, waiting...')
        // 最大5秒待機
        let waitCount = 0
        while (auth.isLoading?.value && waitCount < 50) {
            await new Promise(resolve => setTimeout(resolve, 100))
            waitCount++
        }
    }

    if (!auth.isAuthenticated?.value) {
        console.error('未認証のため送信できません')
        alert('認証されていません。ログインしてください。')
        return
    }

    // Auth0のuserオブジェクトから必要情報を取り出す
    const u = auth.user?.value || {}
    const userId = u.sub || ''
    const email = u.email || ''
    const username = u.nickname || u.name || ''

    console.log('[Auth0] sending as:', { user_id: userId, username, email })

    // ペイロード作成
    // 話せる言語を配列に変換
    const spokenLanguages = form.value.langSpoken 
        ? [form.value.langSpoken] 
        : (Array.isArray(form.value.spoken_languages) ? form.value.spoken_languages : [])
    
    // 学びたい言語を配列に変換
    const learningLanguages = form.value.langLearning 
        ? [form.value.langLearning] 
        : (Array.isArray(form.value.learning_languages) ? form.value.learning_languages : [])
    
    const payload = {
        user_id: userId,
        email: email,
        username: username,
        major: form.value.faculty || form.value.major || null, // facultyをmajorにマッピング
        gender: form.value.gender || null,
        native_language: form.value.langNative || form.value.native_language || '日本語',
        spoken_languages: spokenLanguages,
        learning_languages: learningLanguages,
        residence: form.value.origin || form.value.residence || null,
        comment: form.value.bio || form.value.comment || null, // bioをcommentにマッピング
        last_updated: new Date().toISOString()
    }

    console.log('送信ペイロード:', payload)

    try {
        // 可能であればアクセストークンを取得してAuthorizationに付与
        let headers = { 'Content-Type': 'application/json' }
        try {
            const token = getAccessTokenSilently ? await getAccessTokenSilently() : null
            if (token) headers['Authorization'] = `Bearer ${token}`
        } catch (e) {
            // トークン取得失敗は致命的ではない（パブリックAPI等）
            console.info('アクセストークン取得失敗:', e)
        }

        const res = await fetch('/api/profile', {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
        })

        if (!res.ok) {
            const text = await res.text()
            console.error('プロフィール送信に失敗しました:', res.status, text)
            alert('プロフィールの保存に失敗しました。もう一度お試しください。')
            return
        }

        const result = await res.json()
        console.log('プロフィールを送信しました:', result)
        alert('プロフィールを保存しました。')
        // プロフィール登録成功後は/homeにリダイレクト
        navigateTo('/home')
    } catch (err) {
        console.error('送信中にエラーが発生しました:', err)
        alert('エラーが発生しました。もう一度お試しください。')
    }
};
</script>