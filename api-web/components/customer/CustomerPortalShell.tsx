'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { AccountMenu } from '@/components/customer/AccountMenu';
import { LoadingScreen } from '@/components/customer/LoadingScreen';
import { DeliveryStrip } from '@/components/customer/marketplace/DeliveryStrip';
import { StoreNavBar } from '@/components/customer/marketplace/StoreNavBar';
import {
  IconCart,
  IconDashboard,
  IconHeart,
  IconSearch,
  IconShop,
  IconUser,
} from '@/components/customer/icons';
import { useCart } from '@/contexts/CartContext';
import { useStoreConfig } from '@/contexts/StoreConfigContext';
import { UserRole } from '@/lib/enums';

function HeaderAction({
  href,
  label,
  icon: Icon,
  badge,
}: {
  href: string;
  label: string;
  icon: React.FC<{ className?: string }>;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      className="relative flex flex-col items-center justify-center min-w-[56px] px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
    >
      <Icon className="h-[22px] w-[22px]" />
      <span className="text-[10px] font-semibold mt-1 hidden lg:block leading-none tracking-wide uppercase opacity-90">
        {label}
      </span>
      {badge !== undefined && badge > 0 && (
        <span className="absolute top-0.5 right-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#fbbf24] px-1 text-[10px] font-bold text-[#2563eb] ring-2 ring-[#2563eb]">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </Link>
  );
}

export function CustomerPortalShell({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { getCartCount } = useCart();
  const cartCount = getCartCount();
  const { categories, menuItems } = useStoreConfig();
  const [searchQ, setSearchQ] = useState('');
  const [searchCategory, setSearchCategory] = useState('all');

  const footerLinks = useMemo(
    () => menuItems.filter((m) => m.location === 'FOOTER' || m.location === 'BOTH'),
    [menuItems]
  );

  const headerLinks = useMemo(
    () => menuItems.filter((m) => m.location === 'HEADER' || m.location === 'BOTH'),
    [menuItems]
  );

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    else if (
      status === 'authenticated' &&
      (session?.user as { role?: string })?.role !== UserRole.CUSTOMER
    ) {
      router.push('/403');
    }
  }, [status, session, router]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQ.trim();
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (searchCategory !== 'all') params.set('category', searchCategory);
    const qs = params.toString();
    router.push(qs ? `/customer/products?${qs}` : '/customer/products');
  };

  if (status === 'loading') return <LoadingScreen />;
  if (!session || (session.user as { role?: string })?.role !== UserRole.CUSTOMER) return null;

  const mobileNav = [
    { href: '/customer/dashboard', label: 'Home', Icon: IconDashboard },
    { href: '/customer/products', label: 'Shop', Icon: IconShop },
    { href: '/customer/wishlist', label: 'Wishlist', Icon: IconHeart },
    { href: '/customer/cart', label: 'Cart', Icon: IconCart, badge: cartCount },
    { href: '/customer/profile', label: 'Account', Icon: IconUser },
  ];

  return (
    <div className="customer-portal min-h-screen bg-[#f1f3f6]">
      <header className="sticky top-0 z-50 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
        <div className="bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] text-white">
          <div className="mx-auto flex max-w-[1248px] items-center gap-3 sm:gap-4 px-4 py-3 sm:px-5">
            <Link
              href="/customer/dashboard"
              className="shrink-0 flex flex-col pr-4 sm:pr-5 border-r border-white/25"
            >
              <span className="flex items-baseline gap-0.5 leading-none">
                <span className="text-[22px] sm:text-2xl font-extrabold tracking-tight text-white">Tryeno</span>
                <span className="text-[22px] sm:text-2xl font-extrabold tracking-tight text-[#fbbf24]">One</span>
              </span>
              <span className="hidden sm:block text-[8px] font-semibold text-white/70 uppercase tracking-[0.2em] mt-1">
                Online Shopping
              </span>
            </Link>

            <form onSubmit={handleSearch} className="flex-1 flex min-w-0 max-w-[680px] h-11 rounded-lg overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.12)] transition-shadow focus-within:shadow-[0_4px_16px_rgba(0,0,0,0.2)] focus-within:ring-2 focus-within:ring-white/40">
              <select
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
                className="hidden sm:block shrink-0 w-[120px] border-0 bg-white text-slate-700 text-xs px-2.5 focus:outline-none cursor-pointer font-medium"
                aria-label="Search category"
              >
                <option value="all">All</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <input
                type="search"
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Search for products, brands and more"
                className="flex-1 min-w-0 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none bg-white"
              />
              <button
                type="submit"
                className="shrink-0 w-12 sm:w-14 bg-[#fbbf24] hover:bg-[#f59e0b] flex items-center justify-center text-slate-900"
                aria-label="Search"
              >
                <IconSearch className="h-5 w-5" />
              </button>
            </form>

            <div className="flex items-center shrink-0 gap-0.5 sm:gap-1 pl-1 sm:pl-2">
              <AccountMenu
                name={session.user?.name ?? 'Customer'}
                email={session.user?.email}
              />
              <span className="hidden md:block w-px h-8 bg-white/25 mx-1" aria-hidden />
              <HeaderAction href="/customer/cart" label="Cart" icon={IconCart} badge={cartCount} />
              <HeaderAction href="/customer/wishlist" label="Wishlist" icon={IconHeart} />
            </div>
          </div>
        </div>

        <Suspense fallback={<div className="hidden sm:block h-10 bg-white border-b border-slate-200" />}>
          <StoreNavBar categories={categories} menuItems={menuItems} />
        </Suspense>

        <DeliveryStrip />
      </header>

      <main className="mx-auto max-w-[1248px] px-2 sm:px-3 py-3 sm:py-4 pb-20 lg:pb-6">
        {children}
      </main>

      <footer className="hidden lg:block bg-[#172337] text-white mt-6 rounded-t-lg overflow-hidden">
        <div className="mx-auto max-w-[1248px] px-6 py-10">
          <div className="grid grid-cols-4 gap-8 text-sm">
            <div>
              <p className="text-[#878787] font-semibold mb-4 text-xs uppercase tracking-wider">Shop</p>
              <ul className="space-y-2.5 text-[#e0e0e0]">
                {categories.slice(0, 5).map((cat) => (
                  <li key={cat.id}>
                    <Link href={`/customer/products?category=${cat.id}`} className="hover:text-white transition-colors">
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[#878787] font-semibold mb-4 text-xs uppercase tracking-wider">Quick links</p>
              <ul className="space-y-2.5 text-[#e0e0e0]">
                {(footerLinks.length > 0 ? footerLinks : headerLinks).slice(0, 6).map((link) => (
                  <li key={link.id}>
                    <Link href={link.href} className="hover:text-white transition-colors">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[#878787] font-semibold mb-4 text-xs uppercase tracking-wider">Account</p>
              <ul className="space-y-2.5 text-[#e0e0e0]">
                <li><Link href="/customer/orders" className="hover:text-white transition-colors">Orders</Link></li>
                <li><Link href="/customer/cart" className="hover:text-white transition-colors">Cart</Link></li>
                <li><Link href="/customer/profile" className="hover:text-white transition-colors">Profile</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-[#878787] font-semibold mb-4 text-xs uppercase tracking-wider">Contact</p>
              <p className="text-[#ccc] leading-relaxed text-sm">
                Tryeno One Store<br />
                Secure Razorpay payments<br />
                <a href="mailto:support@tryeno-one.com" className="text-[#fbbf24] hover:underline">
                  support@tryeno-one.com
                </a>
              </p>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-[#454d5e] flex flex-col sm:flex-row items-center justify-between gap-3 text-[#878787] text-sm">
            <span className="text-xl font-bold tracking-tight text-white">
              Tryeno<span className="text-[#fbbf24]">One</span>
            </span>
            <span>© {new Date().getFullYear()} Tryeno One. All rights reserved.</span>
          </div>
        </div>
      </footer>

      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-slate-200 shadow-[0_-2px_10px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom)]">
        <div className="flex justify-around items-stretch h-14">
          {mobileNav.map((item) => {
            const active =
              pathname === item.href ||
              (item.href === '/customer/products' && pathname.startsWith('/customer/products'));
            const Icon = item.Icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 ${
                  active ? 'text-[#2563eb]' : 'text-slate-500'
                }`}
              >
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#2563eb] rounded-full" />
                )}
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-semibold">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute top-1 right-[calc(50%-18px)] flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-[#2563eb] text-[9px] font-bold text-white px-1">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
