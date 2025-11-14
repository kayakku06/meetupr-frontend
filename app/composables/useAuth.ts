import { useAuth0 } from '@auth0/auth0-vue'
import { ref, computed, watch } from 'vue'

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
    if (!auth0) return defaultIsAuthenticated.value
    return (auth0.isAuthenticated as any)?.value ?? defaultIsAuthenticated.value
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

  const login = async (options?: { appState?: { targetUrl?: string } }) => {
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

  const getAccessToken = async () => {
    if (!auth0) {
      return null
    }
    try {
      return await auth0.getAccessTokenSilently()
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

