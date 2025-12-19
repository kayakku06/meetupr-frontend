import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('[API] Supabase env vars not set: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
})

export default defineEventHandler(async (event) => {
  try {
    // デバッグ: 実行時に service role key が読み込まれているか確認する
    try {
      const masked = SUPABASE_SERVICE_ROLE_KEY ? `${String(SUPABASE_SERVICE_ROLE_KEY).slice(0,6)}...(${String(SUPABASE_SERVICE_ROLE_KEY).length})` : 'MISSING'
      console.log('[API] SUPABASE_SERVICE_ROLE_KEY:', masked)
    } catch (_) {}

    // リクエストは2種類をサポートする:
    // 1) JSON body に dataUrl を含む旧方式 (互換性維持)
    // 2) multipart/form-data に file を含む方法（推奨）
    let userId: string | undefined
    let filename = `avatar-${Date.now()}`
    let contentType: string | undefined
    let buffer: Buffer | null = null

    // まずヘッダで multipart かを確認
    const contentTypeHeader = String((event.node.req.headers && event.node.req.headers['content-type']) || '')
    if (contentTypeHeader.includes('multipart/form-data')) {
      // multipart の場合、ファイルと user_id を読み取る
      try {
        // readMultipartFormData は Nitro のユーティリティ
  const parts: any[] = (await readMultipartFormData(event as any)) || []
        // file パートを探す
        const filePart = parts.find(p => p.type === 'file' || p.filename)
        if (filePart) {
          const data = filePart.data || filePart._data || filePart['_data']
          // data が Uint8Array の場合が多い
          buffer = Buffer.from(data)
          filename = filePart.filename || filename
          contentType = filePart.type || filePart.mimetype || contentType
        }
        const userPart = parts.find(p => p.name === 'user_id' || p.fieldname === 'user_id')
        if (userPart) userId = userPart.value || userPart.data || userPart.value
      } catch (e) {
        console.warn('[API] Failed to parse multipart/form-data (continuing):', e)
      }
    }

    // multipart で取れなかった場合、従来の JSON dataUrl をサポート
    if (!buffer) {
      const body = await readBody(event)
      if (!body) {
        event.res.statusCode = 400
        return { error: 'empty_body' }
      }
      const payload = typeof body === 'object' ? body as any : null
      userId = userId || payload?.user_id
      const dataUrl = payload?.dataUrl
      filename = payload?.filename || filename

      if (!userId || !dataUrl) {
        event.res.statusCode = 400
        return { error: 'missing_fields', required: ['user_id','dataUrl or multipart file'] }
      }

      const m = String(dataUrl).match(/^data:(.+);base64,(.+)$/)
      if (!m) {
        event.res.statusCode = 400
        return { error: 'invalid_dataurl' }
      }

      contentType = m[1]
      const base64 = m[2]
      buffer = Buffer.from(base64, 'base64')
    }

  const extMatch = String(filename).match(/\.[0-9a-zA-Z]+$/)
  const ext = extMatch ? extMatch[0] : ''

  // user_id や filename に含まれる特殊文字（例：'|'）が原因で
  // Supabase Storage の "Invalid key" エラーになることがある。
  // 安全なパスにするため、許可された文字以外は '_' に置換する。
  const sanitizeSegment = (s: string) => String(s).replace(/[^a-zA-Z0-9._-]/g, '_')
  const safeUserId = sanitizeSegment(String(userId))
  const safeFilename = sanitizeSegment(filename.replace(/\.[0-9a-zA-Z]+$/, ''))
  const destPath = `${safeUserId}/${safeFilename}-${Date.now()}${ext}`

  console.log('[API] Upload destPath:', destPath)

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      event.res.statusCode = 500
      return { error: 'supabase_not_configured' }
    }

    // 既存のアバター画像を削除して、ユーザーあたり1ファイルのみを保持する
    try {
      // バケット内で user フォルダ以下のファイル一覧を取得
      const listPath = safeUserId
      const { data: existingFiles, error: listErr } = await supabase.storage
        .from('avatars')
        .list(listPath)

      if (listErr) {
        console.warn('[API] Failed to list existing avatar files (continuing):', listErr)
      } else if (Array.isArray(existingFiles) && existingFiles.length > 0) {
        // 削除対象パスを作成
        const pathsToRemove = existingFiles.map(f => `${safeUserId}/${f.name}`)
        try {
          const { data: removed, error: removeErr } = await supabase.storage
            .from('avatars')
            .remove(pathsToRemove)
          if (removeErr) {
            console.warn('[API] Failed to remove existing avatar files (continuing):', removeErr)
          } else {
            console.log('[API] Removed existing avatar files:', pathsToRemove)
          }
        } catch (e) {
          console.warn('[API] Exception while removing existing avatar files (continuing):', e)
        }
      }
    } catch (e) {
      console.warn('[API] Exception while listing/removing existing avatar files (continuing):', e)
    }

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(destPath, buffer as Buffer, { contentType, upsert: true })

    if (uploadError) {
      console.error('[API] Supabase storage upload error:', uploadError)
      event.res.statusCode = 500
      return { error: 'storage_upload_failed', details: uploadError }
    }

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(destPath)
    const publicUrl = urlData?.publicUrl || null

    if (publicUrl) {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', userId)

      if (profileError) {
        console.error('[API] Failed to update profiles.avatar_url:', profileError)
        return { status: 'ok', url: publicUrl, warning: 'profile_update_failed', details: profileError }
      }
    }

    return { status: 'ok', url: publicUrl }
  } catch (err) {
    console.error('[API] /api/profile/upload error:', err)
    event.res.statusCode = 500
    return { error: 'internal_error' }
  }
})
