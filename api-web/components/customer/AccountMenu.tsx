'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';
import {
  IconCart,
  IconHeart,
  IconLogout,
  IconOrders,
  IconShop,
  IconUser,
} from '@/components/customer/icons';

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
}

const MENU_ITEMS = [
  { href: '/customer/profile', label: 'My Profile', icon: IconUser },
  { href: '/customer/orders', label: 'My Orders', icon: IconOrders },
  { href: '/customer/wishlist', label: 'Wishlist', icon: IconHeart },
  { href: '/customer/cart', label: 'My Cart', icon: IconCart },
];

export function AccountMenu({
  name,
  email,
}: {
  name: string;
  email?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const firstName = name.split(' ')[0] ?? 'User';

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) {
      document.addEventListener('mousedown', onOutside);
      return () => document.removeEventListener('mousedown', onOutside);
    }
  }, [open]);

  return (
    <div className="relative hidden md:block" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2.5 rounded-sm px-2 sm:px-3 py-2 hover:bg-white/10 transition-colors text-left min-w-0 max-w-[160px]"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#2563eb] text-xs font-bold shadow-md ring-2 ring-white/30">
          {getInitials(name) || 'U'}
        </span>
        <span className="min-w-0 hidden lg:block">
          <span className="block text-[10px] font-medium text-white/80 leading-none tracking-wide">Hello</span>
          <span className="flex items-center gap-1 text-sm font-bold leading-tight truncate mt-0.5">
            {firstName}
            <svg
              className={`h-3.5 w-3.5 shrink-0 text-white/90 transition-transform ${open ? 'rotate-180' : ''}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </span>
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1.5 w-56 rounded-md border border-slate-200 bg-white shadow-xl z-[70] overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/80">
            <p className="text-sm font-semibold text-slate-900 truncate">{name}</p>
            {email && <p className="text-xs text-slate-500 truncate mt-0.5">{email}</p>}
          </div>
          <ul className="py-1">
            {MENU_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-[#2563eb] transition-colors"
                >
                  <item.icon className="h-4 w-4 text-slate-400" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="border-t border-slate-100 py-1">
            <Link
              href="/customer/products"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-[#2563eb]"
            >
              <IconShop className="h-4 w-4 text-slate-400" />
              Continue shopping
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={() => signOut({ callbackUrl: '/login?role=customer' })}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <IconLogout className="h-4 w-4 text-slate-400" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
