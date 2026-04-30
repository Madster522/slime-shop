import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { getSupabaseAdmin } from '@/lib/supabase'
import { slugify } from '@/lib/slugify'

function parseImages(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map(String).map(u => u.trim()).filter(Boolean)
  if (typeof raw === 'string') return raw.split('\n').map(u => u.trim()).filter(Boolean)
  return []
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.isAdmin) return res.status(403).json({ error: 'Admin access required' })

  const { id } = req.query
  const supabase = getSupabaseAdmin()

  if (req.method === 'PATCH') {
    const updates: Record<string, any> = { ...req.body }
    if (updates.name) { updates.name = updates.name.trim(); updates.slug = slugify(updates.name) }
    if (updates.images !== undefined) updates.images = parseImages(updates.images)
    if (updates.price !== undefined) updates.price = Number(updates.price)
    if (updates.shipping_price !== undefined) updates.shipping_price = Number(updates.shipping_price)
    if (updates.estimated_print_minutes !== undefined) updates.estimated_print_minutes = Number(updates.estimated_print_minutes)
    if (updates.is_active !== undefined) updates.is_active = Boolean(updates.is_active)
    if (updates.has_customization !== undefined) updates.has_customization = Boolean(updates.has_customization)
    delete updates.id
    delete updates.created_at
    updates.updated_at = new Date().toISOString()

    const { data, error } = await supabase.from('products').update(updates).eq('id', id as string).select().single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ product: data })
  }

  if (req.method === 'DELETE') {
    const { error } = await supabase.from('products').delete().eq('id', id as string)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
