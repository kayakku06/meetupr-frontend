export default defineNuxtConfig({
  compatibilityDate: '2025-11-06',
  modules: [
    '@nuxtjs/tailwindcss'
  ],
  css: [
    '~/assets/css/global.css', // ← カンマを追加
    'flag-icons/css/flag-icons.min.css'
  ]
});




