'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect, useMemo, useState } from 'react';
import { LoadingScreen } from '@/components/customer/LoadingScreen';
import { AlertBanner } from '@/components/customer/AlertBanner';
import { RoleSwitchPanel } from '@/components/auth/RoleSwitchPanel';
import { formatDate } from '@/lib/format';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  address: string | null;
  createdAt: string;
}

type Tab = 'profile' | 'address' | 'security';

const inputClass =
  'w-full rounded-sm border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#2563eb] focus:outline-none focus:ring-1 focus:ring-[#2563eb]';

const labelClass = 'block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5';

const QUICK_LINKS = [
  { href: '/customer/orders', label: 'My Orders', icon: '📦', desc: 'Track & manage orders' },
  { href: '/customer/wishlist', label: 'Wishlist', icon: '♡', desc: 'Saved items' },
  { href: '/customer/cart', label: 'Cart', icon: '🛒', desc: 'Checkout items' },
  { href: '/customer/products', label: 'Shop', icon: '🛍️', desc: 'Browse products' },
];

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orderCount, setOrderCount] = useState(0);
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [pincode, setPincode] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/user/profile').then((r) => r.json()),
      fetch('/api/orders').then((r) => r.json()),
    ])
      .then(([profileData, ordersData]) => {
        if (profileData.user) {
          setProfile(profileData.user);
          setName(profileData.user.name);
          setPhone(profileData.user.phone || '');
          parseAddress(profileData.user.address || '');
        }
        setOrderCount((ordersData.orders ?? []).length);
      })
      .finally(() => setLoading(false));
  }, []);

  const parseAddress = (raw: string) => {
    if (!raw.trim()) return;
    const parts = raw.split('|').map((p) => p.trim());
    if (parts.length >= 4) {
      setAddressLine(parts[0]);
      setCity(parts[1]);
      setStateName(parts[2]);
      setPincode(parts[3].replace(/\D/g, '').slice(0, 6));
    } else {
      setAddressLine(raw);
    }
  };

  const composedAddress = useMemo(() => {
    const parts = [addressLine.trim(), city.trim(), stateName.trim(), pincode.trim()].filter(Boolean);
    return parts.length ? parts.join(' | ') : '';
  }, [addressLine, city, stateName, pincode]);

  const profileComplete = useMemo(() => {
    let score = 0;
    if (name.trim()) score += 25;
    if (phone.length === 10) score += 25;
    if (addressLine.trim()) score += 25;
    if (pincode.length === 6) score += 25;
    return score;
  }, [name, phone, addressLine, pincode]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (phone && !/^\d{10}$/.test(phone)) {
      setError('Phone must be exactly 10 digits');
      return;
    }
    if (pincode && pincode.length !== 6) {
      setError('Pincode must be 6 digits');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, address: composedAddress }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Profile updated successfully');
        setProfile((prev) => (prev ? { ...prev, ...data.user } : data.user));
      } else {
        setError(data.error || 'Failed to update profile');
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 5) {
      setError('Password must be at least 5 characters');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Password changed successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setActiveTab('security');
      } else {
        setError(data.error || 'Failed to change password');
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingScreen message="Loading your account..." />;
  }

  const displayName = profile?.name || session?.user?.name || 'Customer';
  const displayEmail = profile?.email || session?.user?.email || '';

  const tabs: { id: Tab; label: string }[] = [
    { id: 'profile', label: 'Personal Info' },
    { id: 'address', label: 'Manage Addresses' },
    { id: 'security', label: 'Login & Security' },
  ];

  return (
    <div className="space-y-3">
      {/* Account header */}
      <div className="store-panel overflow-hidden">
        <div className="bg-[#2563eb] px-4 sm:px-6 py-5 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white text-[#2563eb] text-2xl font-bold shadow-md">
              {getInitials(displayName) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-semibold truncate">{displayName}</h1>
              <p className="text-sm text-white/90 truncate">{displayEmail}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1 rounded-sm bg-white/20 px-2 py-0.5 font-medium">
                  ✓ Verified customer
                </span>
                {profile?.createdAt && (
                  <span className="text-white/80">
                    Member since {formatDate(profile.createdAt)}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-4 sm:gap-6 text-center">
              <div>
                <p className="text-2xl font-bold">{orderCount}</p>
                <p className="text-xs text-white/80">Orders</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{profileComplete}%</p>
                <p className="text-xs text-white/80">Profile</p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile completion bar */}
        <div className="px-4 sm:px-6 py-3 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-medium text-slate-700">Complete your profile for faster checkout</span>
            <span className="font-semibold text-[#2563eb]">{profileComplete}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#2563eb] transition-all duration-500"
              style={{ width: `${profileComplete}%` }}
            />
          </div>
        </div>
      </div>

      {error && <AlertBanner variant="error" message={error} onDismiss={() => setError('')} />}
      {success && (
        <AlertBanner variant="success" message={success} onDismiss={() => setSuccess('')} />
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {QUICK_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="store-panel p-4 hover:shadow-md transition-shadow group"
          >
            <span className="text-xl" aria-hidden>{link.icon}</span>
            <p className="mt-1 text-sm font-semibold text-slate-800 group-hover:text-[#2563eb]">
              {link.label}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">{link.desc}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Sidebar tabs — desktop */}
        <aside className="hidden lg:block lg:col-span-3">
          <nav className="store-panel overflow-hidden sticky top-28">
            <p className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide border-b border-slate-100">
              Account settings
            </p>
            <ul>
              {tabs.map((tab) => (
                <li key={tab.id}>
                  <button
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-4 py-3 text-sm font-medium border-l-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-[#2563eb] bg-blue-50/80 text-[#2563eb]'
                        : 'border-transparent text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Mobile tabs */}
        <div className="lg:hidden col-span-full flex gap-1 overflow-x-auto scrollbar-hide store-panel p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 px-4 py-2 text-xs font-semibold rounded-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#2563eb] text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main content */}
        <div className="lg:col-span-9 space-y-3">
          {(activeTab === 'profile' || activeTab === 'address') && (
            <section className="store-panel p-4 sm:p-6">
              <h2 className="text-base font-semibold text-slate-800 border-b border-slate-100 pb-3 mb-4">
                {activeTab === 'profile' ? 'Personal information' : 'Delivery address'}
              </h2>

              <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-xl">
                {activeTab === 'profile' && (
                  <>
                    <div>
                      <label className={labelClass}>Email address</label>
                      <input
                        type="email"
                        value={displayEmail}
                        disabled
                        className={`${inputClass} bg-slate-50 text-slate-500 cursor-not-allowed`}
                      />
                      <p className="mt-1 text-[11px] text-slate-500">Email cannot be changed</p>
                    </div>
                    <div>
                      <label htmlFor="name" className={labelClass}>
                        Full name <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className={inputClass}
                        placeholder="As on your ID"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className={labelClass}>Mobile number</label>
                      <div className="flex">
                        <span className="inline-flex items-center rounded-l-sm border border-r-0 border-slate-200 bg-slate-50 px-3 text-sm text-slate-600">
                          +91
                        </span>
                        <input
                          id="phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          maxLength={10}
                          className={`${inputClass} rounded-l-none`}
                          placeholder="10 digit mobile"
                        />
                      </div>
                      <p className="mt-1 text-[11px] text-slate-500">
                        Used for order updates &amp; delivery calls
                      </p>
                    </div>
                  </>
                )}

                {activeTab === 'address' && (
                  <>
                    <div>
                      <label htmlFor="addressLine" className={labelClass}>
                        House no. / Building / Street
                      </label>
                      <textarea
                        id="addressLine"
                        value={addressLine}
                        onChange={(e) => setAddressLine(e.target.value)}
                        rows={2}
                        className={inputClass}
                        placeholder="Flat 402, Green Heights, MG Road"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="city" className={labelClass}>City</label>
                        <input
                          id="city"
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className={inputClass}
                          placeholder="Mumbai"
                        />
                      </div>
                      <div>
                        <label htmlFor="stateName" className={labelClass}>State</label>
                        <input
                          id="stateName"
                          type="text"
                          value={stateName}
                          onChange={(e) => setStateName(e.target.value)}
                          className={inputClass}
                          placeholder="Maharashtra"
                        />
                      </div>
                    </div>
                    <div className="max-w-[200px]">
                      <label htmlFor="pincode" className={labelClass}>Pincode</label>
                      <input
                        id="pincode"
                        type="text"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        maxLength={6}
                        className={inputClass}
                        placeholder="110001"
                      />
                    </div>
                    <div className="rounded-sm bg-blue-50 border border-blue-100 px-3 py-2 text-xs text-slate-600">
                      📍 This address will be used as your default delivery location at checkout.
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-sm bg-[#fb641b] hover:bg-[#e85a17] px-8 py-2.5 text-sm font-semibold text-white disabled:opacity-60 transition-colors"
                >
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
              </form>
            </section>
          )}

          {activeTab === 'security' && (
            <section className="store-panel p-4 sm:p-6">
              <h2 className="text-base font-semibold text-slate-800 border-b border-slate-100 pb-3 mb-4">
                Login &amp; security
              </h2>
              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                <div>
                  <label className={labelClass}>Current password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPw ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className={`${inputClass} pr-10`}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#2563eb]"
                    >
                      {showCurrentPw ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>New password</label>
                  <div className="relative">
                    <input
                      type={showNewPw ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={`${inputClass} pr-10`}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#2563eb]"
                    >
                      {showNewPw ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">Minimum 5 characters</p>
                </div>
                <div>
                  <label className={labelClass}>Confirm new password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={inputClass}
                    autoComplete="new-password"
                  />
                </div>
                <button
                  type="submit"
                  disabled={saving || !currentPassword || !newPassword}
                  className="rounded-sm border border-[#2563eb] text-[#2563eb] hover:bg-[#2563eb] hover:text-white px-8 py-2.5 text-sm font-semibold disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Updating...' : 'Update password'}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-slate-100">
                <h3 className="text-sm font-semibold text-slate-800 mb-2">Account tips</h3>
                <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                  <li>Use a strong password you do not use on other sites</li>
                  <li>Keep your mobile number updated for delivery OTPs</li>
                  <li>Never share your login credentials with anyone</li>
                </ul>
              </div>
            </section>
          )}

          {/* Help card */}
          <section className="store-panel p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Need help with your account?</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Contact support at support@tryeno-one.com
              </p>
            </div>
            <Link
              href="/customer/orders"
              className="shrink-0 text-center rounded-sm bg-[#2563eb] hover:bg-[#1a5bb8] text-white text-sm font-semibold px-5 py-2 transition-colors"
            >
              View my orders
            </Link>
          </section>
        </div>
      </div>

      <RoleSwitchPanel currentRole="CUSTOMER" />
    </div>
  );
}
