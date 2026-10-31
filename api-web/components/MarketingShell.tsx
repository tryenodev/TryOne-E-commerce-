import Link from 'next/link';
import type { ReactNode } from 'react';
import { SocialLinks } from '@/components/SocialLinks';

/**
 * Shared marketing chrome for public pages.
 */
export function MarketingShell({
  children,
  showAuthLinks = true,
  navExtras,
}: {
  children: ReactNode;
  showAuthLinks?: boolean;
  navExtras?: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top nav */}
      <nav className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 font-bold text-white">T</span>
            <span className="text-xl font-bold tracking-tight">Tryeno One</span>
          </Link>
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <SocialLinks className="hidden md:flex" />
            {navExtras}
            {showAuthLinks && (
              <>
                <Link href="/demo" className="hover:text-slate-900 hidden sm:inline">
                  Demo
                </Link>
                <Link href="/login" className="hover:text-slate-900">
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {children}

      <footer className="border-t border-slate-200 bg-white mt-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-slate-600">
          <div>© {new Date().getFullYear()} Tryeno One</div>
          <div className="flex flex-wrap items-center gap-4">
            <SocialLinks />
            <Link href="/demo" className="hover:text-slate-900">
              Demo
            </Link>
            <Link href="/login" className="hover:text-slate-900">
              Login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
