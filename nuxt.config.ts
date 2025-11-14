export default defineNuxtConfig({
  compatibilityDate: '2025-11-06',
  modules: [
    '@nuxtjs/tailwindcss'
  ],
  css: [
    '~/assets/css/global.css', // ← カンマを追加
    'flag-icons/css/flag-icons.min.css'
  ],
  runtimeConfig: {
    auth0ClientSecret: process.env.AUTH0_CLIENT_SECRET || '',
    public: {
      auth0Domain: process.env.AUTH0_DOMAIN || '',
      auth0ClientId: process.env.AUTH0_CLIENT_ID || '',
      auth0Audience: process.env.AUTH0_AUDIENCE || '',
      auth0Connection: process.env.AUTH0_CONNECTION || 'Username-Password-Authentication'
    }
  }
});




