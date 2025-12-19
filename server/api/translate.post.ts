import { H3Event } from 'h3'

// テキストが日本語か英語かを簡易判定
function detectLanguage(text: string): 'ja' | 'en' {
  // 日本語文字（ひらがな、カタカナ、漢字）が含まれているかチェック
  const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/
  return japaneseRegex.test(text) ? 'ja' : 'en'
}

export default defineEventHandler(async (event: H3Event) => {
  try {
    const body = await readBody(event)
    
    if (!body || !body.text) {
      event.res.statusCode = 400
      return { error: 'text is required' }
    }

    const { text } = body
    
    // 言語を自動検出
    const detectedLang = detectLanguage(text)
    
    // 日本語なら英語に、英語なら日本語に翻訳
    const sourceLang = detectedLang
    const targetLang = detectedLang === 'ja' ? 'en' : 'ja'
    
    // MyMemory Translation APIを使用（無料、制限あり）
    const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`
    
    console.log('[Translate API] Request:', { text: text.substring(0, 50), sourceLang, targetLang, apiUrl })
    
    const response = await fetch(apiUrl)
    
    if (!response.ok) {
      console.error('[Translate API] HTTP Error:', response.status, response.statusText)
      throw new Error(`Translation API error: ${response.statusText}`)
    }
    
    const data = await response.json()
    
    console.log('[Translate API] Response:', { 
      responseStatus: data.responseStatus, 
      hasTranslatedText: !!data.responseData?.translatedText,
      translatedText: data.responseData?.translatedText?.substring(0, 50)
    })
    
    if (data.responseStatus === 200 && data.responseData && data.responseData.translatedText) {
      return {
        translatedText: data.responseData.translatedText,
        sourceLang: sourceLang,
        targetLang: targetLang
      }
    } else {
      console.error('[Translate API] Invalid response:', data)
      throw new Error(`Translation failed: ${data.responseStatus || 'Unknown error'}`)
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
