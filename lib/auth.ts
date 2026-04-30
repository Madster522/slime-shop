import { getServerSession } from 'next-auth'
import type { NextApiRequest, NextApiResponse } from 'next'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { ADMIN_EMAILS } from '@/config/constants'

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return ADMIN_EMAILS.includes(email.toLowerCase())
}

export async function requireAdmin(req: NextApiRequest, res: NextApiResponse): Promise<boolean> {
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.email || !isAdminEmail(session.user.email)) {
    res.status(403).json({ error: 'Admin access required' })
    return false
  }
  return true
}

export async function requireAuth(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.email) {
    res.status(401).json({ error: 'Authentication required' })
    return null
  }
  return session
}
