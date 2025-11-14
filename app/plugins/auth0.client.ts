import { createAuth0 } from '@auth0/auth0-vue'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  
  const authorizationParams: {
    redirect_uri: string
    audience?: string
  } = {
    redirect_uri: typeof window !== 'undefined' ? window.location.origin : ''
  }

  // AUTH0_AUDIENCEが設定されている場合のみ追加
  if (config.public.auth0Audience) {
    authorizationParams.audience = config.public.auth0Audience
  }
  
  const auth0 = createAuth0({
    domain: config.public.auth0Domain,
    clientId: config.public.auth0ClientId,
    authorizationParams
  })

  nuxtApp.vueApp.use(auth0)
  
  return {
    provide: {
      auth0
    }
  }
})

