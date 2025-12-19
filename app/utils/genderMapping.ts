/**
 * 性別コードと日本語ラベルのマッピング
 */

const genderCodeToLabel: Record<string, string> = {
  male: '男性',
  female: '女性',
  other: 'その他'
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
