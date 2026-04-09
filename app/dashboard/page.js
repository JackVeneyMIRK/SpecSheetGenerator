import Link from 'next/link';
import serviceModule from '@/lib/specSheetService';

const { listTenantSummaries } = serviceModule;

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const tenants = listTenantSummaries();

  return (
    <main className="admin-page">
      <header className="admin-header">
        <h2>Global Overview</h2>
        <p>Select a tenant workspace</p>
      </header>

      <section className="overview-grid">
        {tenants.map((tenant) => (
          <article key={tenant.tenant} className="overview-card">
            <div className="overview-card-top">
              <div>
                <p className="tenant-label">{tenant.tenant.toUpperCase()}</p>
                <h3>{tenant.companyName}</h3>
              </div>
            </div>

            <div className="unit-actions">
              <Link className="button" href={`/dashboard/${tenant.tenant}`}>
                Open Tenant
              </Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
