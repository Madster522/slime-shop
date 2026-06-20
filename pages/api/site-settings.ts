import type { NextApiRequest, NextApiResponse } from 'next'
import { getSupabaseAdmin } from '@/lib/supabase'

const defaults = {
  company: {
    company_name: 'Slime Shop',
    tagline: 'Custom 3D printed slime products',
    support_email: 'support@example.com',
    discord_url: '',
    business_hours: 'Mon-Fri after school / evenings',
    announcement: '',
  },
  status: {
    store_online: true,
    accepting_orders: true,
    maintenance_mode: false,
    maintenance_title: 'Slime Shop is getting upgraded',
    maintenance_message: 'We are updating the store. Please check back soon.',
    banner_enabled: true,
    banner_message: 'Slime Shop is online and accepting custom orders.',
    last_updated_by: 'system',
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('site_settings')
      .select('key,value')
      .in('key', ['company', 'status'])

    if (error) throw error
    const settings = Object.fromEntries((data || []).map(row => [row.key, row.value]))
    return res.status(200).json({ ...defaults, ...settings })
  } catch {
    return res.status(200).json(defaults)
  }
}
