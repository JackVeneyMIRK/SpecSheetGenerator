import Link from 'next/link';
import serviceModule from '@/lib/specSheetService';
import specRefModule from '@/lib/specRef';

const { buildData } = serviceModule;
const { encodeSpecRef } = specRefModule;

export const dynamic = 'force-dynamic';

export default async function UnitPage({ params }) {
  const { tenant, unitId } = await params;
  const spec = encodeSpecRef(tenant, unitId);
  const data = await buildData(tenant, unitId);

  return (
    <main className="admin-page">
      <header className="admin-header">
        <h2>{unitId}</h2>
        <p>{tenant.toUpperCase()}</p>
      </header>

      <section className="unit-card-v2">
        <div className="unit-card-head">
          <h3>{data.unit.title || 'Untitled Unit'}</h3>
          <span className="tenant-count">{data.photos.length} photos</span>
        </div>
        <p className="unit-meta mt">
          <strong>Type:</strong> {data.unit.type || 'N/A'}
        </p>
        <p className="unit-meta">
          <strong>Year:</strong> {data.unit.year || 'N/A'}
        </p>
        <div className="unit-actions">
          <Link className="button secondary" href={`/dashboard/${tenant}`}>
            Back
          </Link>
          <a className="button ghost" href={`/preview/${spec}`} target="_blank" rel="noopener noreferrer">
            Open HTML Preview
          </a>
          <a className="button ghost" href={`/pdf-view/${spec}`} target="_blank" rel="noopener noreferrer">
            Open PDF Preview
          </a>
          <a className="button" href={`/pdf/${spec}`} target="_blank" rel="noopener noreferrer">
            Download PDF
          </a>
        </div>
      </section>
    </main>
  );
}
