#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment')
  process.exit(2)
}

const supabase = createClient(url, key, { auth: { persistSession: false } })

const payload = {
  id: 'auth0|6917a018892660382b9d1c6e',
  email: 'is0707ip@ed.ritsumei.ac.jp',
  username: 'is0707ip'
}

try {
  const { data, error } = await supabase
    .from('users')
    .upsert([payload], { onConflict: 'id' })
    .select()

  if (error) {
    console.error('Supabase upsert error:', error)
    process.exit(1)
  }

  console.log('Upsert result:', JSON.stringify(data, null, 2))
} catch (e) {
  console.error('Exception while upserting user:', e)
  process.exit(1)
}
