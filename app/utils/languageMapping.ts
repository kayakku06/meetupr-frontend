/**
 * 言語コードと日本語名のマッピング
 * DBには code を保存する想定だが、"code:label" のような文字列にも耐える。
 */

const languageCodeToLabel: Record<string, string> = {
  ja: '日本語',
  zh: '中国語',
  ko: '韓国語',
  vi: 'ベトナム語',
  id: 'インドネシア語',
  th: 'タイ語',
  hi: 'ヒンディー語',
  bn: 'ベンガル語',
  pa: 'パンジャブ語',
  en: '英語',
  fr: 'フランス語',
  de: 'ドイツ語',
  es: 'スペイン語',
  pt: 'ポルトガル語',
  ru: 'ロシア語',
  ar: 'アラビア語'
}

export function getLanguageLabel(lang: string | null | undefined): string {
  if (!lang) return ''

  const raw = String(lang).trim()
  if (!raw) return ''

  // 既に日本語名の場合はそのまま返す
  const values = Object.values(languageCodeToLabel)
  if (values.includes(raw)) return raw

  // まずは raw 自体が code の場合
  const direct = raw.toLowerCase()
  if (languageCodeToLabel[direct]) return languageCodeToLabel[direct]

  // "ja:日本語" / "ja-日本語" などの区切り文字がある場合
  const head = raw.split(/\s*[:：\-–—|\/／]\s*/)[0]?.trim().toLowerCase()
  if (head && languageCodeToLabel[head]) return languageCodeToLabel[head]

  // "日本語(ja)" / "日本語（ja）" などから2文字コードを抽出
  const match = raw.toLowerCase().match(/\b([a-z]{2})\b/)
  const code = match?.[1]
  if (code && languageCodeToLabel[code]) return languageCodeToLabel[code]

  return raw
}

export function getLanguageLabels(langs: Array<string | null | undefined>): string[] {
  return (Array.isArray(langs) ? langs : [])
    .map(getLanguageLabel)
    .filter((v) => v != null && v !== '')
}

// 日本語の言語名から言語コードに変換（逆マッピング）
const labelToLanguageCode: Record<string, string> = {
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

// 言語名を言語コードに正規化（日本語名から言語コードに変換）
export function normalizeLanguageCode(language: string | null | undefined): string | null {
  if (!language) return null
  
  // まず日本語の言語名から言語コードに変換を試す
  const languageCode = labelToLanguageCode[language]
  if (languageCode) {
    return languageCode
  }
  
  // 既に言語コード（小文字2文字の英字）の場合はそのまま返す
  if (language.length === 2 && /^[a-z]{2}$/.test(language)) {
    return language.toLowerCase()
  }
  
  // マッピングが見つからない場合は警告を出力してnullを返す
  console.warn('[languageMapping] Cannot normalize language:', language)
  return null
}
