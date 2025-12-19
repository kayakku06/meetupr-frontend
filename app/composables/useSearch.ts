import { ref, Ref } from 'vue'
import { useAuth } from './useAuth'

export interface SearchUserResult {
  user_id: string
  username: string
  comment: string
  residence: string
  avatar_url: string | null
  interests: InterestItem[]
  native_language?: string
  spoken_languages?: string[]
  learning_languages?: string[]
}

export interface InterestItem {
  id: number
  name: string
}

export interface SearchParams {
  keyword?: string
  languages?: string[]
  countries?: string[]
}

export function useSearch() {
  const { getAccessToken } = useAuth()
  const config = useRuntimeConfig()
  const results = ref<SearchUserResult[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const searchUsers = async (params: SearchParams) => {
    isLoading.value = true
    error.value = null

    try {
      // JWTトークンを取得
      const token = await getAccessToken()
      if (!token) {
        throw new Error('認証トークンを取得できませんでした')
      }

      // GETリクエストで検索
      const queryParams = new URLSearchParams()
      if (params.keyword) {
        queryParams.append('keyword', params.keyword)
      }
      if (params.languages && params.languages.length > 0) {
        queryParams.append('language', params.languages.join(','))
      }
      if (params.countries && params.countries.length > 0) {
        queryParams.append('country', params.countries.join(','))
      }

      const response = await $fetch<SearchUserResult[]>(
        `${config.public.apiBaseUrl}/api/v1/search/users?${queryParams.toString()}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      results.value = response || []
    } catch (err: any) {
      error.value = err?.message || '検索に失敗しました'
      console.error('Search error:', err)
      results.value = []
    } finally {
      isLoading.value = false
    }
  }

  const searchUsersPost = async (params: SearchParams) => {
    isLoading.value = true
    error.value = null

    try {
      // JWTトークンを取得
      const token = await getAccessToken()
      if (!token) {
        throw new Error('認証トークンを取得できませんでした')
      }

      // POSTリクエストで検索
      const response = await $fetch<SearchUserResult[]>(
        `${config.public.apiBaseUrl}/api/v1/search/users`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: {
            keyword: params.keyword || '',
            languages: params.languages || [],
            countries: params.countries || []
          }
        }
      )

      results.value = response || []
    } catch (err: any) {
      error.value = err?.message || '検索に失敗しました'
      console.error('Search error:', err)
      results.value = []
    } finally {
      isLoading.value = false
    }
  }

  const clearResults = () => {
    results.value = []
    error.value = null
  }

  return {
    results,
    isLoading,
    error,
    searchUsers,
    searchUsersPost,
    clearResults
  }
}
