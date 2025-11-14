export default defineNuxtRouteMiddleware((to, from) => {
  // クライアントサイドでのみ実行
  if (import.meta.server) {
    return
  }

  const { isAuthenticated, isLoading } = useAuth()

  // ローディング中は待機（Auth0の初期化を待つ）
  if (isLoading.value) {
    return
  }

  // 認証されていない場合はログインページにリダイレクト
  if (!isAuthenticated.value) {
    return navigateTo({
      path: '/',
      query: {
        redirect: to.fullPath
      }
    })
  }
})

