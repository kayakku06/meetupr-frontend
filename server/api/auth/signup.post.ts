import { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
  try {
    const body = await readBody(event)
    const config = useRuntimeConfig()

    // ボディの存在確認
    if (body == null) {
      console.warn('[API] /api/auth/signup POST empty body received (null/undefined)')
      event.res.statusCode = 400
      return { error: 'empty_body', message: 'Request body is required' }
    }

    // ボディが空オブジェクトかどうかを安全に判定
    const isEmptyObject = typeof body === 'object' && !Array.isArray(body) && Object.keys(body || {}).length === 0
    if (isEmptyObject) {
      console.warn('[API] /api/auth/signup POST empty body received (empty object)')
      event.res.statusCode = 400
      return { error: 'empty_body', message: 'Request body cannot be empty' }
    }

    // バリデーション
    if (!body.email || !body.password) {
      console.warn('[API] /api/auth/signup POST missing email or password')
      event.res.statusCode = 400
      return { error: 'email and password are required', message: 'Email and password are required' }
    }

    // 学内メールアドレスのバリデーション
    if (!body.email.endsWith('@ed.ritsumei.ac.jp')) {
      event.res.statusCode = 400
      return { error: 'email must end with @ed.ritsumei.ac.jp' }
    }

    // パスワードのバリデーション
    if (body.password.length < 8) {
      event.res.statusCode = 400
      return { error: 'password must be at least 8 characters' }
    }

    // Auth0の設定を取得
    const auth0Domain = config.public.auth0Domain
    const auth0ClientId = config.public.auth0ClientId
    const auth0Connection = config.public.auth0Connection || 'Username-Password-Authentication'

    if (!auth0Domain || !auth0ClientId) {
      event.res.statusCode = 500
      return { error: 'Auth0 configuration is missing' }
    }

    // Auth0の/dbconnections/signupエンドポイントを呼び出す
    const signupUrl = `https://${auth0Domain}/dbconnections/signup`
    
    // usernameはリクエストボディから取得、なければメールアドレスのローカル部分（@の前）を使用し、15文字に制限
    // 例: example@ed.ritsumei.ac.jp -> example
    const emailLocalPart = body.email.split('@')[0]
    
    // デバッグ用: リクエストボディの内容を確認
    console.error('[API] Signup request body:', {
      email: body.email,
      username: body.username,
      hasUsername: !!body.username,
      emailLocalPart: emailLocalPart
    })
    
    const username = body.username ? body.username.substring(0, 15) : emailLocalPart.substring(0, 15) // 最大15文字
    
    const auth0Payload = {
      client_id: auth0ClientId,
      email: body.email,
      username: username, // requires_usernameが有効な場合に必要（1-15文字）
      password: body.password,
      connection: auth0Connection,
    }
    
    // デバッグ用: Auth0に送信するpayloadを確認
    console.error('[API] Auth0 payload (password hidden):', {
      ...auth0Payload,
      password: '***',
      username: username
    })
    
    const response = await fetch(signupUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(auth0Payload),
    })

    let data
    try {
      data = await response.json()
    } catch (e) {
      console.error('[API] Failed to parse Auth0 response as JSON:', e)
      const text = await response.text()
      console.error('[API] Auth0 response text:', text)
      event.res.statusCode = 500
      return { error: 'auth0_response_parse_error', message: 'Failed to parse Auth0 response' }
    }

    if (!response.ok) {
      // Auth0のエラーレスポンスを処理
      event.res.statusCode = response.status
      
      // メールアドレスが既に登録されている場合のみ、user_existsエラーを返す
      // Auth0のエラーメッセージを確認して、実際にメールアドレスが重複している場合のみ
      const errorMessage = data.error_description || data.description || ''
      const errorCode = data.code || data.error || ''
      
      // デバッグ用: 実際のエラー内容をログに出力
      console.error('[API] Auth0 signup error:', {
        status: response.status,
        code: errorCode,
        error: data.error,
        error_description: errorMessage,
        full_response: data
      })
      
      const isUserExists = 
        errorMessage.toLowerCase().includes('already exists') ||
        errorMessage.toLowerCase().includes('user already exists') ||
        errorMessage.toLowerCase().includes('email already exists') ||
        errorMessage.toLowerCase().includes('既に登録') ||
        (errorCode === 'invalid_signup' && (errorMessage.toLowerCase().includes('user') || errorMessage.toLowerCase().includes('email')))
      
      if (isUserExists) {
        return {
          error: 'user_exists',
          error_description: 'このメールアドレスは既に登録されています',
          code: errorCode || 'user_exists'
        }
      }
      
      return { 
        error: data.error || 'signup_failed',
        error_description: data.error_description || data.description || 'Failed to create user',
        code: data.code
      }
    }

    // 成功した場合、ユーザー情報を返す
    return {
      success: true,
      user: {
        email: data.email,
        _id: data._id
      }
    }
  } catch (err) {
    console.error('Error in /api/auth/signup handler:', err)
    event.res.statusCode = 500
    return { error: 'internal_server_error', message: err instanceof Error ? err.message : 'Unknown error' }
  }
})

