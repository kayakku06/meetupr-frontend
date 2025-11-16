// ...existing code...
import { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
  try {
    const body = await readBody(event)

    // ボディの存在確認
    if (body == null) {
      console.warn('[API] /api/profile POST empty body received (null/undefined)')
      event.res.statusCode = 400
      return { error: 'empty_body' }
    }

    // ボディが空オブジェクトかどうかを安全に判定
    const isEmptyObject = typeof body === 'object' && !Array.isArray(body) && Object.keys(body || {}).length === 0
    if (isEmptyObject) {
      console.warn('[API] /api/profile POST empty body received (empty object)')
      event.res.statusCode = 400
      return { error: 'empty_body' }
    }

    // body の型に応じてログ出力を安全に行う
    let bodyLog: string
    if (typeof body === 'string') {
      bodyLog = body
    } else {
      try {
        bodyLog = JSON.stringify(body)
      } catch (e) {
        try {
          // Node の util を直接 import せず、安全にオブジェクトを文字列化
          // 深さ指定の簡易実装: JSON.stringify が失敗する際の最後の手段として
          bodyLog = String(body)
        } catch (e2) {
          bodyLog = String(body)
        }
      }
    }

    console.log('[API] /api/profile POST body:', bodyLog)

    // 安全なレスポンス: 受信したデータをそのまま返すが、必要ならここでバリデーションを追加
    return {
      status: 'ok',
      received: body
    }
  } catch (err) {
    console.error('Error in /api/profile handler:', err)
    // もし err がオブジェクトで stack を持っていればログに含める
    try {
      const stack = (err && typeof err === 'object' && 'stack' in err) ? (err as any).stack : null
      console.error(stack || err)
    } catch (_) {}
    event.res.statusCode = 500
    return { error: 'internal_server_error' }
  }
})
// ...existing code...