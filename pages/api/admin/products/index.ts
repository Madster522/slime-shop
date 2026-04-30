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

  const supabase = getSupabaseAdmin()

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ products: data || [] })
  }

  if (req.method === 'POST') {
    const { name, description, price, shipping_price, images, category,
            stock_status, is_active, is_featured, has_customization,
            customization_options, estimated_print_minutes } = req.body

    if (!name?.trim()) return res.status(400).json({ error: 'name is required' })
    if (price == null || isNaN(Number(price))) return res.status(400).json({ error: 'price must be a number' })

    let slug = slugify(name)
    const { data: existing } = await supabase.from('products').select('id').eq('slug', slug).maybeSingle()
    if (existing) slug = `${slug}-${Date.now()}`

    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from('products')
      .insert({
        name: name.trim(),
        slug,
        description: description?.trim() || '',
        price: Number(price),
        shipping_price: Number(shipping_price) || 0,
        images: parseImages(images),
        category: category || 'General',
        stock_status: stock_status || 'made_to_order',
        is_active: is_active !== undefined ? Boolean(is_active) : true,
        is_featured: Boolean(is_featured) || false,
        has_customization: Boolean(has_customization) || false,
        customization_options: customization_options || [],
        estimated_print_minutes: Number(estimated_print_minutes) || 60,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single()

    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json({ product: data })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
