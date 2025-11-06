export default defineNuxtConfig({
  compatibilityDate: '2025-11-06', 
  modules: [
    '@nuxtjs/tailwindcss' // ← これがNuxtでの正しいTailwind導入方法です
  ],
  css: ['./app/assets/css/tailwind.css','~/assets/css/global.css'],
  

});