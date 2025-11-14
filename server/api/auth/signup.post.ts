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
        connection: config.public.auth0Connection, // Auth0の接続名（環境変数で設定可能）
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
    let errorMessage = errorData.error_description || errorData.error || errorData.message || 'Failed to create user'
    
    // デバッグ用: 実際のエラーレスポンスをログに出力
    console.error('Auth0 Signup Error:', {
      error,
      errorData,
      connection: config.public.auth0Connection,
      domain: config.public.auth0Domain
    })
    
    // 接続関連のエラーメッセージを改善
    if (errorMessage.includes('default connection') || errorMessage.includes('connection') || errorMessage.includes('Connection')) {
      errorMessage = `接続エラー: ${errorMessage}。使用中の接続名: "${config.public.auth0Connection}"。Auth0 Dashboardで接続が存在し、アプリケーションに有効化されているか確認してください。`
    }
    
    throw createError({
      statusCode: errorData.statusCode || 400,
      message: errorMessage
    })
  }
})

