import Link from 'next/link'

export default function NotFound() {
  return <main className="min-h-screen bg-slate-950 px-6 py-20 text-white"><section className="mx-auto max-w-xl slime-card p-8 text-center"><h1 className="text-5xl font-black">404</h1><p className="mt-3 text-slate-400">Page not found.</p><Link href="/" className="slime-button mt-6">Go Home</Link></section></main>
}
