import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { getSupabaseAdmin } from '@/lib/supabase'

function generateOrderNumber(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const part1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  const part2 = Array.from({ length: 2 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `SS-${part1}-${part2}`
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.email) return res.status(401).json({ error: 'Not authenticated' })

  const { items, shipping_address, billing_address } = req.body
  if (!items?.length || !shipping_address) {
    return res.status(400).json({ error: 'items and shipping_address are required' })
  }

  const subtotal: number = items.reduce((s: number, i: any) => s + i.unit_price * i.quantity, 0)
  const shippingTotal: number = Math.max(...items.map((i: any) => i.shipping_price || 0))
  const total = subtotal + shippingTotal

  const supabase = getSupabaseAdmin()
  const now = new Date().toISOString()

  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      order_number: generateOrderNumber(),
      customer_email: session.user.email,
      customer_name: session.user.name || '',
      status: 'Pending',
      shipping_address,
      billing_address: billing_address || shipping_address,
      subtotal,
      shipping_total: shippingTotal,
      total,
      payment_status: 'pending',
      created_at: now,
      updated_at: now,
    })
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })

  // Insert order items
  if (order) {
    await supabase.from('order_items').insert(
      items.map((item: any) => ({
        order_id: order.id,
        product_id: item.product_id || null,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        shipping_price: item.shipping_price || 0,
        customization: item.customization || {},
      }))
    )

    // Insert initial status history
    await supabase.from('order_status_history').insert({
      order_id: order.id,
      status: 'Pending',
      note: 'Order placed',
      changed_by: 'system',
    })
  }

  return res.status(201).json({ order })
}
