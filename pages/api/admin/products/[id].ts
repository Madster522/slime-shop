import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { getSupabaseAdmin } from '@/lib/supabase'
import { slugify } from '@/lib/slugify'

function cleanProduct(body: any) {
  const name = String(body.name || '').trim()
  return {
    name,
    slug: String(body.slug || slugify(name)).trim(),
    description: String(body.description || '').trim(),
    price: Number(body.price),
    image_url: String(body.image_url || '').trim() || null,
    category: String(body.category || '').trim() || null,
    is_active: Boolean(body.is_active),
    is_featured: Boolean(body.is_featured),
    is_customizable: Boolean(body.is_customizable),
    customization_schema: body.customization_schema || {},
    updated_at: new Date().toISOString(),
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.isAdmin) return res.status(403).json({ error: 'Admin access required' })

  const id = String(req.query.id || '')
  const supabase = getSupabaseAdmin()

  if (req.method === 'PATCH') {
    const product = cleanProduct(req.body)
    if (!product.name) return res.status(400).json({ error: 'Product name is required' })
    if (!Number.isFinite(product.price) || product.price < 0) return res.status(400).json({ error: 'Price must be 0 or higher' })

    const { data, error } = await supabase.from('products').update(product).eq('id', id).select().single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ product: data })
  }

  if (req.method === 'DELETE') {
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ ok: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
