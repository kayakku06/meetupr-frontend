export default defineNuxtConfig({
  compatibilityDate: '2025-11-06',
  modules: [
    '@nuxtjs/tailwindcss',
    '@vite-pwa/nuxt'
  ],
  css: [
    '~/assets/css/global.css', // ← カンマを追加
    'flag-icons/css/flag-icons.min.css'
  ],
  app: {
    head: {
      meta: [
        { name: 'theme-color', content: '#0ea5e9' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' }
      ],
      link: [
        { rel: 'apple-touch-icon', href: '/icons/apple-touch-icon.png' },
        { rel: 'apple-touch-icon', sizes: '167x167', href: '/icons/apple-touch-icon-167.png' },
        { rel: 'apple-touch-icon', sizes: '152x152', href: '/icons/apple-touch-icon-152.png' },
        { rel: 'apple-touch-icon', sizes: '120x120', href: '/icons/apple-touch-icon-120.png' }
      ]
    }
  },
  // @ts-ignore: @vite-pwa/nuxt module option not declared in Nuxt types
  pwa: {
    registerType: 'autoUpdate',
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,svg,png,ico,json,webp,avif}'],
      runtimeCaching: [
        {
          urlPattern: ({ url }: { url: URL }) => url.pathname.startsWith('/api/') || url.pathname.startsWith('/server/'),
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            networkTimeoutSeconds: 5,
            cacheableResponse: { statuses: [0, 200] }
          }
        }
      ]
    },
    manifest: {
      name: 'MeetUpr',
      short_name: 'MeetUpr',
      description: 'MeetUpr web application',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      theme_color: '#0ea5e9',
      background_color: '#ffffff',
      icons: [
        {
          src: '/icons/pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/icons/pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/icons/pwa-maskable-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable'
        }
      ]
    }
  },
  runtimeConfig: {
    auth0ClientSecret: process.env.AUTH0_CLIENT_SECRET || '',
    public: {
      auth0Domain: process.env.AUTH0_DOMAIN || '',
      auth0ClientId: process.env.AUTH0_CLIENT_ID || '',
      auth0Audience: process.env.AUTH0_AUDIENCE || '',
      auth0Connection: process.env.AUTH0_CONNECTION || 'Username-Password-Authentication',
      wsHost: process.env.NUXT_PUBLIC_WS_HOST || 'localhost:8080',
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'
    }
  }
});




