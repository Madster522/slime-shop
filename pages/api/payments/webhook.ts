import type { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'
import { getSupabaseAdmin } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-05-27.dahlia' })

export const config = { api: { bodyParser: false } }

async function getRawBody(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', chunk => chunks.push(chunk))
    req.on('end',  ()    => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const rawBody = await getRawBody(req)
  const sig     = req.headers['stripe-signature'] as string

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error('Webhook signature failed:', err.message)
    return res.status(400).json({ error: `Webhook error: ${err.message}` })
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi      = event.data.object as Stripe.PaymentIntent
    const orderId = pi.metadata.orderId

    if (orderId) {
      const supabase = getSupabaseAdmin()

      // Get card details safely from the payment intent
      let card_last4: string | null = null
      let card_brand: string | null = null

      if (pi.payment_method) {
        try {
          const pm = await stripe.paymentMethods.retrieve(pi.payment_method as string)
          card_last4 = pm.card?.last4  || null
          card_brand = pm.card?.brand  || null
        } catch { /* ignore */ }
      }

      await supabase.from('orders').update({
        payment_status:    'paid',
        status:            'Processing',
        stripe_payment_id: pi.id,
        card_last4,
        card_brand,
        updated_at:        new Date().toISOString(),
      }).eq('id', orderId)

      await supabase.from('order_status_history').insert({
        order_id:   orderId,
        status:     'Processing',
        note:       'Payment received',
        changed_by: 'stripe-webhook',
      })
    }
  }

  return res.status(200).json({ received: true })
}