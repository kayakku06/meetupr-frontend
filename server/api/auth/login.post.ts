import { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
  try {
    const body = await readBody(event)
    const config = useRuntimeConfig()

    console.log('[API] /api/auth/login POST received body:', JSON.stringify({ ...body, password: '***' }))

    // ボディの存在確認
    if (body == null) {
      console.warn('[API] /api/auth/login POST empty body received (null/undefined)')
      event.res.statusCode = 400
      return { error: 'empty_body', message: 'Request body is required' }
    }

    // バリデーション
    if (!body.email || !body.password) {
      console.warn('[API] /api/auth/login POST missing email or password')
      event.res.statusCode = 400
      return { error: 'email and password are required', message: 'Email and password are required' }
    }

    // Auth0の設定を取得
    const auth0Domain = config.public.auth0Domain
    const auth0ClientId = config.public.auth0ClientId
    const auth0Connection = config.public.auth0Connection || 'Username-Password-Authentication'

    if (!auth0Domain || !auth0ClientId) {
      event.res.statusCode = 500
      return { error: 'Auth0 configuration is missing' }
    }

    // Auth0のROPCエンドポイントでは、usernameにメールアドレス全体を使用する必要がある場合がある
    // また、emailフィールドも送信する
    // usernameはメールアドレスのローカル部分（@の前）を使用（新規登録時と同じ形式）
    const emailLocalPart = body.email.split('@')[0]
    const username = emailLocalPart.substring(0, 15)

    // Auth0の/oauth/tokenエンドポイントを使用してROPCでログイン
    // 注意: ROPCはAuth0では非推奨ですが、ユーザーエクスペリエンスのために使用
    const tokenUrl = `https://${auth0Domain}/oauth/token`
    
    // まず、username（ローカル部分）で試す
    let tokenPayload = {
      client_id: auth0ClientId,
      username: username,
      password: body.password,
      connection: auth0Connection,
      grant_type: 'password',
      scope: 'openid profile email'
    }
    
    console.log('[API] Calling Auth0 token endpoint:', tokenUrl)
    console.log('[API] Token payload (password hidden):', { ...tokenPayload, password: '***' })
    
    let response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tokenPayload),
    })
    
    // 最初の試行が失敗した場合、メールアドレス全体をusernameとして試す
    let firstResponseText = ''
    let retried = false
    if (!response.ok) {
      firstResponseText = await response.text()
      let errorData
      try {
        errorData = JSON.parse(firstResponseText)
      } catch (e) {
        // JSONパースに失敗した場合は、そのまま続行
      }
      
      // invalid_grantエラーの場合、メールアドレス全体をusernameとして再試行
      if (errorData?.error === 'invalid_grant' || errorData?.error === 'invalid_user_password') {
        console.log('[API] Retrying with full email as username')
        retried = true
        tokenPayload = {
          client_id: auth0ClientId,
          username: body.email, // メールアドレス全体を使用
          password: body.password,
          connection: auth0Connection,
          grant_type: 'password',
          scope: 'openid profile email'
        }
        
        console.log('[API] Retry token payload (password hidden):', { ...tokenPayload, password: '***' })
        
        response = await fetch(tokenUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(tokenPayload),
        })
      }
    }

    let data
    try {
      // 再試行した場合は新しいresponseから取得、そうでない場合は最初の試行のresponseTextを使用
      const responseText = retried ? await response.text() : (firstResponseText || await response.text())
      console.log('[API] Auth0 raw response:', responseText)
      data = JSON.parse(responseText)
    } catch (e) {
      console.error('[API] Failed to parse Auth0 response as JSON:', e)
      event.res.statusCode = 500
      return { error: 'auth0_response_parse_error', message: 'Failed to parse Auth0 response' }
    }
    
    console.log('[API] Auth0 response status:', response.status)
    console.log('[API] Auth0 response data:', JSON.stringify({ ...data, access_token: data.access_token ? '***' : undefined, id_token: data.id_token ? '***' : undefined }))

    if (!response.ok) {
      // Auth0のエラーレスポンスを処理
      event.res.statusCode = response.status
      
      // ROPCが有効になっていない場合、または接続が設定されていない場合のエラー
      if (data.error === 'unauthorized_client' || 
          data.error === 'server_error' ||
          data.error_description?.includes('not configured with default connection') ||
          data.error_description?.includes('Authorization server not configured')) {
        return {
          error: 'ropc_not_enabled',
          error_description: 'ROPC (Resource Owner Password Credentials) grant type is not enabled or connection is not configured. Please check:\n1. Auth0 Dashboard → Applications → Your App → Settings → Advanced Settings → Grant Types → Password (enabled)\n2. Auth0 Dashboard → Applications → Your App → Connections → Username-Password-Authentication (enabled)',
          code: data.code || data.error || 'unauthorized_client'
        }
      }
      
      // 認証情報が間違っている場合
      if (data.error === 'invalid_grant' || data.error === 'invalid_user_password') {
        return {
          error: 'invalid_credentials',
          error_description: 'メールアドレスまたはパスワードが正しくありません',
          code: data.code || 'invalid_grant'
        }
      }
      
      return { 
        error: data.error || 'login_failed',
        error_description: data.error_description || data.description || 'Failed to login',
        code: data.code
      }
    }

    // 成功した場合、トークン情報を返す
    // 注意: 実際のトークンはクライアントで使用するため、返す必要があります
    return {
      success: true,
      access_token: data.access_token,
      id_token: data.id_token,
      token_type: data.token_type,
      expires_in: data.expires_in
    }
  } catch (err) {
    console.error('Error in /api/auth/login handler:', err)
    event.res.statusCode = 500
    return { error: 'internal_server_error', message: err instanceof Error ? err.message : 'Unknown error' }
  }
})

