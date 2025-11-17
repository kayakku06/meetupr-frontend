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
    langNative: '日本語',
    langSpoken: '',
    langLearning: '',
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
    const u = user.value
    if (!u) {
        console.error('[registerProfile] User not found')
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