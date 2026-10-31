import { PortalShell } from '@/components/portal/PortalShell';
import { UserRole } from '@/lib/enums';

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PortalShell role={UserRole.STAFF}>{children}</PortalShell>;
}
