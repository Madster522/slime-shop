import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { getSupabaseAdmin } from '@/lib/supabase'

const ALLOWED_KEYS = ['company', 'status'] as const
type AllowedKey = typeof ALLOWED_KEYS[number]

function cleanString(value: unknown, max = 500) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

function cleanBool(value: unknown) {
  return Boolean(value)
}

function cleanCompany(input: any) {
  return {
    company_name: cleanString(input.company_name, 80) || 'Slime Shop',
    tagline: cleanString(input.tagline, 120),
    support_email: cleanString(input.support_email, 120),
    discord_url: cleanString(input.discord_url, 250),
    business_hours: cleanString(input.business_hours, 120),
    announcement: cleanString(input.announcement, 250),
  }
}

function cleanStatus(input: any, email?: string | null) {
  return {
    store_online: cleanBool(input.store_online),
    accepting_orders: cleanBool(input.accepting_orders),
    maintenance_mode: cleanBool(input.maintenance_mode),
    maintenance_title: cleanString(input.maintenance_title, 120) || 'Slime Shop is getting upgraded',
    maintenance_message: cleanString(input.maintenance_message, 500),
    banner_enabled: cleanBool(input.banner_enabled),
    banner_message: cleanString(input.banner_message, 250),
    last_updated_by: email || 'admin',
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.isAdmin) return res.status(403).json({ error: 'Admin access required' })

  const supabase = getSupabaseAdmin()

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('site_settings')
      .select('key,value,updated_at')
      .in('key', ALLOWED_KEYS as unknown as string[])

    if (error) return res.status(500).json({ error: error.message })

    return res.status(200).json({ settings: Object.fromEntries((data || []).map(row => [row.key, row.value])) })
  }

  if (req.method === 'PATCH') {
    const { key, value } = req.body as { key?: AllowedKey; value?: any }
    if (!key || !ALLOWED_KEYS.includes(key)) return res.status(400).json({ error: 'Invalid settings key' })

    const cleaned = key === 'company' ? cleanCompany(value || {}) : cleanStatus(value || {}, session.user.email)

    const { data, error } = await supabase
      .from('site_settings')
      .upsert({ key, value: cleaned, updated_at: new Date().toISOString() }, { onConflict: 'key' })
      .select()
      .single()

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ setting: data })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
