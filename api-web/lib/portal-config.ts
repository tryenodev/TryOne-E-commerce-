import { UserRole } from '@/lib/enums';

export type PortalRole = UserRole.CUSTOMER | UserRole.ADMIN | UserRole.STAFF;

export type PortalNavItem = {
  href: string;
  label: string;
  icon: string;
  badgeKey?: 'cart';
};

export const PORTAL_NAV: Record<PortalRole, PortalNavItem[]> = {
  [UserRole.CUSTOMER]: [
    { href: '/customer/dashboard', label: 'Dashboard', icon: '◉' },
    { href: '/customer/products', label: 'Shop', icon: '▣' },
    { href: '/customer/cart', label: 'Cart', icon: '🛒', badgeKey: 'cart' },
    { href: '/customer/orders', label: 'Orders', icon: '☰' },
    { href: '/customer/wishlist', label: 'Wishlist', icon: '♥' },
    { href: '/customer/simple-invoice', label: 'Invoice', icon: '₹' },
    { href: '/customer/profile', label: 'Profile', icon: '◎' },
  ],
  [UserRole.ADMIN]: [
    { href: '/admin/dashboard', label: 'Dashboard', icon: '◉' },
    { href: '/admin/analytics', label: 'Analytics', icon: '◫' },
    { href: '/admin/products', label: 'Products', icon: '▣' },
    { href: '/admin/categories', label: 'Categories', icon: '▤' },
    { href: '/admin/menu', label: 'Store Menu', icon: '☰' },
    { href: '/admin/orders', label: 'Orders', icon: '☰' },
    { href: '/admin/users', label: 'Users', icon: '◎' },
  ],
  [UserRole.STAFF]: [
    { href: '/staff/dashboard', label: 'Dashboard', icon: '◉' },
    { href: '/staff/orders', label: 'Orders', icon: '☰' },
    { href: '/staff/products', label: 'Inventory', icon: '▣' },
  ],
};

export const PORTAL_META: Record<
  PortalRole,
  {
    title: string;
    subtitle: string;
    activeNav: string;
    roleBadge: string;
    homePath: string;
  }
> = {
  [UserRole.CUSTOMER]: {
    title: 'Tryeno One',
    subtitle: 'Customer Portal',
    activeNav: 'bg-emerald-600 text-white shadow-sm',
    roleBadge: 'bg-emerald-500/20 text-emerald-300',
    homePath: '/customer/dashboard',
  },
  [UserRole.ADMIN]: {
    title: 'Tryeno One',
    subtitle: 'Admin Console',
    activeNav: 'bg-rose-600 text-white shadow-sm',
    roleBadge: 'bg-rose-500/20 text-rose-300',
    homePath: '/admin/dashboard',
  },
  [UserRole.STAFF]: {
    title: 'Tryeno One',
    subtitle: 'Staff Workspace',
    activeNav: 'bg-sky-600 text-white shadow-sm',
    roleBadge: 'bg-sky-500/20 text-sky-300',
    homePath: '/staff/dashboard',
  },
};

export function getPortalRoleFromPath(pathname: string): PortalRole | null {
  if (pathname.startsWith('/customer')) return UserRole.CUSTOMER;
  if (pathname.startsWith('/admin')) return UserRole.ADMIN;
  if (pathname.startsWith('/staff')) return UserRole.STAFF;
  return null;
}
