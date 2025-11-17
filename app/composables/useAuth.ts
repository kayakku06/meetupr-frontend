import { useAuth0 } from '@auth0/auth0-vue'
import { ref, computed, watch } from 'vue'

// localStorageに保存されたトークンを確認する関数
const checkLocalStorageToken = (): boolean => {
  if (typeof window === 'undefined') return false
  
  try {
    const config = useRuntimeConfig()
    const scope = 'openid profile email'
    const auth0CacheKey = `@@auth0spajs@@::${config.public.auth0ClientId}::${config.public.auth0Domain}::${scope}`
    const cachedData = localStorage.getItem(auth0CacheKey)
    
    if (!cachedData) return false
    
    const parsed = JSON.parse(cachedData)
    const expiresAt = parsed.expiresAt || 0
    const now = Math.floor(Date.now() / 1000)
    
    // トークンが有効期限内か確認
    if (expiresAt > now && parsed.body?.access_token) {
      return true
    }
    
    // 期限切れの場合は削除
    localStorage.removeItem(auth0CacheKey)
    return false
  } catch (e) {
    console.warn('Failed to check localStorage token:', e)
    return false
  }
}

export const useAuth = () => {
  // クライアントサイドでのみuseAuth0を呼び出す
  let auth0: ReturnType<typeof useAuth0> | null = null
  
  // SSR時のデフォルト値
  const defaultUser = ref(null)
  const defaultIsAuthenticated = ref(false)
  const defaultIsLoading = ref(true)

  // クライアントサイドでAuth0を初期化
  if (import.meta.client) {
    try {
      auth0 = useAuth0()
      // Auth0のisLoadingを監視して、falseになったらdefaultIsLoadingもfalseにする
      if (auth0) {
        watch(() => (auth0!.isLoading as any)?.value, (loading) => {
          if (loading === false) {
            defaultIsLoading.value = false
          }
        }, { immediate: true })
      }
      // フォールバック: 2秒後にisLoadingをfalseにする
      setTimeout(() => {
        if (defaultIsLoading.value) {
          defaultIsLoading.value = false
        }
      }, 2000)
    } catch (error) {
      console.warn('Failed to initialize Auth0:', error)
      // エラーが発生した場合は即座にisLoadingをfalseにする
      defaultIsLoading.value = false
    }
  } else {
    // SSR時はisLoadingをfalseにする
    defaultIsLoading.value = false
  }

  const user = computed(() => {
    if (!auth0) return defaultUser.value
    return auth0.user?.value ?? defaultUser.value
  })
  
  const isAuthenticated = computed(() => {
    if (!auth0) {
      // Auth0が初期化されていない場合、localStorageのトークンを確認
      if (import.meta.client) {
        return checkLocalStorageToken()
      }
      return defaultIsAuthenticated.value
    }
    
    const auth0Authenticated = (auth0.isAuthenticated as any)?.value ?? false
    
    // Auth0のSDKが認証状態を認識していない場合、localStorageのトークンを確認
    if (!auth0Authenticated && import.meta.client) {
      return checkLocalStorageToken()
    }
    
    return auth0Authenticated
  })
  
  const isLoading = computed(() => {
    if (!auth0) {
      return import.meta.client ? defaultIsLoading.value : false
    }
    const loadingValue = (auth0.isLoading as any)?.value
    if (loadingValue !== undefined) {
      // Auth0のisLoadingがfalseになったら、defaultIsLoadingもfalseにする
      if (loadingValue === false) {
        defaultIsLoading.value = false
      }
      return loadingValue
    }
    return defaultIsLoading.value
  })

  const login = async (options?: { 
    appState?: { targetUrl?: string }
    authorizationParams?: {
      login_hint?: string
      screen_hint?: 'login' | 'signup'
      [key: string]: any
    }
  }) => {
    if (!auth0) {
      console.warn('Auth0 is not available. Make sure you are on the client side.')
      return
    }
    await auth0.loginWithRedirect(options)
  }

  const logoutUser = async (options?: { logoutParams?: { returnTo?: string } }) => {
    if (!auth0) {
      console.warn('Auth0 is not available. Make sure you are on the client side.')
      return
    }
    await auth0.logout(options)
  }

  const getAccessToken = async (options?: { audience?: string }) => {
    if (!auth0) {
      return null
    }
    try {
      const config = useRuntimeConfig()
      // audienceが指定されている場合、または設定されている場合に使用
      const audience = options?.audience || config.public.auth0Audience
      
      console.log('Getting access token with audience:', audience)
      
      if (audience) {
        // audienceを指定することで、JWT形式のトークンを取得
        const token = await auth0.getAccessTokenSilently({
          authorizationParams: {
            audience: audience
          }
        })
        
        // トークンの形式を確認（デバッグ用）
        const tokenParts = token.split('.')
        console.log('Token received:', {
          length: token.length,
          parts: tokenParts.length,
          isJWT: tokenParts.length === 3,
          isJWE: tokenParts.length === 5,
          preview: token.substring(0, 50) + '...'
        })
        
        return token
      } else {
        // audienceが設定されていない場合は、デフォルトの方法で取得
        const token = await auth0.getAccessTokenSilently()
        
        // トークンの形式を確認（デバッグ用）
        const tokenParts = token.split('.')
        console.log('Token received (no audience):', {
          length: token.length,
          parts: tokenParts.length,
          isJWT: tokenParts.length === 3,
          isJWE: tokenParts.length === 5,
          preview: token.substring(0, 50) + '...'
        })
        
        return token
      }
    } catch (error) {
      console.error('Error getting access token:', error)
      return null
    }
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout: logoutUser,
    getAccessToken
  }
}

