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
