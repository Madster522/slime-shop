import type { NextApiRequest, NextApiResponse } from 'next'
import { getSupabaseAdmin } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()

  const { slug } = req.query
  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug as string)
    .eq('is_active', true)
    .single()

  if (error || !data) return res.status(404).json({ error: 'Product not found' })
  return res.status(200).json({ product: data })
}
