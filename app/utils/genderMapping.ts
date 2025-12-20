/**
 * 性別コードと日本語ラベルのマッピング
 */

const genderCodeToLabel: Record<string, string> = {
  male: '男性',
  female: '女性',
  other: 'その他'
}

const genderCodeToEnglish: Record<string, string> = {
  male: 'Male',
  female: 'Female',
  other: 'Other'
}

export function getGenderLabel(gender: string | null | undefined): string {
  if (!gender) return ''

  const raw = String(gender).trim()
  if (!raw) return ''

  // 既に日本語ラベルの場合はそのまま返す
  const values = Object.values(genderCodeToLabel)
  if (values.includes(raw)) return raw

  // "male:男性" / "male（男性）" / "男性(male)" などを想定してコードを抽出
  const lower = raw.toLowerCase()
  const match = lower.match(/\b(male|female|other)\b/)
  const code = match?.[1]
  if (code && genderCodeToLabel[code]) return genderCodeToLabel[code]

  return raw
}

export function getGenderLabelEnglish(gender: string | null | undefined): string {
  if (!gender) return ''

  const raw = String(gender).trim()
  if (!raw) return ''

  // 既に英語ラベルの場合はそのまま返す
  const values = Object.values(genderCodeToEnglish)
  if (values.includes(raw)) return raw

  // コードを抽出
  const lower = raw.toLowerCase()
  const match = lower.match(/\b(male|female|other)\b/)
  const code = match?.[1]
  if (code && genderCodeToEnglish[code]) return genderCodeToEnglish[code]

  return raw
}

// ロケールに応じて性別ラベルを取得
export function getGenderLabelByLocale(gender: string | null | undefined, locale: 'ja' | 'en'): string {
  if (locale === 'en') {
    return getGenderLabelEnglish(gender)
  }
  return getGenderLabel(gender)
}
