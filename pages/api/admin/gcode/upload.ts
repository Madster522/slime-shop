import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.isAdmin) return res.status(403).json({ error: 'Forbidden' })

  const { filename, file_size, printer_id, order_id } = req.body
  if (!filename) return res.status(400).json({ error: 'filename is required' })

  // Parse metadata from filename / mock analysis
  const estimated_time   = Math.floor(Math.random() * 180) + 30
  const layer_count      = Math.floor(Math.random() * 400) + 50
  const filament_usage   = Math.floor(Math.random() * 50) + 5
  const warnings: string[] = filename.toLowerCase().includes('large') ? ['File may exceed printer build volume'] : []

  const data = {
    id:            `gcode-${Date.now()}`,
    original_name: filename,
    file_size:     file_size || 0,
    printer_id:    printer_id || null,
    order_id:      order_id || null,
    status:        'uploaded',
    estimated_time,
    layer_count,
    filament_usage,
    warnings,
    created_at:    new Date().toISOString(),
  }

  return res.status(201).json({ data })
}
