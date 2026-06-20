import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { getSupabaseAdmin } from '@/lib/supabase'
import { slugify } from '@/lib/slugify'

function cleanProduct(body: any) {
  const name = String(body.name || '').trim()
  const price = Number(body.price)
  const slug = String(body.slug || slugify(name)).trim()

  return {
    name,
    slug,
    description: String(body.description || '').trim(),
    price,
    image_url: String(body.image_url || '').trim() || null,
    category: String(body.category || '').trim() || null,
    is_active: Boolean(body.is_active),
    is_featured: Boolean(body.is_featured),
    is_customizable: Boolean(body.is_customizable),
    customization_schema: body.customization_schema || {},
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.isAdmin) return res.status(403).json({ error: 'Admin access required' })

  const supabase = getSupabaseAdmin()

  if (req.method === 'GET') {
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ products: data || [] })
  }

  if (req.method === 'POST') {
    const product = cleanProduct(req.body)
    if (!product.name || product.name.length < 2) return res.status(400).json({ error: 'Product name is required' })
    if (!Number.isFinite(product.price) || product.price < 0) return res.status(400).json({ error: 'Price must be 0 or higher' })
    if (!product.slug) return res.status(400).json({ error: 'Slug is required' })

    const { data, error } = await supabase.from('products').insert(product).select().single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json({ product: data })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
