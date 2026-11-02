import { CustomerPortalShell } from '@/components/customer/CustomerPortalShell';
import { ShopToastProvider } from '@/contexts/ShopToastContext';
import { StoreConfigProvider } from '@/contexts/StoreConfigContext';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="font-sans">
      <StoreConfigProvider>
        <ShopToastProvider>
          <CustomerPortalShell>{children}</CustomerPortalShell>
        </ShopToastProvider>
      </StoreConfigProvider>
    </div>
  );
}
