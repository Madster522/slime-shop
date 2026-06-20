import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <>
      <Head>
        <title>Slime Shop | Custom 3D Prints</title>
        <meta
          name="description"
          content="Custom 3D prints, custom products, and personalized items."
        />
        <link rel="icon" href="/logo.png" />
      </Head>

      <main className="min-h-screen bg-slate-950 text-white">
        <header className="border-b border-white/10 bg-slate-950/80">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Slime Shop Logo"
                width={44}
                height={44}
                className="rounded-xl"
              />

              <div>
                <p className="text-lg font-extrabold leading-none">
                  Slime Shop
                </p>
                <p className="text-xs text-green-300">
                  Custom 3D Prints
                </p>
              </div>
            </Link>

            <nav className="flex items-center gap-4 text-sm font-semibold">
              <Link href="/shop" className="text-gray-300 hover:text-white">
                Shop
              </Link>

              <Link href="/status" className="text-gray-300 hover:text-white">
                Status
              </Link>

              <Link
                href="/cart"
                className="rounded-xl bg-green-500 px-4 py-2 text-black hover:bg-green-400"
              >
                Cart
              </Link>
            </nav>
          </div>
        </header>

        <section className="bg-gradient-to-br from-slate-950 via-slate-950 to-emerald-950">
          <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-2 md:items-center">
            <div>
              <p className="mb-4 text-sm font-bold uppercase tracking-[0.35em] text-green-300">
                Custom 3D Prints
              </p>

              <h1 className="text-5xl font-extrabold leading-tight md:text-7xl">
                Custom products made simple.
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-gray-300">
                Shop custom prints, personalize items, use safe coupons, and
                check store status anytime.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/shop"
                  className="rounded-xl bg-green-500 px-6 py-3 font-bold text-black hover:bg-green-400"
                >
                  Shop Products
                </Link>

                <Link
                  href="/status"
                  className="rounded-xl border border-white/20 bg-white/5 px-6 py-3 font-bold text-white hover:bg-white/10"
                >
                  Store Status
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-900 p-8 shadow-2xl">
              <div className="rounded-3xl bg-gradient-to-br from-emerald-900/70 to-slate-950 p-8 text-center">
                <Image
                  src="/logo.png"
                  alt="Slime Shop"
                  width={260}
                  height={260}
                  className="mx-auto mb-6 rounded-2xl"
                  priority
                />

                <h2 className="text-3xl font-extrabold">
                  Designed With Care. Made For You.
                </h2>

                <p className="mt-4 text-gray-300">
                  Custom 3D prints, personalized items, and clean designs made
                  with quality and care.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-sm font-bold uppercase text-green-300">
                Featured
              </p>
              <h2 className="text-3xl font-extrabold">
                Popular Products
              </h2>
            </div>

            <Link
              href="/shop"
              className="font-bold text-green-300 hover:text-green-200"
            >
              View all
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-slate-900 p-6">
              <div className="mb-5 flex h-40 items-center justify-center rounded-2xl bg-emerald-950 text-6xl">
                🧪
              </div>

              <h3 className="text-xl font-bold">
                Custom Slime Print
              </h3>

              <p className="mt-2 text-gray-400">
                A clean custom item made for your setup.
              </p>

              <Link
                href="/shop"
                className="mt-5 inline-block rounded-xl bg-green-500 px-4 py-2 font-bold text-black hover:bg-green-400"
              >
                View Product
              </Link>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-900 p-6">
              <div className="mb-5 flex h-40 items-center justify-center rounded-2xl bg-emerald-950 text-6xl">
                📦
              </div>

              <h3 className="text-xl font-bold">
                Personalized Item
              </h3>

              <p className="mt-2 text-gray-400">
                Add names, colors, and simple custom options.
              </p>

              <Link
                href="/shop"
                className="mt-5 inline-block rounded-xl bg-green-500 px-4 py-2 font-bold text-black hover:bg-green-400"
              >
                Customize
              </Link>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-900 p-6">
              <div className="mb-5 flex h-40 items-center justify-center rounded-2xl bg-emerald-950 text-6xl">
                🎨
              </div>

              <h3 className="text-xl font-bold">
                Custom Product Design
              </h3>

              <p className="mt-2 text-gray-400">
                Your ideas turned into real products.
              </p>

              <Link
                href="/shop"
                className="mt-5 inline-block rounded-xl bg-green-500 px-4 py-2 font-bold text-black hover:bg-green-400"
              >
                Start Order
              </Link>
            </div>
          </div>
        </section>

        <footer className="border-t border-white/10 px-6 py-8 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} Slime Shop. Custom 3D prints and
          personalized products.
        </footer>
      </main>
    </>
  )
}