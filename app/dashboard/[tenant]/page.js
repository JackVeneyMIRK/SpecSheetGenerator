import Link from 'next/link';
import serviceModule from '@/lib/specSheetService';
import specRefModule from '@/lib/specRef';

const { getTenantMeta, buildData } = serviceModule;
const { encodeSpecRef } = specRefModule;

export const dynamic = 'force-dynamic';

export default async function TenantDashboardPage({ params }) {
  const { tenant } = await params;
  const meta = getTenantMeta(tenant);

  const units = await Promise.all(
    meta.units.map(async (unitId) => {
      try {
        const data = await buildData(tenant, unitId);
        return {
          unitId,
          title: data.unit.title || 'Untitled Unit',
          year: data.unit.year || 'N/A',
          type: data.unit.type || 'N/A',
          photos: data.photos.length,
          spec: encodeSpecRef(tenant, unitId),
        };
      } catch {
        return {
          unitId,
          title: 'Unable to load unit data',
          year: 'N/A',
          type: 'N/A',
          photos: 0,
          spec: encodeSpecRef(tenant, unitId),
        };
      }
    })
  );

  return (
    <main className="admin-page">
      <header className="admin-header">
        <h2>{meta.companyName}</h2>
        <p>{meta.tenant.toUpperCase()}</p>
      </header>

      <section className="overview-grid">
        {units.map((unit) => (
          <article className="overview-card" key={unit.unitId}>
            <div className="overview-card-top">
              <h3>{unit.unitId}</h3>
            </div>
            <p className="unit-title">{unit.title}</p>
            <p className="unit-meta">
              <strong>{unit.year}</strong> • {unit.type}
            </p>
            <div className="unit-actions">
              <Link className="button ghost" href={`/dashboard/${tenant}/${unit.unitId}`}>
                Manage
              </Link>
              <a className="button ghost" href={`/preview/${unit.spec}`} target="_blank" rel="noopener noreferrer">
                HTML
              </a>
              <a className="button ghost" href={`/pdf-view/${unit.spec}`} target="_blank" rel="noopener noreferrer">
                PDF View
              </a>
              <a className="button" href={`/pdf/${unit.spec}`} target="_blank" rel="noopener noreferrer">
                PDF
              </a>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
