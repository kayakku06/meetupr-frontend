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
    let errorMessage = errorData.error_description || errorData.error || 'Invalid email or password'
    
    // ROPCが許可されていない場合のエラーメッセージを改善
    if (errorMessage.includes('Grant type') && errorMessage.includes('not allowed')) {
      errorMessage = 'Resource Owner Password Grantが有効になっていません。Auth0 Dashboardで設定を確認してください。'
    }
    
    throw createError({
      statusCode: 401,
      message: errorMessage
    })
  }
})

