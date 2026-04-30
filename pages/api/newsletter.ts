import type { NextApiRequest, NextApiResponse } from 'next'
import { getSupabaseAdmin } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const { email } = req.body
  if (!email || !email.includes('@')) return res.status(400).json({ error: 'Valid email required' })

  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from('newsletter_subscribers').upsert(
    { email: email.trim().toLowerCase(), subscribed_at: new Date().toISOString() },
    { onConflict: 'email', ignoreDuplicates: true }
  )
  if (error) return res.status(500).json({ error: error.message })
  return res.status(200).json({ success: true, message: "You're on the list! 🎉" })
}
