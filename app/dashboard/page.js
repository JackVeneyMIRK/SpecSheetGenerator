import Link from 'next/link';
import serviceModule from '@/lib/specSheetService';

const { listTenants, listUnits } = serviceModule;

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const tenants = listTenants();
  const tenantData = tenants.map((tenant) => ({
    tenant,
    units: listUnits(tenant),
  }));

  return (
    <main className="shell">
      <div className="toolbar">
        <h1>Spec Sheet Dashboard</h1>
        <form method="post" action="/api/logout">
          <button className="button secondary" type="submit">
            Sign Out
          </button>
        </form>
      </div>

      <div className="card grid">
        {tenantData.map((group) => (
          <section className="tenant-block" key={group.tenant}>
            <h2>{group.tenant.toUpperCase()}</h2>
            <div className="unit-list">
              {group.units.map((unitId) => (
                <Link
                  className="pill"
                  key={`${group.tenant}-${unitId}`}
                  href={`/dashboard/${group.tenant}/${unitId}`}
                >
                  {unitId}
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
