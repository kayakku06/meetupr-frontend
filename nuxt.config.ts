export default defineNuxtConfig({
  compatibilityDate: '2025-11-06',
  modules: [
    '@nuxtjs/tailwindcss'
  ],
  css: [
    '~/assets/css/global.css' // プロジェクトの assets/global.css を参照
  ]
});
