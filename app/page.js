import Link from 'next/link';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import serviceModule from '@/lib/specSheetService';
import specRefModule from '@/lib/specRef';

const { listTenants, listUnits } = serviceModule;
const { encodeSpecRef } = specRefModule;

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const headerStore = await headers();
  const host = (headerStore.get('host') || '').toLowerCase();
  const hostname = host.split(':')[0];
  if (hostname === 'localhost') redirect('/dashboard');

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
                    {(() => {
                      const spec = encodeSpecRef(tenant, uid);
                      return (
                        <>
                    <strong>{uid}</strong>&nbsp;|&nbsp;
                    <a href={`/preview/${spec}`}>HTML</a>&nbsp;|&nbsp;
                    <a href={`/pdf-view/${spec}`} target="_blank" rel="noopener noreferrer">
                      PDF Preview
                    </a>
                    &nbsp;|&nbsp;
                    <a href={`/pdf/${spec}`}>PDF</a>
                        </>
                      );
                    })()}
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
