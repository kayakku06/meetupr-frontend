export default defineNuxtRouteMiddleware((to, from) => {
  const { isAuthenticated, isLoading } = useAuth()

  // ローディング中は待機
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

