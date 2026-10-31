/** Filter admin menu items shown in the secondary nav (avoid duplicating header actions). */

type NavLink = { label: string; href: string };

const UTILITY_PATH_PREFIXES = [
  '/customer/wishlist',
  '/customer/orders',
  '/customer/cart',
  '/customer/profile',
  '/customer/simple-invoice',
];

export function isUtilityNavLink(link: NavLink): boolean {
  const path = link.href.split('?')[0].toLowerCase();
  const label = link.label.toLowerCase().trim();

  if (UTILITY_PATH_PREFIXES.some((p) => path === p || path.startsWith(p + '/'))) {
    return true;
  }
  if (label.includes('wishlist')) return true;
  if (label.includes('my order') || label === 'orders') return true;
  if (label.includes('cart') || label.includes('account') || label.includes('profile')) return true;
  if (label.includes('pay invoice') || label.includes('invoice')) return true;

  return false;
}

export function filterShopNavLinks<T extends NavLink>(links: T[]): T[] {
  return links.filter((link) => !isUtilityNavLink(link));
}
