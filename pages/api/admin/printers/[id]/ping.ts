import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { getSupabaseAdmin } from '@/lib/supabase'

async function pingOctoPrint(printer: any) {
  try {
    const base = `http://${printer.ip_address}:${printer.port || 80}`
    const res = await fetch(`${base}/api/printer`, {
      headers: { 'X-Api-Key': printer.api_key },
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return { online: false, status: 'offline' }
    const data = await res.json()
    return {
      online: true,
      status: 'idle',
      temperatures: {
        hotend: data.temperature?.tool0?.actual || 0,
        bed: data.temperature?.bed?.actual || 0,
      },
    }
  } catch {
    return { online: false, status: 'offline', error: 'Could not connect' }
  }
}

async function pingBridge(printer: any) {
  try {
    const res = await fetch(
      `http://localhost:5001/printer/status?id=${printer.id}`,
      { signal: AbortSignal.timeout(3000) }
    )
    if (!res.ok) return { online: false, status: 'offline' }
    return await res.json()
  } catch {
    return { online: false, status: 'offline', error: 'Local bridge not running' }
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()

  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.isAdmin) return res.status(403).json({ error: 'Forbidden' })

  const { id } = req.query
  const supabase = getSupabaseAdmin()

  const { data: printer, error } = await supabase
    .from('printers').select('*').eq('id', id as string).single()

  if (error || !printer) return res.status(404).json({ error: 'Printer not found' })

  let liveStatus: any
  switch (printer.connection_type) {
    case 'octoprint':
    case 'network':
      liveStatus = await pingOctoPrint(printer)
      break
    case 'bambu':
    case 'usb':
    default:
      liveStatus = await pingBridge(printer)
  }

  await supabase.from('printers')
    .update({ status: liveStatus.status, updated_at: new Date().toISOString() })
    .eq('id', id as string)

  return res.status(200).json(liveStatus)
}
