import { ADMIN_EMAILS } from '@/config/constants'

export function isAdminEmail(email?: string | null) {
  if (!email) return false
  return ADMIN_EMAILS.map(e => e.toLowerCase()).includes(email.toLowerCase())
}
