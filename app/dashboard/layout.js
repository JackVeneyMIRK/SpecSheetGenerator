import serviceModule from '@/lib/specSheetService';
import Sidebar from '@/components/dashboard/Sidebar';

const { listTenantSummaries } = serviceModule;

export const dynamic = 'force-dynamic';

export default function DashboardLayout({ children }) {
  const tenants = listTenantSummaries();

  return (
    <div className="admin-layout">
      <Sidebar tenants={tenants} />
      <div className="admin-main">{children}</div>
    </div>
  );
}
