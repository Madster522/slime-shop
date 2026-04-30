import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { getSupabaseAdmin } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.isAdmin) return res.status(403).json({ error: 'Forbidden' })

  const supabase = getSupabaseAdmin()

  if (req.method === 'GET') {
    const { data, error } = await supabase.from('printers').select('*').order('created_at', { ascending: true })
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ printers: data || [] })
  }

  if (req.method === 'POST') {
    const { name, type, connection_type, ip_address, port, api_key, access_code, serial_number, notes } = req.body
    if (!name || !connection_type) return res.status(400).json({ error: 'name and connection_type are required' })

    const { data, error } = await supabase.from('printers').insert({
      name, type: type || 'FDM', connection_type,
      ip_address: ip_address || null, port: port || 80,
      api_key: api_key || null, access_code: access_code || null,
      serial_number: serial_number || null, notes: notes || null,
      status: 'unknown', is_active: true,
    }).select().single()

    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json({ printer: data })
  }

  return res.status(405).end()
}
