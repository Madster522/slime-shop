import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { getSupabaseAdmin } from '@/lib/supabase'

// Square SDK - server side only
// Note: square package is imported dynamically to avoid bundling issues
async function getSquareClient() {
  const { Client, Environment } = await import('square')
  return new Client({
    accessToken: process.env.SQUARE_ACCESS_TOKEN!,
    environment: process.env.SQUARE_ENVIRONMENT === 'production'
      ? Environment.Production
      : Environment.Sandbox,
  })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Not authenticated' })
  }

  const { sourceId, orderId, amount, currency = 'USD' } = req.body

  // sourceId = token from Square Web Payments SDK (never a raw card number)
  if (!sourceId) return res.status(400).json({ error: 'Payment token (sourceId) is required' })
  if (!orderId)  return res.status(400).json({ error: 'orderId is required' })
  if (!amount)   return res.status(400).json({ error: 'amount is required' })

  try {
    const squareClient = await getSquareClient()
    const { paymentsApi } = squareClient

    // Convert dollars to cents (Square uses smallest currency unit)
    const amountCents = BigInt(Math.round(parseFloat(amount) * 100))

    const idempotencyKey = `${orderId.slice(0, 8)}-${Date.now()}`

    const response = await paymentsApi.createPayment({
      sourceId,
      idempotencyKey,
      amountMoney: {
        amount:   amountCents,
        currency: currency,
      },
      locationId: process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID!,
      note:       `Order ${orderId.slice(0, 28)}`,
      buyerEmailAddress: session.user.email,
    })

    const payment = response.result.payment
    if (!payment || payment.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'Payment failed', status: payment?.status })
    }

    // Update order in Supabase — store ONLY safe fields (never card number or CVV)
    const supabase = getSupabaseAdmin()
    await supabase
      .from('orders')
      .update({
        payment_status:    'paid',
        square_payment_id: payment.id,
        // Card details from Square response — last 4 digits only, never full number
        card_brand:  payment.cardDetails?.card?.cardBrand || null,
        card_last4:  payment.cardDetails?.card?.last4     || null,
        updated_at:  new Date().toISOString(),
      })
      .eq('id', orderId)

    return res.status(200).json({
      success:   true,
      paymentId: payment.id,
      status:    payment.status,
      receiptUrl: payment.receiptUrl,
    })

  } catch (err: any) {
    console.error('Square payment error:', err)

    // Extract Square API error message if available
    const squareError = err?.errors?.[0]?.detail || err?.message || 'Payment processing failed'
    return res.status(500).json({ error: squareError })
  }
}