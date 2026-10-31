import { PortalShell } from '@/components/portal/PortalShell';
import { UserRole } from '@/lib/enums';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PortalShell role={UserRole.ADMIN}>{children}</PortalShell>;
}
