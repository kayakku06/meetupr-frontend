import { ref, computed } from 'vue'
import { messages, type Locale, type Messages } from '~/locales'

// グローバルな言語状態
const currentLocale = ref<Locale>('ja')

// localStorageから言語設定を復元
if (typeof window !== 'undefined') {
  const saved = localStorage.getItem('locale') as Locale | null
  if (saved && (saved === 'ja' || saved === 'en')) {
    currentLocale.value = saved
  }
}

export function useLocale() {
  // 現在の言語の翻訳メッセージを取得
  const t = computed<Messages>(() => messages[currentLocale.value])

  // 言語を切り替え
  const setLocale = (locale: Locale) => {
    currentLocale.value = locale
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', locale)
    }
  }

  // 言語をトグル
  const toggleLocale = () => {
    setLocale(currentLocale.value === 'ja' ? 'en' : 'ja')
  }

  // 現在の言語
  const locale = computed(() => currentLocale.value)

  // 日本語かどうか
  const isJapanese = computed(() => currentLocale.value === 'ja')

  // 英語かどうか
  const isEnglish = computed(() => currentLocale.value === 'en')

  return {
    t,
    locale,
    setLocale,
    toggleLocale,
    isJapanese,
    isEnglish,
  }
}
