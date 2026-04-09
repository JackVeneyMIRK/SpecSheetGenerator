import Link from 'next/link';
import serviceModule from '@/lib/specSheetService';

const { listTenants, listUnits } = serviceModule;

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const tenants = listTenants();
  const items = tenants.map((tenant) => ({ tenant, units: listUnits(tenant) }));

  return (
    <main className="shell">
      <div className="toolbar">
        <div>
          <h1>Spec Sheet Generator</h1>
          <p>On-demand PDF spec sheets for equipment listings.</p>
        </div>
        <Link className="button secondary" href="/dashboard">
          Dashboard
        </Link>
      </div>

      <div className="card grid">
        {items.map(({ tenant, units }) => (
          <section className="tenant-block" key={tenant}>
            <h2>{tenant.toUpperCase()}</h2>
            {units.length === 0 ? (
              <p>No units found. Add folders in config/{tenant}/units.</p>
            ) : (
              <div className="unit-list">
                {units.map((uid) => (
                  <div className="pill" key={`${tenant}-${uid}`}>
                    <strong>{uid}</strong>&nbsp;|&nbsp;
                    <a href={`/preview/${tenant}/${uid}`}>HTML</a>&nbsp;|&nbsp;
                    <a href={`/pdf-view/${tenant}/${uid}`} target="_blank" rel="noopener noreferrer">
                      PDF Preview
                    </a>
                    &nbsp;|&nbsp;
                    <a href={`/pdf/${tenant}/${uid}`}>PDF</a>
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </main>
  );
}
