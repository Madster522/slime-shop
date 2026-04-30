import type { NextApiRequest, NextApiResponse } from 'next'
import { getSupabaseAdmin } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const { name, email, subject, message, order_number } = req.body
  if (!name || !email || !message) return res.status(400).json({ error: 'name, email and message are required' })

  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from('contact_messages').insert({
    name: name.trim().slice(0, 100),
    email: email.trim().toLowerCase(),
    subject: subject?.trim().slice(0, 200) || 'General Inquiry',
    message: message.trim().slice(0, 3000),
    order_number: order_number?.trim() || null,
  })

  if (error) return res.status(500).json({ error: error.message })
  return res.status(201).json({ success: true, message: "Message received! We'll get back to you within 24 hours." })
}
