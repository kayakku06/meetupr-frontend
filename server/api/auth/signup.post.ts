export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)
  
  const { email, password } = body

  if (!email || !password) {
    throw createError({
      statusCode: 400,
      message: 'Email and password are required'
    })
  }

  // Auth0のSign Up APIを使用（Management APIの代わりに）
  // この方法は通常のSPAアプリケーションでも使用可能
  try {
    const response = await $fetch(`https://${config.public.auth0Domain}/dbconnections/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        client_id: config.public.auth0ClientId,
        email: email,
        password: password,
        connection: 'Username-Password-Authentication', // Auth0のデフォルト接続
        user_metadata: {}
      }
    })

    return {
      success: true,
      user: response
    }
  } catch (error) {
    // エラーの詳細を取得
    const errorData = error?.data || error?.response?.data || {}
    const errorMessage = errorData.error_description || errorData.error || errorData.message || 'Failed to create user'
    
    throw createError({
      statusCode: errorData.statusCode || 400,
      message: errorMessage
    })
  }
})

