import { H3Event } from 'h3'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('[API] Supabase env vars not set: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
})

// 言語コードから日本語名へのマッピング
const languageCodeToLabel: Record<string, string> = {
  'ja': '日本語',
  'zh': '中国語',
  'ko': '韓国語',
  'vi': 'ベトナム語',
  'id': 'インドネシア語',
  'th': 'タイ語',
  'hi': 'ヒンディー語',
  'bn': 'ベンガル語',
  'pa': 'パンジャブ語',
  'en': '英語',
  'fr': 'フランス語',
  'de': 'ドイツ語',
  'es': 'スペイン語',
  'pt': 'ポルトガル語',
  'ru': 'ロシア語',
  'ar': 'アラビア語'
}

// 学部コードから日本語名へのマッピング
const majorCodeToLabel: Record<string, string> = {
  'business': '経営学部',
  'economics': '経営学部', // 旧コード（後方互換性のため）
  'production_science': '政策科学部',
  'information_science': '情報理工学部',
  'film_studies': '映像学部',
  'psychology': '総合心理学部',
  'global_liberal_arts': 'グローバル教養学部'
}

// 学部コードを日本語名に変換する関数
function getMajorLabel(majorCode: string): string {
  return majorCodeToLabel[majorCode] || majorCode
}

// 性別コードから日本語名へのマッピング
const genderCodeToLabel: Record<string, string> = {
  'male': '男性',
  'female': '女性',
  'other': 'その他'
}

// 性別コードを日本語名に変換する関数
function getGenderLabel(genderCode: string): string {
  return genderCodeToLabel[genderCode] || genderCode
}

// 言語コードを日本語名に変換する関数
function getLanguageLabel(langCode: string): string {
  return languageCodeToLabel[langCode] || langCode
}

// 言語コードの配列を日本語名の配列に変換
function convertLanguageCodesToLabels(langCodes: string[]): string[] {
  return langCodes.map(code => getLanguageLabel(code))
}

export default defineEventHandler(async (event: H3Event) => {
  try {
    const query = getQuery(event)
    const userId = query.user_id as string

    if (!userId) {
      event.res.statusCode = 400
      return { error: 'user_id is required' }
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      event.res.statusCode = 500
      return { error: 'supabase_not_configured' }
    }

    // usersテーブルからusernameを取得
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('username')
      .eq('id', userId)
      .single()

    if (userError) {
      // ユーザーが存在しない場合
      if (userError.code === 'PGRST116') {
        event.res.statusCode = 404
        return { error: 'user_not_found' }
      }
      console.error('[API] Error fetching user:', userError)
      event.res.statusCode = 500
      return { error: 'user_fetch_failed', details: userError }
    }

    // profilesテーブルからプロフィール情報を取得
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('major, gender, native_language, spoken_languages, learning_languages, residence, comment, interests, avatar_url')
      .eq('user_id', userId)
      .single()

    if (profileError) {
      // プロフィールが存在しない場合
      if (profileError.code === 'PGRST116') {
        // プロフィールが存在しない場合は、usernameのみ返す
        return {
          username: userData?.username || null,
          major: null,
          gender: null,
          native_language: null,
          spoken_languages: [],
          learning_languages: [],
          residence: null,
          comment: null,
          interests: []
        }
      }
      console.error('[API] Error fetching profile:', profileError)
      event.res.statusCode = 500
      return { error: 'profile_fetch_failed', details: profileError }
    }

    // フロントはコード値を期待するため、DBのコードをそのまま返す
    const spokenLanguageCodes = Array.isArray(profileData?.spoken_languages)
      ? profileData.spoken_languages.filter((code: any) => code != null && code !== '')
      : []
    const learningLanguageCodes = Array.isArray(profileData?.learning_languages)
      ? profileData.learning_languages.filter((code: any) => code != null && code !== '')
      : []
    const nativeLanguageCode = profileData?.native_language && profileData.native_language !== ''
      ? String(profileData.native_language)
      : null

    const majorCode = profileData?.major && profileData.major !== ''
      ? String(profileData.major)
      : null

    const genderCode = profileData?.gender && profileData.gender !== ''
      ? String(profileData.gender)
      : null

    // データを結合して返す（コード値準拠）
    return {
      username: userData?.username || null,
      major: majorCode,
      gender: genderCode,
      native_language: nativeLanguageCode,
      spoken_languages: spokenLanguageCodes,
      learning_languages: learningLanguageCodes,
      residence: profileData?.residence || null,
      comment: profileData?.comment || null,
      interests: Array.isArray(profileData?.interests) ? profileData.interests : [],
      avatar_url: profileData?.avatar_url || null
    }
  } catch (err: any) {
    console.error('Error in /api/profile GET handler:', err)
    const errorMessage = err?.message || 'Internal server error'
    const errorDetails = err?.stack || err
    
    // エラーの詳細をログに出力
    console.error('Error details:', {
      message: errorMessage,
      details: errorDetails,
      userId: event.node.req.url
    })
    
    event.res.statusCode = 500
    return { 
      error: 'internal_server_error',
      message: errorMessage
    }
  }
})
