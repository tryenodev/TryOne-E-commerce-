export type CustomerNavItem = {
  href: string;
  label: string;
  icon: string;
  badgeKey?: 'cart';
};

export const CUSTOMER_NAV: CustomerNavItem[] = [
  { href: '/customer/dashboard', label: 'Dashboard', icon: '◉' },
  { href: '/customer/products', label: 'Shop', icon: '▣' },
  { href: '/customer/cart', label: 'Cart', icon: '🛒', badgeKey: 'cart' },
  { href: '/customer/orders', label: 'Orders', icon: '☰' },
  { href: '/customer/wishlist', label: 'Wishlist', icon: '♥' },
  { href: '/customer/simple-invoice', label: 'Invoice', icon: '₹' },
  { href: '/customer/profile', label: 'Profile', icon: '◎' },
];
