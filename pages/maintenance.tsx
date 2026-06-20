import Link from 'next/link'

export default function MaintenancePage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <section className="mx-auto max-w-xl slime-card p-8 text-center">
        <div className="text-6xl">🛠️</div>
        <h1 className="mt-5 text-4xl font-black">Maintenance</h1>
        <p className="mt-3 text-slate-400">The shop may be getting updates. Visit the status page for more details.</p>
        <Link href="/status" className="slime-button mt-6">View Status</Link>
      </section>
    </main>
  )
}
