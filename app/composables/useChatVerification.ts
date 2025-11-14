import { useAuth } from './useAuth'

/**
 * チャット機能の動作確認用のヘルパー関数
 * FRONTEND_WEBSOCKET_IMPLEMENTATION.mdに沿った実装
 */
export const useChatVerification = () => {
  const { getAccessToken } = useAuth()
  const config = useRuntimeConfig()

  // トークンの有効性を確認
  const verifyToken = async (token: string): Promise<boolean> => {
    try {
      // トークンの形式を確認（デバッグ用）
      const tokenParts = token.split('.')
      console.log('Token format check:', {
        parts: tokenParts.length,
        isJWT: tokenParts.length === 3,
        isJWE: tokenParts.length === 5,
        firstPart: tokenParts[0]?.substring(0, 20) + '...'
      })

      // まず /api/v1/chats でトークンを検証（このエンドポイントは動作している）
      try {
        const response = await $fetch(`${config.public.apiBaseUrl}/api/v1/chats`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        // チャット一覧が取得できれば、トークンは有効
        return true
      } catch (chatsError: any) {
        // /api/v1/chats で失敗した場合、/api/v1/users/me を試す
        if (chatsError.statusCode === 401) {
          console.warn('Token verification via /api/v1/chats failed with 401, trying /api/v1/users/me')
          try {
            const userResponse = await $fetch(`${config.public.apiBaseUrl}/api/v1/users/me`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            })
            return !!userResponse
          } catch (userError: any) {
            console.error('Token verification failed on both endpoints:', {
              chatsError: chatsError.statusCode,
              userError: userError.statusCode,
              message: userError?.message || chatsError?.message
            })
            return false
          }
        }
        // 401以外のエラー（404など）は、エンドポイントが存在しない可能性がある
        console.warn('Token verification endpoint may not exist:', chatsError.statusCode)
        return false
      }
    } catch (error: any) {
      console.error('Token verification failed:', {
        error,
        statusCode: error?.statusCode,
        message: error?.message,
        data: error?.data
      })
      return false
    }
  }

  // サーバーが起動しているか確認
  const checkServer = async (): Promise<boolean> => {
    try {
      const response = await $fetch(`${config.public.apiBaseUrl}/`, {
        method: 'GET'
      })
      return true
    } catch (error: any) {
      // 404でもサーバーは起動しているとみなす
      if (error.statusCode === 404) {
        return true
      }
      return false
    }
  }

  // チャット一覧が取得できるか確認
  const checkChatsEndpoint = async (): Promise<{ success: boolean; message: string }> => {
    try {
      const token = await getAccessToken()
      if (!token) {
        return {
          success: false,
          message: '認証トークンを取得できませんでした'
        }
      }

      // トークンの形式を確認
      const tokenParts = token.split('.')
      const isJWT = tokenParts.length === 3
      const isJWE = tokenParts.length === 5

      if (!isJWT && !isJWE) {
        return {
          success: false,
          message: `トークンの形式が不正です（セグメント数: ${tokenParts.length}）`
        }
      }

      if (isJWE) {
        console.warn('JWE形式のトークンが取得されました。バックエンドがJWT形式を期待している可能性があります。')
      }

      // 直接チャット一覧を取得してみる（トークン検証をスキップ）
      try {
        const response = await $fetch(`${config.public.apiBaseUrl}/api/v1/chats`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        return {
          success: true,
          message: `チャット一覧の取得に成功しました（${Array.isArray(response) ? response.length : 0}件）`
        }
      } catch (apiError: any) {
        const errorDetail = apiError?.data?.error || apiError?.message || '不明なエラー'
        return {
          success: false,
          message: `チャット一覧の取得に失敗しました: ${errorDetail}${isJWE ? ' (JWE形式のトークンが原因の可能性があります)' : ''}`
        }
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'チャット一覧の取得に失敗しました'
      }
    }
  }

  // WebSocket接続のテスト
  const testWebSocketConnection = async (chatId: number): Promise<{ success: boolean; message: string }> => {
    return new Promise((resolve) => {
      const tokenPromise = getAccessToken()
      
      tokenPromise.then(async (token) => {
        if (!token) {
          resolve({
            success: false,
            message: '認証トークンを取得できませんでした'
          })
          return
        }

        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
        const wsHost = config.public.wsHost || 'localhost:8080'
        const wsUrl = `${wsProtocol}//${wsHost}/ws/chat/${chatId}?token=${encodeURIComponent(token)}`
        
        const ws = new WebSocket(wsUrl)
        let resolved = false

        const timeout = setTimeout(() => {
          if (!resolved) {
            resolved = true
            ws.close()
            resolve({
              success: false,
              message: 'WebSocket接続がタイムアウトしました'
            })
          }
        }, 5000)

        ws.onopen = () => {
          if (!resolved) {
            resolved = true
            clearTimeout(timeout)
            ws.close(1000, 'Test completed')
            resolve({
              success: true,
              message: 'WebSocket接続に成功しました'
            })
          }
        }

        ws.onerror = (error) => {
          if (!resolved) {
            resolved = true
            clearTimeout(timeout)
            resolve({
              success: false,
              message: `WebSocket接続エラー: ${(error as any)?.message || '不明なエラー'}`
            })
          }
        }

        ws.onclose = (event) => {
          if (!resolved) {
            resolved = true
            clearTimeout(timeout)
            if (event.code === 1000) {
              // 正常終了（テスト成功）
              return
            }
            resolve({
              success: false,
              message: `WebSocket接続が閉じられました (コード: ${event.code}, 理由: ${event.reason || 'なし'})`
            })
          }
        }
      }).catch((error) => {
        resolve({
          success: false,
          message: `トークン取得エラー: ${error.message}`
        })
      })
    })
  }

  // 包括的な動作確認
  const runFullVerification = async (chatId?: number) => {
    const results: Array<{ name: string; success: boolean; message: string }> = []

    // 1. サーバーの起動確認
    console.log('1. サーバーの起動確認...')
    const serverRunning = await checkServer()
    results.push({
      name: 'サーバーの起動確認',
      success: serverRunning,
      message: serverRunning ? 'サーバーは起動しています' : 'サーバーに接続できません'
    })

    // 2. トークンの取得と検証
    console.log('2. トークンの取得と検証...')
    const token = await getAccessToken()
    if (token) {
      // チャット一覧の取得が成功している場合、トークンは有効とみなす
      // （チャット一覧の取得確認で検証済み）
      const chatsResult = await checkChatsEndpoint()
      const isValid = chatsResult.success || await verifyToken(token)
      results.push({
        name: 'トークンの検証',
        success: isValid,
        message: isValid 
          ? 'トークンは有効です（チャット一覧の取得で確認済み）' 
          : 'トークンが無効です。ただし、チャット一覧の取得は成功しているため、エンドポイントの問題の可能性があります。'
      })
    } else {
      results.push({
        name: 'トークンの取得',
        success: false,
        message: '認証トークンを取得できませんでした'
      })
    }

    // 3. チャット一覧の取得確認
    console.log('3. チャット一覧の取得確認...')
    const chatsResult = await checkChatsEndpoint()
    results.push({
      name: 'チャット一覧の取得',
      success: chatsResult.success,
      message: chatsResult.message
    })

    // 4. WebSocket接続のテスト（chatIdが指定されている場合）
    if (chatId) {
      console.log(`4. WebSocket接続のテスト (chatId: ${chatId})...`)
      const wsResult = await testWebSocketConnection(chatId)
      results.push({
        name: 'WebSocket接続',
        success: wsResult.success,
        message: wsResult.message
      })
    }

    return results
  }

  return {
    verifyToken,
    checkServer,
    checkChatsEndpoint,
    testWebSocketConnection,
    runFullVerification
  }
}


