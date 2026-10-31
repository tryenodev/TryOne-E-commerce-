'use client';

import Link from 'next/link';

const PINCODE = '110001';

function IconPin({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  );
}

function IconTruck({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9m0 0H6.375a1.125 1.125 0 00-1.125 1.125v3.75M15 10.5l3-3m0 0l3 3m-3-3v12"
      />
    </svg>
  );
}

function IconReceipt({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c1.01.005 1.587.023 2.927.08 1.13.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0118 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H9.375z"
      />
    </svg>
  );
}

export function DeliveryStrip() {
  return (
    <div className="store-delivery-strip border-b border-[#dbeafe]">
      <div className="mx-auto max-w-[1248px] w-full px-3 sm:px-5 py-2 sm:py-2.5">
        {/* Mobile: stacked highlights */}
        <div className="flex sm:hidden flex-col gap-2">
          <Link
            href="/customer/profile"
            className="store-delivery-pill store-delivery-pill--location w-full justify-center"
          >
            <IconPin className="h-4 w-4 shrink-0 text-[#2563eb]" />
            <span className="text-slate-600">Deliver to</span>
            <strong className="text-[#2563eb] font-bold tracking-wide">{PINCODE}</strong>
            <span className="text-[10px] font-semibold text-[#2563eb] ml-0.5">Change</span>
          </Link>
          <div className="flex gap-2">
            <div className="store-delivery-pill store-delivery-pill--offer flex-1 justify-center text-center">
              <IconTruck className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>
                Free delivery <strong className="text-emerald-700">₹499+</strong>
              </span>
            </div>
            <Link
              href="/customer/simple-invoice"
              className="store-delivery-pill store-delivery-pill--cta shrink-0 px-3"
            >
              <IconReceipt className="h-4 w-4" />
              <span className="sr-only sm:not-sr-only sm:inline">Pay</span>
            </Link>
          </div>
        </div>

        {/* Desktop: horizontal bar */}
        <div className="hidden sm:flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 min-w-0">
            <Link
              href="/customer/profile"
              className="store-delivery-pill store-delivery-pill--location group"
              title="Update delivery pincode in profile"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2563eb]/10 ring-2 ring-[#2563eb]/20 group-hover:ring-[#2563eb]/40 transition-all">
                <IconPin className="h-4 w-4 text-[#2563eb]" />
              </span>
              <span className="text-slate-600 text-xs sm:text-sm">Deliver to</span>
              <strong className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">{PINCODE}</strong>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#2563eb] opacity-0 group-hover:opacity-100 transition-opacity hidden md:inline">
                Change
              </span>
            </Link>

            <span className="store-delivery-divider" aria-hidden />

            <div className="store-delivery-pill store-delivery-pill--offer">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/15 ring-2 ring-emerald-500/25">
                <IconTruck className="h-4 w-4 text-emerald-600" />
              </span>
              <span className="text-xs sm:text-sm text-slate-700">
                <span className="font-semibold text-emerald-700">FREE</span> delivery on orders above{' '}
                <strong className="text-emerald-800 text-base font-bold">₹499</strong>
              </span>
            </div>
          </div>

          <Link href="/customer/simple-invoice" className="store-delivery-pill store-delivery-pill--cta shrink-0">
            <IconReceipt className="h-4 w-4" />
            <span>Pay invoice</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
