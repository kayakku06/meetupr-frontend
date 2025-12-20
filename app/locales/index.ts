import ja from './ja'
import en from './en'

export const messages = {
  ja,
  en,
}

export type Locale = 'ja' | 'en'
export type Messages = typeof ja

export default messages
