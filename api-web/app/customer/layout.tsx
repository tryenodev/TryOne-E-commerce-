import { CustomerPortalShell } from '@/components/customer/CustomerPortalShell';
import { ShopToastProvider } from '@/contexts/ShopToastContext';
import { StoreConfigProvider } from '@/contexts/StoreConfigContext';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-customer',
});

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${inter.variable} font-[family-name:var(--font-customer)]`}>
      <StoreConfigProvider>
        <ShopToastProvider>
          <CustomerPortalShell>{children}</CustomerPortalShell>
        </ShopToastProvider>
      </StoreConfigProvider>
    </div>
  );
}
