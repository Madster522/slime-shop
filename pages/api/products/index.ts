import type { NextApiRequest, NextApiResponse } from 'next'
import { getSupabaseAdmin } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const supabase = getSupabaseAdmin()
  const { category, search, sort, featured } = req.query

  let query = supabase
    .from('products')
    .select('*')
    .eq('is_active', true)

  if (category && category !== 'All') {
    query = query.eq('category', category as string)
  }
  if (featured === 'true') {
    query = query.eq('is_featured', true)
  }
  if (search && typeof search === 'string' && search.trim()) {
    query = query.ilike('name', `%${search.trim()}%`)
  }

  switch (sort) {
    case 'price_asc':  query = query.order('price', { ascending: true });  break
    case 'price_desc': query = query.order('price', { ascending: false }); break
    case 'name':       query = query.order('name',  { ascending: true });  break
    default:           query = query.order('created_at', { ascending: false })
  }

  const { data, error } = await query
  if (error) return res.status(500).json({ error: error.message })
  return res.status(200).json({ products: data || [] })
}
