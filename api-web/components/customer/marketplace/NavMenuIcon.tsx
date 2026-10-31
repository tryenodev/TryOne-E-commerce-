import type { FC } from 'react';
import {
  IconHeart,
  IconInvoice,
  IconOrders,
  IconPackage,
  IconShop,
} from '@/components/customer/icons';

type IconProps = { className?: string };

export function NavMenuIcon({
  label,
  href,
  className = 'h-4 w-4',
}: {
  label: string;
  href: string;
  className?: string;
}) {
  const l = label.toLowerCase();
  const h = href.toLowerCase();
  let Icon: FC<IconProps> = IconShop;

  if (l.includes('fashion') || l.includes('cloth')) Icon = IconShop;
  else if (l.includes('electronic') || l.includes('mobile')) Icon = IconPackage;
  else if (l.includes('order')) Icon = IconOrders;
  else if (l.includes('wishlist')) Icon = IconHeart;
  else if (l.includes('invoice') || l.includes('pay')) Icon = IconInvoice;
  else if (h.includes('wishlist')) Icon = IconHeart;
  else if (h.includes('order')) Icon = IconOrders;

  return <Icon className={className} />;
}
