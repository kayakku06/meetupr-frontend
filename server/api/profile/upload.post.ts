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

    const body = await readBody(event)
    if (!body) {
      event.res.statusCode = 400
      return { error: 'empty_body' }
    }

    // 期待: { user_id: string, filename?: string, dataUrl: string }
    const payload = typeof body === 'object' ? body as any : null
    const userId = payload?.user_id
    const dataUrl = payload?.dataUrl
    const filename = payload?.filename || `avatar-${Date.now()}`

    if (!userId || !dataUrl) {
      event.res.statusCode = 400
      return { error: 'missing_fields', required: ['user_id','dataUrl'] }
    }

    // dataUrl: data:<mime>;base64,xxxxx
    const m = String(dataUrl).match(/^data:(.+);base64,(.+)$/)
    if (!m) {
      event.res.statusCode = 400
      return { error: 'invalid_dataurl' }
    }

    const contentType = m[1]
    const base64 = m[2]
    const buffer = Buffer.from(base64, 'base64')

  const extMatch = filename.match(/\.[0-9a-zA-Z]+$/)
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

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(destPath, buffer, { contentType, upsert: true })

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
