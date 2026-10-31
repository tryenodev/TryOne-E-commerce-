import {
  IconCart,
  IconDashboard,
  IconHeart,
  IconInvoice,
  IconOrders,
  IconShop,
  IconUser,
} from '@/components/customer/icons';

export const CUSTOMER_NAV = [
  { href: '/customer/dashboard', label: 'Home', icon: IconDashboard },
  { href: '/customer/products', label: 'Shop', icon: IconShop },
  { href: '/customer/cart', label: 'Cart', icon: IconCart, badgeKey: 'cart' as const },
  { href: '/customer/orders', label: 'Orders', icon: IconOrders },
  { href: '/customer/wishlist', label: 'Wishlist', icon: IconHeart },
  { href: '/customer/simple-invoice', label: 'Invoices', icon: IconInvoice },
  { href: '/customer/profile', label: 'Account', icon: IconUser },
];

export const CUSTOMER_MOBILE_NAV = CUSTOMER_NAV.slice(0, 5);
