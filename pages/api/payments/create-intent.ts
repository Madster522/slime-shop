import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.email) return res.status(401).json({ error: 'Not authenticated' })

  const { amount, orderId } = req.body
  if (!amount || !orderId) return res.status(400).json({ error: 'amount and orderId required' })

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount:               Math.round(parseFloat(amount) * 100),
      currency:             'usd',
      payment_method_types: ['card'],
      metadata: {
        orderId,
        customerEmail: session.user.email,
      },
      receipt_email: session.user.email,
    })

    return res.status(200).json({ clientSecret: paymentIntent.client_secret })
  } catch (err: any) {
    console.error('Stripe error:', err)
    return res.status(500).json({ error: err.message })
  }
}