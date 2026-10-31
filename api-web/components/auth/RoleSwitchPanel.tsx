'use client';

import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

type RoleSwitchPanelProps = {
  compact?: boolean;
  dark?: boolean;
  currentRole?: 'CUSTOMER' | 'ADMIN' | 'STAFF';
};

const ROLES = [
  { key: 'admin', label: 'Admin', hint: 'Full console access', color: 'bg-rose-600 hover:bg-rose-700' },
  { key: 'staff', label: 'Staff', hint: 'Orders & inventory', color: 'bg-sky-600 hover:bg-sky-700' },
  { key: 'customer', label: 'Customer', hint: 'Shop & orders', color: 'bg-emerald-600 hover:bg-emerald-700' },
] as const;

export function RoleSwitchPanel({ compact = false, dark = false, currentRole }: RoleSwitchPanelProps) {
  const router = useRouter();

  const switchToRole = async (role: string) => {
    await signOut({ redirect: false });
    router.push(`/login?role=${role}`);
  };

  const otherRoles = ROLES.filter(
    (r) => r.key !== currentRole?.toLowerCase()
  );

  if (compact) {
    const signOutClass = dark
      ? 'rounded-lg border border-slate-600 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white'
      : 'rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50';

    return (
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/login' })}
          className={signOutClass}
        >
          Sign out
        </button>
        {otherRoles.map((r) => (
          <button
            key={r.key}
            type="button"
            onClick={() => switchToRole(r.key)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold text-white ${r.color}`}
          >
            {r.label} login
          </button>
        ))}
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900">Switch account</h2>
      <p className="mt-1 text-sm text-slate-500">
        Sign out and log in with a different role.
      </p>

      <button
        type="button"
        onClick={() => signOut({ callbackUrl: '/login' })}
        className="mt-4 w-full rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
      >
        Sign out
      </button>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
        {otherRoles.map((r) => (
          <button
            key={r.key}
            type="button"
            onClick={() => switchToRole(r.key)}
            className={`rounded-xl py-3 px-3 text-sm font-semibold text-white transition-colors ${r.color}`}
          >
            <span className="block">{r.label}</span>
            <span className="block text-[10px] font-normal opacity-90 mt-0.5">{r.hint}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
