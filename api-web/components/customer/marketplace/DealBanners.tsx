'use client';

import Link from 'next/link';

const BANNERS = [
  {
    id: '1',
    title: 'Mega Festival Sale',
    subtitle: 'Up to 70% off · Electronics & more',
    href: '/customer/products',
    gradient: 'from-[#2563eb] via-[#1a5bb8] to-[#0f3d7a]',
    accent: 'bg-[#fbbf24] text-[#1a1a1a]',
  },
  {
    id: '2',
    title: 'Budget Bazaar',
    subtitle: 'Lowest prices · Free delivery',
    href: '/customer/products',
    gradient: 'from-[#9f2089] via-[#7a1869] to-[#580e39]',
    accent: 'bg-white/20 text-white backdrop-blur-sm',
  },
  {
    id: '3',
    title: 'Express Deals',
    subtitle: 'Fast delivery · Top picks',
    href: '/customer/products',
    gradient: 'from-[#232f3e] via-[#37475a] to-[#131921]',
    accent: 'bg-[#ff9900] text-[#131921]',
  },
];

export function DealBanners() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 mb-3">
      {BANNERS.map((banner) => (
        <Link
          key={banner.id}
          href={banner.href}
          className={`relative overflow-hidden rounded-xl bg-gradient-to-r ${banner.gradient} p-4 sm:p-5 min-h-[88px] flex flex-col justify-center shadow-md hover:shadow-lg transition-shadow group`}
        >
          <span
            className={`inline-flex w-fit rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide mb-2 ${banner.accent}`}
          >
            Limited time
          </span>
          <h3 className="text-base sm:text-lg font-bold text-white leading-tight group-hover:underline">
            {banner.title}
          </h3>
          <p className="text-xs text-white/85 mt-0.5">{banner.subtitle}</p>
        </Link>
      ))}
    </div>
  );
}
