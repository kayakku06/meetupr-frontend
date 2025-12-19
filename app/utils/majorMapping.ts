/**
 * 学部コードと日本語名のマッピング
 * データベースには英語の学部コードを保存
 */

// 学部コードから日本語名へのマッピング
const majorCodeToLabel: Record<string, string> = {
  'business': '経営学部',
  'economics': '経営学部', // 旧コード（後方互換性のため）
  'production_science': '政策科学部',
  'information_science': '情報理工学部',
  'engineering': '情報理工学部', // 旧コード（後方互換性のため）
  'film_studies': '映像学部',
  'psychology': '総合心理学部',
  'global_liberal_arts': 'グローバル教養学部'
}

// 学部コードから日本語名を取得
export function getMajorLabel(majorCode: string | null | undefined): string {
  if (!majorCode) return ''
  
  // 既に日本語名の場合はそのまま返す
  const values = Object.values(majorCodeToLabel)
  if (values.includes(majorCode)) {
    return majorCode
  }
  
  // 学部コードから日本語名に変換
  return majorCodeToLabel[majorCode] || majorCode
}
