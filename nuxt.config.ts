export default defineNuxtConfig({
  compatibilityDate: '2025-11-06',
  modules: [
    '@nuxtjs/tailwindcss'
  ],
  css: [
    '~/assets/css/global.css' // プロジェクトの assets/global.css を参照
  ],
  runtimeConfig: {
    public: {
      auth0Domain: process.env.AUTH0_DOMAIN || '',
      auth0ClientId: process.env.AUTH0_CLIENT_ID || '',
      auth0Audience: process.env.AUTH0_AUDIENCE || ''
    }
  }
});
