'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { NavMenuIcon } from '@/components/customer/marketplace/NavMenuIcon';
import type { StoreCategory, StoreMenuItem } from '@/contexts/StoreConfigContext';
import { filterShopNavLinks } from '@/lib/store-nav';

function isCategoryLink(href: string) {
  return href.includes('category=') || (href.includes('/products') && !href.includes('/orders'));
}

function ChevronDown({ className = '' }: { className?: string }) {
  return (
    <svg className={`h-3 w-3 opacity-70 ${className}`} fill="currentColor" viewBox="0 0 20 20" aria-hidden>
      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
    </svg>
  );
}

const NAV_H = 'h-10';

export function StoreNavBar({
  categories,
  menuItems,
}: {
  categories: StoreCategory[];
  menuItems: StoreMenuItem[];
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category');
  const [megaOpen, setMegaOpen] = useState(false);
  const megaRef = useRef<HTMLDivElement>(null);

  const headerLinks = useMemo(
    () => menuItems.filter((m) => m.location === 'HEADER' || m.location === 'BOTH'),
    [menuItems]
  );

  const navLinks = useMemo(() => {
    const raw =
      headerLinks.length > 0
        ? headerLinks
        : categories.slice(0, 8).map((c) => ({
            id: c.id,
            label: c.name,
            href: `/customer/products?category=${c.id}`,
            sortOrder: c.sortOrder,
            location: 'HEADER',
          }));
    return filterShopNavLinks(raw);
  }, [headerLinks, categories]);

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) {
        setMegaOpen(false);
      }
    };
    if (megaOpen) {
      document.addEventListener('mousedown', onOutside);
      return () => document.removeEventListener('mousedown', onOutside);
    }
  }, [megaOpen]);

  useEffect(() => {
    setMegaOpen(false);
  }, [pathname]);

  const isLinkActive = (href: string) => {
    if (pathname === href) return true;
    if (!pathname.startsWith('/customer/products')) return false;
    try {
      const url = new URL(href, 'http://local');
      const cat = url.searchParams.get('category');
      if (cat) return activeCategory === cat;
      const q = url.searchParams.get('q');
      if (q) return searchParams.get('q') === q;
    } catch {
      /* ignore */
    }
    return false;
  };

  /** Exactly one blue tab: mega open → All Categories; else first matching nav link only. */
  const activeNavHref = megaOpen
    ? null
    : (navLinks.find((link) => isLinkActive(link.href))?.href ?? null);

  const allCategoriesActive =
    megaOpen ||
    (activeNavHref === null &&
      pathname.startsWith('/customer/products') &&
      !activeCategory &&
      !searchParams.get('q'));

  const navTabActive = (href: string) => activeNavHref === href;

  return (
    <nav
      className="hidden sm:block bg-white border-b border-slate-200"
      aria-label="Shop categories"
    >
      <div className={`mx-auto max-w-[1248px] flex items-center ${NAV_H} px-1`}>
        {/* Categories — same height as row, flush left */}
        <div className="relative shrink-0 h-full flex items-center" ref={megaRef}>
          <button
            type="button"
            onClick={() => setMegaOpen((o) => !o)}
            aria-expanded={megaOpen}
            aria-haspopup="true"
            className={`flex ${NAV_H} items-center gap-2 px-4 text-[13px] font-semibold transition-colors ${
              allCategoriesActive
                ? 'bg-[#2563eb] text-white hover:bg-[#1a5bb8]'
                : 'text-slate-600 hover:bg-slate-50 hover:text-[#2563eb]'
            }`}
          >
            <svg
              className={`h-4 w-4 shrink-0 ${allCategoriesActive ? 'text-white' : 'text-slate-500'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.25}
            >
              <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="whitespace-nowrap">All Categories</span>
            <ChevronDown
              className={`transition-transform ${megaOpen ? 'rotate-180' : ''} ${
                allCategoriesActive ? 'text-white opacity-90' : 'text-slate-400'
              }`}
            />
          </button>

          {megaOpen && (
            <div className="absolute left-0 top-full z-[60] w-[min(100vw-2rem,300px)] rounded-b-md border border-slate-200 bg-white shadow-xl">
              <div className="max-h-[min(70vh,380px)] overflow-y-auto py-1">
                <p className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Shop by category
                </p>
                <ul>
                  {categories.map((cat) => (
                    <li key={cat.id}>
                      <Link
                        href={`/customer/products?category=${cat.id}`}
                        onClick={() => setMegaOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-[#2563eb]"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-50 text-base border border-slate-100 overflow-hidden">
                          {cat.icon && (cat.icon.startsWith('/') || cat.icon.startsWith('http')) ? (
                            <img src={cat.icon} alt="" className="h-full w-full object-cover" />
                          ) : (
                            cat.icon || '🛍️'
                          )}
                        </span>
                        <span className="font-medium">{cat.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border-t border-slate-100 px-4 py-2 bg-slate-50">
                <Link
                  href="/customer/products"
                  onClick={() => setMegaOpen(false)}
                  className="text-sm font-semibold text-[#2563eb] hover:underline"
                >
                  Browse all products →
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-slate-200 shrink-0 mx-1" aria-hidden />

        {/* Shop links only — no duplicate Orders / Wishlist / Account */}
        <div className={`flex flex-1 items-center ${NAV_H} overflow-x-auto scrollbar-hide min-w-0`}>
          {navLinks.length === 0 ? (
            <Link
              href="/customer/products"
              className="px-4 text-[13px] font-medium text-slate-600 hover:text-[#2563eb]"
            >
              All products
            </Link>
          ) : (
            navLinks.map((link) => {
              const active = navTabActive(link.href);
              const showChevron = isCategoryLink(link.href);

              return (
                <Link
                  key={link.id}
                  href={link.href}
                  className={`group flex shrink-0 items-center gap-1.5 ${NAV_H} px-3.5 text-[13px] transition-colors ${
                    active
                      ? 'bg-[#2563eb] text-white font-semibold hover:bg-[#1a5bb8]'
                      : 'text-slate-600 font-medium hover:bg-slate-50 hover:text-[#2563eb]'
                  }`}
                >
                  <NavMenuIcon
                    label={link.label}
                    href={link.href}
                    className={`h-3.5 w-3.5 shrink-0 ${
                      active ? 'text-white' : 'text-slate-400 group-hover:text-[#2563eb]'
                    }`}
                  />
                  <span className="whitespace-nowrap">{link.label}</span>
                  {showChevron && (
                    <ChevronDown className={active ? 'text-white opacity-90' : 'text-slate-400'} />
                  )}
                </Link>
              );
            })
          )}
        </div>
      </div>
    </nav>
  );
}
