import { useAuth0 } from '@auth0/auth0-vue'
import { ref, computed } from 'vue'

export const useAuth = () => {
  // クライアントサイドでのみuseAuth0を呼び出す
  let auth0: ReturnType<typeof useAuth0> | null = null
  
  if (import.meta.client) {
    try {
      auth0 = useAuth0()
    } catch (error) {
      console.warn('Failed to initialize Auth0:', error)
    }
  }

  // SSR時のデフォルト値
  const defaultUser = ref(null)
  const defaultIsAuthenticated = ref(false)
  const defaultIsLoading = ref(true)

  const user = computed(() => auth0?.user?.value ?? defaultUser.value)
  const isAuthenticated = computed(() => auth0?.isAuthenticated?.value ?? defaultIsAuthenticated.value)
  const isLoading = computed(() => auth0?.isLoading?.value ?? defaultIsLoading.value)

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

