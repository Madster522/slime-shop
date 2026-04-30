import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

export function useRequireAuth(redirectTo = '/auth/signin') {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push(`${redirectTo}?callbackUrl=${encodeURIComponent(router.asPath)}`)
    }
  }, [session, status, router, redirectTo])

  return { session, status, isLoading: status === 'loading' }
}

export function useRequireAdmin() {
  const { session, status, isLoading } = useRequireAuth()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    if (session && !(session.user as any).isAdmin) {
      router.push('/')
    }
  }, [session, status, router])

  return { session, status, isLoading, isAdmin: (session?.user as any)?.isAdmin ?? false }
}
