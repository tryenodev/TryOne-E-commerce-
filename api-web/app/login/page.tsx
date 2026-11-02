'use client';

import { signIn } from 'next-auth/react';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type { DemoLoginAccount } from '@/lib/demo-login-accounts';
import { DEMO_LOGIN_ACCOUNTS, QUICK_ROLE_LOGINS } from '@/lib/demo-login-accounts';
import { MarketingShell } from '@/components/MarketingShell';

const ROLE_BUTTON_STYLES: Record<string, string> = {
  ADMIN: 'bg-gradient-to-r from-fuchsia-600 to-purple-700 hover:from-fuchsia-700 hover:to-purple-800 shadow-fuchsia-500/25 ring-2 ring-fuchsia-400 ring-offset-2',
  STAFF: 'bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 shadow-sky-500/25 ring-2 ring-sky-400 ring-offset-2',
  CUSTOMER: 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 shadow-emerald-500/25 ring-2 ring-emerald-400 ring-offset-2',
};

const ROLE_BUTTON_DEFAULT: Record<string, string> = {
  ADMIN: 'bg-gradient-to-r from-fuchsia-600 to-purple-700 hover:from-fuchsia-700 hover:to-purple-800 shadow-fuchsia-500/25',
  STAFF: 'bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 shadow-sky-500/25',
  CUSTOMER: 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 shadow-emerald-500/25',
};

const ROLE_HINT: Record<string, string> = {
  admin: 'ADMIN',
  staff: 'STAFF',
  customer: 'CUSTOMER',
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const highlightRole = searchParams.get('role')?.toLowerCase() ?? '';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoSelectValue, setDemoSelectValue] = useState('');
  const demoAccounts = DEMO_LOGIN_ACCOUNTS;

  useEffect(() => {
    const mapped = ROLE_HINT[highlightRole];
    if (!mapped) return;
    const account = QUICK_ROLE_LOGINS.find((a) => a.role === mapped);
    if (account) {
      setEmail(account.email);
      setPassword(account.password);
    }
  }, [highlightRole]);

  const signInWithCredentials = async (loginEmail: string, loginPassword: string) => {
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email: loginEmail,
        password: loginPassword,
        redirect: false,
        callbackUrl: '/dashboard',
      });

      if (result?.error) {
        setLoading(false);
        console.error('[Login] Failed:', result.error);
        if (result.error === 'CredentialsSignin') {
          setError('Invalid email or password');
        } else {
          setError(`Login failed (${result.error}). Please try again.`);
        }
      } else if (result?.ok) {
        // Full page navigation ensures session cookies are recognized immediately by SessionProvider
        window.location.href = result.url || '/dashboard';
      } else {
        setLoading(false);
        setError('Login failed. Please try again.');
      }
    } catch (err: any) {
      setLoading(false);
      console.error('[Login] Error:', err);
      setError(err?.message || 'An unexpected error occurred during login');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signInWithCredentials(email, password);
  };

  const handleQuickRoleLogin = async (account: DemoLoginAccount) => {
    setEmail(account.email);
    setPassword(account.password);
    setDemoSelectValue(account.email);
    await signInWithCredentials(account.email, account.password);
  };

  const handleDemoSelect = (value: string) => {
    setDemoSelectValue(value);
    setError('');
    if (value === '') {
      setEmail('');
      setPassword('');
      return;
    }
    const account = demoAccounts.find((a) => a.email === value);
    if (account) {
      setEmail(account.email);
      setPassword(account.password);
    }
  };

  const highlightLabel =
    highlightRole === 'admin'
      ? 'Admin'
      : highlightRole === 'staff'
        ? 'Staff'
        : highlightRole === 'customer'
          ? 'Customer'
          : null;

  return (
    <MarketingShell
      showAuthLinks={false}
      navExtras={
        <Link href="/register" className="hover:text-slate-900">
          Create an account →
        </Link>
      }
    >
      <main className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="hidden lg:block">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
              Welcome back
            </span>
            <h1 className="mt-3 text-5xl font-extrabold tracking-tight text-slate-900">
              Sign in to <span className="text-slate-700">Tryeno One</span>
            </h1>
            <p className="mt-4 text-lg text-slate-600 max-w-md">
              Manage products, orders, customers and analytics — all from one place.
            </p>
            <ul className="mt-6 space-y-3 text-slate-700">
              {[
                'Three role-based dashboards (Admin / Staff / Customer)',
                'Real-time inventory & 7-stage order pipeline',
                'Web + Flutter mobile, one shared API',
              ].map((b) => (
                <li key={b} className="flex items-start">
                  <span className="mr-2 font-bold text-blue-600">✓</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-sm text-slate-500">
              Don’t have an account?{' '}
              <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-700">
                Create one →
              </Link>
            </p>
          </div>

          <div className="w-full max-w-md mx-auto">
            <div className="rounded-3xl bg-white border border-slate-200 shadow-2xl shadow-slate-900/10 overflow-hidden">
              <div className="px-7 py-6 bg-slate-900 text-white">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur text-xl">
                    🔐
                  </span>
                  <div>
                    <div className="font-semibold text-lg">Login to your account</div>
                    <div className="text-xs text-white/70">Use your Tryeno One credentials.</div>
                  </div>
                </div>
              </div>

              <div className="p-7">
                {highlightLabel && (
                  <div className="mb-4 rounded-xl bg-sky-50 border border-sky-200 px-3 py-2 text-sm text-sky-900">
                    You signed out — choose <strong>{highlightLabel}</strong> below or sign in manually.
                  </div>
                )}

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 mb-5">
                  <h3 className="text-sm font-semibold text-slate-900">Quick login by role</h3>
                  <p className="mt-1 text-xs text-slate-600">
                    One click — opens the right dashboard.
                  </p>
                  <div className="mt-3 grid grid-cols-1 gap-2">
                    {QUICK_ROLE_LOGINS.map((account) => {
                      const highlighted =
                        highlightRole === account.role.toLowerCase();
                      return (
                        <button
                          key={account.role}
                          type="button"
                          disabled={loading}
                          onClick={() => handleQuickRoleLogin(account)}
                          className={`w-full py-3 px-4 rounded-xl text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50 disabled:hover:translate-y-0 ${
                            highlighted
                              ? ROLE_BUTTON_STYLES[account.role]
                              : ROLE_BUTTON_DEFAULT[account.role]
                          }`}
                        >
                          {account.group === 'Admin' && '🛠️ '}
                          {account.group === 'Staff' && '🚚 '}
                          {account.group === 'Customer' && '🛍️ '}
                          Login as {account.group}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {process.env.NODE_ENV === 'development' && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 mb-5">
                    <h3 className="text-sm font-semibold text-slate-900">More demo accounts</h3>
                    <select
                      id="demo-credentials"
                      value={demoSelectValue}
                      onChange={(e) => handleDemoSelect(e.target.value)}
                      className="mt-3 w-full appearance-none rounded-xl border border-slate-300 bg-white py-2.5 px-3 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="">Custom — type below</option>
                      {demoAccounts.map((a) => (
                        <option key={a.email} value={a.email}>
                          {a.group} · {a.label} · {a.email} ({a.role})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        const v = e.target.value;
                        setEmail(v);
                        if (demoSelectValue && v !== demoSelectValue) setDemoSelectValue('');
                      }}
                      className="w-full px-3.5 py-3 border border-slate-300 rounded-xl text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                      placeholder="you@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setDemoSelectValue('');
                      }}
                      className="w-full px-3.5 py-3 border border-slate-300 rounded-xl text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                      required
                    />
                  </div>

                  {error && (
                    <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl text-base font-semibold text-white bg-slate-900 shadow-lg shadow-slate-900/20 hover:bg-slate-800 hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50 disabled:hover:translate-y-0 transition-all"
                  >
                    {loading ? 'Signing in…' : 'Sign in →'}
                  </button>
                </form>

                <p className="mt-6 text-sm text-center text-slate-600">
                  Don’t have an account?{' '}
                  <Link href="/register" className="font-semibold text-slate-700 hover:text-slate-900">
                    Register
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </MarketingShell>
  );
}
