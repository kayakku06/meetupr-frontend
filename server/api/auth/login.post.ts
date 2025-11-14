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

  // Auth0のOAuth2 Resource Owner Password Grantを使用
  try {
    const response = await $fetch(`https://${config.public.auth0Domain}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        client_id: config.public.auth0ClientId,
        client_secret: config.auth0ClientSecret,
        audience: config.public.auth0Audience || `https://${config.public.auth0Domain}/api/v2/`,
        grant_type: 'password',
        username: email,
        password: password,
        connection: config.public.auth0Connection, // Auth0の接続名（環境変数で設定可能）
        scope: 'openid profile email'
      }
    })

    return {
      success: true,
      accessToken: response.access_token,
      idToken: response.id_token,
      expiresIn: response.expires_in
    }
  } catch (error) {
    // エラーの詳細を取得
    const errorData = error?.data || error?.response?.data || {}
    let errorMessage = errorData.error_description || errorData.error || errorData.message || 'Invalid email or password'
    
    // デバッグ用: 実際のエラーレスポンスをログに出力
    console.error('Auth0 Login Error:', {
      error,
      errorData,
      connection: config.public.auth0Connection,
      domain: config.public.auth0Domain
    })
    
    // ROPCが許可されていない場合のエラーメッセージを改善
    if (errorMessage.includes('Grant type') && errorMessage.includes('not allowed')) {
      errorMessage = 'Resource Owner Password Grantが有効になっていません。Auth0 Dashboardで設定を確認してください。'
    }
    
    // 接続関連のエラーメッセージを改善
    if (errorMessage.includes('default connection') || errorMessage.includes('connection') || errorMessage.includes('Connection')) {
      errorMessage = `接続エラー: ${errorMessage}。使用中の接続名: "${config.public.auth0Connection}"。Auth0 Dashboardで接続が存在し、アプリケーションに有効化されているか確認してください。`
    }
    
    throw createError({
      statusCode: 401,
      message: errorMessage
    })
  }
})

