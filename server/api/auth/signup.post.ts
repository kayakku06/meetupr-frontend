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

  // まず、Auth0 Management APIのアクセストークンを取得
  let managementToken
  try {
    const tokenResponse = await $fetch(`https://${config.public.auth0Domain}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        client_id: config.public.auth0ClientId,
        client_secret: config.auth0ClientSecret,
        audience: `https://${config.public.auth0Domain}/api/v2/`,
        grant_type: 'client_credentials'
      }
    })
    managementToken = tokenResponse.access_token
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: 'Failed to get management token'
    })
  }

  // Auth0 Management APIを使用してユーザーを作成
  try {
    const userResponse = await $fetch(`https://${config.public.auth0Domain}/api/v2/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${managementToken}`,
        'Content-Type': 'application/json'
      },
      body: {
        email: email,
        password: password,
        connection: 'Username-Password-Authentication', // Auth0のデフォルト接続
        email_verified: false
      }
    })

    return {
      success: true,
      user: userResponse
    }
  } catch (error: any) {
    throw createError({
      statusCode: 400,
      message: error.data?.message || 'Failed to create user'
    })
  }
})

