import { H3Event } from 'h3'

// 言語コードからMyMemory Translation API用の言語コードに変換
const languageCodeToMyMemory: Record<string, string> = {
  'ja': 'ja',
  'zh': 'zh',
  'ko': 'ko',
  'vi': 'vi',
  'id': 'id',
  'th': 'th',
  'hi': 'hi',
  'bn': 'bn',
  'pa': 'pa',
  'en': 'en',
  'fr': 'fr',
  'de': 'de',
  'es': 'es',
  'pt': 'pt',
  'ru': 'ru',
  'ar': 'ar',
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

// 言語名またはコードをMyMemory用のコードに変換
function normalizeLanguageCode(lang: string): string {
  const normalized = languageCodeToMyMemory[lang] || lang.toLowerCase().slice(0, 2)
  return normalized
}

export default defineEventHandler(async (event: H3Event) => {
  try {
    const body = await readBody(event)
    
    if (!body || !body.text || !body.targetLang) {
      event.res.statusCode = 400
      return { error: 'text and targetLang are required' }
    }

    const { text, sourceLang, targetLang } = body
    
    // 言語コードを正規化
    const sourceCode = sourceLang ? normalizeLanguageCode(sourceLang) : 'auto'
    const targetCode = normalizeLanguageCode(targetLang)
    
    // MyMemory Translation APIを使用（無料、制限あり）
    // より高品質な翻訳が必要な場合は、Google Translate APIやDeepL APIに変更可能
    const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceCode}|${targetCode}`
    
    const response = await fetch(apiUrl)
    
    if (!response.ok) {
      throw new Error(`Translation API error: ${response.statusText}`)
    }
    
    const data = await response.json()
    
    if (data.responseStatus === 200 && data.responseData && data.responseData.translatedText) {
      return {
        translatedText: data.responseData.translatedText,
        sourceLang: data.responseData.detectedSourceLanguage || sourceCode,
        targetLang: targetCode
      }
    } else {
      throw new Error('Translation failed')
    }
  } catch (error: any) {
    console.error('[Translate API] Error:', error)
    event.res.statusCode = 500
    return { 
      error: 'Translation failed',
      message: error.message || 'Unknown error'
    }
  }
})
