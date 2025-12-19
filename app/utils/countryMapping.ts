/**
 * 国コードと国旗コードのマッピング
 * データベースにはISO 3166-1 alpha-2の国コード（英語）を保存
 */

// 国コード（ISO 3166-1 alpha-2）から国旗コードへのマッピング
export const countryCodeToFlagCode: Record<string, string> = {
  // 東アジア
  'CN': 'cn', // 中国
  'KR': 'kr', // 韓国
  'TW': 'tw', // 台湾
  'MN': 'mn', // モンゴル
  'JP': 'jp', // 日本
  
  // 東南アジア
  'ID': 'id', // インドネシア
  'VN': 'vn', // ベトナム
  'MY': 'my', // マレーシア
  'MM': 'mm', // ミャンマー
  'KH': 'kh', // カンボジア
  'SG': 'sg', // シンガポール
  'LA': 'la', // ラオス
  'TH': 'th', // タイ
  'PH': 'ph', // フィリピン
  'BN': 'bn', // ブルネイ
  
  // 南アジア
  'IN': 'in', // インド
  'BD': 'bd', // バングラディシュ
  'PK': 'pk', // パキスタン
  'NP': 'np', // ネパール
  'LK': 'lk', // スリランカ
  'MV': 'mv', // モルディブ
  
  // 中央アジア
  'KG': 'kg', // キルギス
  'UZ': 'uz', // ウズベキスタン
  'TJ': 'tj', // タジキスタン
  'KZ': 'kz', // カザフスタン
  'AF': 'af', // アフガニスタン
  
  // 西アジア・中東
  'TR': 'tr', // トルコ
  'IL': 'il', // イスラエル
  'OM': 'om', // オマーン
  
  // 東アジア(香港)
  'HK': 'hk', // 香港
  
  // オセアニア
  'AU': 'au', // オーストラリア
  'NZ': 'nz', // ニュージーランド
  
  // 北米
  'US': 'us', // アメリカ
  'CA': 'ca', // カナダ
  
  // 中米・南米
  'MX': 'mx', // メキシコ
  'GT': 'gt', // グアテマラ
  'PE': 'pe', // ペルー
  'BR': 'br', // ブラジル
  'CL': 'cl', // チリ
  'CO': 'co', // コロンビア
  'AR': 'ar', // アルゼンチン
  
  // ヨーロッパ
  'GB': 'gb', // イギリス
  'FR': 'fr', // フランス
  'DE': 'de', // ドイツ
  'IT': 'it', // イタリア
  'ES': 'es', // スペイン
  'CH': 'ch', // スイス
  'UA': 'ua', // ウクライナ
  'RU': 'ru', // ロシア
  'LT': 'lt', // リトアニア
  'SE': 'se', // スウェーデン
  'NO': 'no', // ノルウェー
  'HU': 'hu', // ハンガリー
  'AT': 'at', // オーストリア
  'NL': 'nl', // オランダ
  'BE': 'be', // ベルギー
  'PL': 'pl', // ポーランド
  'DK': 'dk', // デンマーク
  'FI': 'fi', // フィンランド
  
  // アフリカ
  'EG': 'eg', // エジプト
  'GH': 'gh', // ガーナ
  'NG': 'ng', // ナイジェリア
  'ET': 'et', // エチオピア
  'BF': 'bf', // ブルキナファソ
  'UG': 'ug', // ウガンダ
  'NA': 'na', // ナミビア
  'MA': 'ma', // モロッコ
  'GA': 'ga', // ガボン
  'ZA': 'za', // 南アフリカ
}

// 国コードから国旗コードを取得
export function getFlagCodeFromCountryCode(countryCode: string | null | undefined): string {
  if (!countryCode) return ''
  
  // 既に国旗コードの形式（小文字2文字）の場合はそのまま返す
  if (countryCode.length === 2 && countryCode.toLowerCase() === countryCode) {
    return countryCode.toLowerCase()
  }
  
  // 国コード（大文字2文字）から国旗コードに変換
  const upperCode = countryCode.toUpperCase()
  return countryCodeToFlagCode[upperCode] || ''
}

// 日本語の国名から国コードに変換（後方互換性のため）
const japaneseToCountryCode: Record<string, string> = {
  '日本': 'JP',
  'アメリカ': 'US',
  'アメリカ合衆国': 'US',
  '韓国': 'KR',
  '大韓民国': 'KR',
  '中国': 'CN',
  '中華人民共和国': 'CN',
  'イギリス': 'GB',
  '英国': 'GB',
  'フランス': 'FR',
  'フランス共和国': 'FR',
  'スペイン': 'ES',
  'ドイツ': 'DE',
  'イタリア': 'IT',
  'カナダ': 'CA',
  'オーストラリア': 'AU',
  'ブラジル': 'BR',
  'メキシコ': 'MX',
  'インド': 'IN',
  'タイ': 'TH',
  'ベトナム': 'VN',
  'インドネシア': 'ID',
  'フィリピン': 'PH',
  'シンガポール': 'SG',
  'マレーシア': 'MY',
  '台湾': 'TW',
  '香港': 'HK',
  'オランダ': 'NL',
  'ベルギー': 'BE',
  'スイス': 'CH',
  'オーストリア': 'AT',
  'スウェーデン': 'SE',
  'ノルウェー': 'NO',
  'デンマーク': 'DK',
  'フィンランド': 'FI',
  'ポーランド': 'PL',
  'ロシア': 'RU',
  'トルコ': 'TR',
  'エジプト': 'EG',
  '南アフリカ': 'ZA',
  'アルゼンチン': 'AR',
  'チリ': 'CL',
  'コロンビア': 'CO',
  'ペルー': 'PE',
  'ニュージーランド': 'NZ',
}

// 日本語の国名または国コードから国旗コードを取得（後方互換性のため）
export function getFlagCode(country: string | null | undefined): string {
  if (!country) return ''
  
  // 既に国旗コードの形式（小文字2文字）の場合はそのまま返す
  if (country.length === 2 && country.toLowerCase() === country) {
    return country.toLowerCase()
  }
  
  // 国コード（大文字2文字）の場合は国旗コードに変換
  if (country.length === 2 && country.toUpperCase() === country) {
    return getFlagCodeFromCountryCode(country)
  }
  
  // 日本語の国名から国コードに変換してから国旗コードを取得
  const countryCode = japaneseToCountryCode[country]
  if (countryCode) {
    return getFlagCodeFromCountryCode(countryCode)
  }
  
  // マッピングが見つからない場合は警告を出力
  console.warn('[countryMapping] Unknown country:', country)
  return ''
}

// 国コードを正規化（英語の国コードに変換）
export function normalizeCountryCode(country: string | null | undefined): string | null {
  if (!country) return null
  
  // まず日本語の国名から国コードに変換を試す（2文字の日本語国名もあるため、先にチェック）
  const countryCode = japaneseToCountryCode[country]
  if (countryCode) {
    return countryCode
  }
  
  // 既に国コード（大文字2文字の英字）の場合はそのまま返す
  // 英字のみの2文字の場合は国コードとみなす
  if (country.length === 2 && /^[A-Z]{2}$/.test(country)) {
    return country.toUpperCase()
  }
  
  // マッピングが見つからない場合は警告を出力してnullを返す
  console.warn('[countryMapping] Cannot normalize country:', country)
  return null
}

// 国コードから日本語の国名を取得（逆マッピング）
const countryCodeToJapanese: Record<string, string> = {
  'JP': '日本',
  'US': 'アメリカ',
  'KR': '韓国',
  'CN': '中国',
  'GB': 'イギリス',
  'FR': 'フランス',
  'ES': 'スペイン',
  'DE': 'ドイツ',
  'IT': 'イタリア',
  'CA': 'カナダ',
  'AU': 'オーストラリア',
  'BR': 'ブラジル',
  'MX': 'メキシコ',
  'IN': 'インド',
  'TH': 'タイ',
  'VN': 'ベトナム',
  'ID': 'インドネシア',
  'PH': 'フィリピン',
  'SG': 'シンガポール',
  'MY': 'マレーシア',
  'TW': '台湾',
  'HK': '香港',
  'NL': 'オランダ',
  'BE': 'ベルギー',
  'CH': 'スイス',
  'AT': 'オーストリア',
  'SE': 'スウェーデン',
  'NO': 'ノルウェー',
  'DK': 'デンマーク',
  'FI': 'フィンランド',
  'PL': 'ポーランド',
  'RU': 'ロシア',
  'TR': 'トルコ',
  'EG': 'エジプト',
  'ZA': '南アフリカ',
  'AR': 'アルゼンチン',
  'CL': 'チリ',
  'CO': 'コロンビア',
  'PE': 'ペルー',
  'NZ': 'ニュージーランド',
  'MM': 'ミャンマー',
  'KH': 'カンボジア',
  'LA': 'ラオス',
  'BN': 'ブルネイ',
  'BD': 'バングラディシュ',
  'PK': 'パキスタン',
  'NP': 'ネパール',
  'LK': 'スリランカ',
  'MV': 'モルディブ',
  'KG': 'キルギス',
  'UZ': 'ウズベキスタン',
  'TJ': 'タジキスタン',
  'KZ': 'カザフスタン',
  'AF': 'アフガニスタン',
  'IL': 'イスラエル',
  'OM': 'オマーン',
  'GH': 'ガーナ',
  'NG': 'ナイジェリア',
  'ET': 'エチオピア',
  'BF': 'ブルキナファソ',
  'UG': 'ウガンダ',
  'NA': 'ナミビア',
  'MA': 'モロッコ',
  'GA': 'ガボン',
  'GT': 'グアテマラ',
  'UA': 'ウクライナ',
  'LT': 'リトアニア',
  'HU': 'ハンガリー',
}

// 国コードから日本語の国名を取得
export function getJapaneseCountryName(countryCode: string | null | undefined): string {
  if (!countryCode) return ''
  
  // 国コードを大文字に正規化
  const upperCode = countryCode.toUpperCase()
  
  // マッピングから日本語の国名を取得
  const japaneseName = countryCodeToJapanese[upperCode]
  if (japaneseName) {
    return japaneseName
  }
  
  // マッピングが見つからない場合は警告を出力して国コードをそのまま返す
  console.warn('[countryMapping] Unknown country code:', countryCode)
  return countryCode
}
