import Link from 'next/link';

type CustomerHeroProps = {
  name: string;
  activeOrders?: number;
  cartCount?: number;
};

export function CustomerHero({ name, activeOrders = 0, cartCount = 0 }: CustomerHeroProps) {
  return (
    <section className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 p-6 sm:p-8 lg:p-10 text-white shadow-xl shadow-slate-900/20">
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-16 left-1/4 h-48 w-48 rounded-full bg-teal-400/10 blur-3xl"
        aria-hidden
      />

      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl">
          <p className="text-sm font-medium text-emerald-300/90">Your personal dashboard</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            Welcome back, {name}
          </h1>
          <p className="mt-3 text-sm text-slate-300 leading-relaxed sm:text-base">
            Browse our catalog, track deliveries, and pay securely — everything in one professional workspace.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/customer/products"
              className="inline-flex items-center rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-lg hover:bg-emerald-50 transition-colors"
            >
              Start shopping
            </Link>
            <Link
              href="/customer/orders"
              className="inline-flex items-center rounded-xl border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/20 transition-colors"
            >
              Track orders
            </Link>
          </div>
        </div>

        <div className="flex gap-4 lg:gap-6">
          <div className="rounded-2xl bg-white/10 px-5 py-4 backdrop-blur-md ring-1 ring-white/10 min-w-[7rem]">
            <p className="text-2xl font-bold tabular-nums">{activeOrders}</p>
            <p className="text-xs text-slate-300 mt-0.5">Active orders</p>
          </div>
          <div className="rounded-2xl bg-white/10 px-5 py-4 backdrop-blur-md ring-1 ring-white/10 min-w-[7rem]">
            <p className="text-2xl font-bold tabular-nums">{cartCount}</p>
            <p className="text-xs text-slate-300 mt-0.5">In cart</p>
          </div>
        </div>
      </div>
    </section>
  );
}
