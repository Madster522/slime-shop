import type { AppProps } from 'next/app'
import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'react-hot-toast'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import Layout from '@/components/layout/Layout'
import { CartProvider } from '@/context/CartContext'
import '@/styles/globals.css'

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <CartProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
        <Toaster position="bottom-right" />
        <Analytics />
        <SpeedInsights />
      </CartProvider>
    </SessionProvider>
  )
}
