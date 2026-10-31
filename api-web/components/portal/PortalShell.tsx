'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { SocialLinks } from '@/components/SocialLinks';
import { RoleSwitchPanel } from '@/components/auth/RoleSwitchPanel';
import { LoadingScreen } from '@/components/customer/LoadingScreen';
import { useCart } from '@/contexts/CartContext';
import { UserRole } from '@/lib/enums';
import { PORTAL_META, PORTAL_NAV, type PortalRole } from '@/lib/portal-config';

function NavLink({
  href,
  label,
  icon,
  active,
  activeClass,
  badge,
}: {
  href: string;
  label: string;
  icon: string;
  active: boolean;
  activeClass: string;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
        active
          ? activeClass
          : 'text-slate-300 hover:bg-slate-800 hover:text-white hover:translate-x-0.5'
      }`}
    >
      {active && (
        <span
          className="absolute -left-4 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-white/80"
          aria-hidden
        />
      )}
      <span className="w-5 text-center text-base leading-none" aria-hidden>
        {icon}
      </span>
      <span className="flex-1">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="min-w-[1.25rem] rounded-full bg-white/20 px-1.5 py-0.5 text-center text-xs font-bold text-white">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </Link>
  );
}

export function PortalShell({
  role,
  children,
}: {
  role: PortalRole;
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const meta = PORTAL_META[role];
  const nav = PORTAL_NAV[role];
  const { getCartCount } = useCart();
  const cartCount = role === UserRole.CUSTOMER ? getCartCount() : 0;

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (
      status === 'authenticated' &&
      (session?.user as { role?: string })?.role !== role
    ) {
      router.push('/403');
    }
  }, [status, session, router, role]);

  if (status === 'loading') {
    return <LoadingScreen />;
  }

  if (!session || (session.user as { role?: string })?.role !== role) {
    return null;
  }

  const firstName = session.user?.name?.split(' ')[0] ?? 'User';
  const mobileNav = nav.slice(0, 5);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="lg:flex">
        <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col bg-slate-900 text-white">
          <div className="flex h-16 items-center gap-2 border-b border-slate-800 px-5">
            <Link href={meta.homePath} className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold shadow-lg shadow-blue-500/20">
                T
              </span>
              <div>
                <p className="font-bold leading-tight">{meta.title}</p>
                <p className="text-[10px] uppercase tracking-widest text-slate-400">
                  {meta.subtitle}
                </p>
              </div>
            </Link>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {nav.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                active={pathname === item.href}
                activeClass={meta.activeNav}
                badge={item.badgeKey === 'cart' ? cartCount : undefined}
              />
            ))}
          </nav>

          <div className="space-y-4 border-t border-slate-800 p-4">
            <div className="rounded-xl bg-slate-800/80 px-3 py-3">
              <p className="text-xs text-slate-400">Signed in as</p>
              <p className="truncate text-sm font-semibold">{session.user?.name}</p>
              <span
                className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${meta.roleBadge}`}
              >
                {role}
              </span>
            </div>
            <SocialLinks iconButtonClassName="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors" />
            <div className="pt-1">
              <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2 px-1">Switch role</p>
              <RoleSwitchPanel
                compact
                dark
                currentRole={role as 'ADMIN' | 'STAFF' | 'CUSTOMER'}
              />
            </div>
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col lg:pl-64">
          <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 shadow-sm shadow-slate-900/[0.03] backdrop-blur-xl">
            <div className="flex h-14 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
              <div className="lg:hidden flex items-center gap-2">
                <Link href={meta.homePath} className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white shadow-sm">
                  T
                </Link>
                <span className="text-sm font-bold text-slate-900">{meta.subtitle}</span>
              </div>
              <div className="hidden lg:flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-[11px] font-bold text-white">
                  {firstName.charAt(0).toUpperCase()}
                </span>
                <p className="text-sm text-slate-600">
                  Hello, <span className="font-semibold text-slate-900">{firstName}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <SocialLinks className="hidden sm:flex" />
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="lg:hidden rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Logout
                </button>
                {role === UserRole.CUSTOMER && (
                  <Link
                    href="/customer/cart"
                    className="relative rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 lg:hidden"
                  >
                    Cart
                    {cartCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-bold text-white">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                )}
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>

          <footer className="border-t border-slate-200 bg-white px-4 py-4 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} Tryeno One · {meta.subtitle}
          </footer>

          <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 border-t border-slate-200/80 bg-white/90 backdrop-blur-xl shadow-[0_-2px_12px_rgba(15,23,42,0.06)]">
            <div className="flex justify-around py-2">
              {mobileNav.map((item) => {
                const active = pathname === item.href;
                const badge = item.badgeKey === 'cart' ? cartCount : 0;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex flex-col items-center gap-0.5 rounded-lg px-2.5 py-1 text-[10px] font-medium transition-colors ${
                      active
                        ? 'text-blue-700 bg-blue-50'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <span className="relative text-lg leading-none">
                      {item.icon}
                      {badge > 0 && (
                        <span className="absolute -right-2 -top-1 flex h-3.5 min-w-[0.875rem] items-center justify-center rounded-full bg-emerald-600 text-[8px] font-bold text-white">
                          {badge}
                        </span>
                      )}
                    </span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
          <div className="h-16 lg:hidden" aria-hidden />
        </div>
      </div>
    </div>
  );
}
