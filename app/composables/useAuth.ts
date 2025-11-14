import { useAuth0 } from '@auth0/auth0-vue'
import { ref, computed } from 'vue'

export const useAuth = () => {
  // クライアントサイドでのみuseAuth0を呼び出す
  const auth0Ref = ref<ReturnType<typeof useAuth0> | null>(null)
  
  // SSR時のデフォルト値
  const defaultUser = ref(null)
  const defaultIsAuthenticated = ref(false)
  const defaultIsLoading = ref(true)

  // クライアントサイドでAuth0を初期化
  if (import.meta.client) {
    try {
      auth0Ref.value = useAuth0()
    } catch (error) {
      console.warn('Failed to initialize Auth0:', error)
    }
  }

  const user = computed(() => {
    if (!auth0Ref.value) return defaultUser.value
    return auth0Ref.value.user?.value ?? defaultUser.value
  })
  
  const isAuthenticated = computed(() => {
    if (!auth0Ref.value) return defaultIsAuthenticated.value
    const auth0 = auth0Ref.value
    // isAuthenticatedとisLoadingは既にrefなので、.valueでアクセス
    return (auth0.isAuthenticated as any)?.value ?? defaultIsAuthenticated.value
  })
  
  const isLoading = computed(() => {
    if (!auth0Ref.value) return defaultIsLoading.value
    const auth0 = auth0Ref.value
    // isLoadingは既にrefなので、.valueでアクセス
    return (auth0.isLoading as any)?.value ?? defaultIsLoading.value
  })

  const login = async (options?: { appState?: { targetUrl?: string } }) => {
    if (!auth0Ref.value) {
      console.warn('Auth0 is not available. Make sure you are on the client side.')
      return
    }
    await auth0Ref.value.loginWithRedirect(options)
  }

  const logoutUser = async (options?: { logoutParams?: { returnTo?: string } }) => {
    if (!auth0Ref.value) {
      console.warn('Auth0 is not available. Make sure you are on the client side.')
      return
    }
    await auth0Ref.value.logout(options)
  }

  const getAccessToken = async () => {
    if (!auth0Ref.value) {
      return null
    }
    try {
      return await auth0Ref.value.getAccessTokenSilently()
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

