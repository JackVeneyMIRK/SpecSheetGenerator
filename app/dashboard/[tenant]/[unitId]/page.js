import Link from 'next/link';
import serviceModule from '@/lib/specSheetService';

const { buildData } = serviceModule;

export const dynamic = 'force-dynamic';

export default async function UnitPage({ params }) {
  const { tenant, unitId } = await params;
  const data = await buildData(tenant, unitId);

  return (
    <main className="shell">
      <div className="toolbar">
        <div>
          <h1>
            {tenant.toUpperCase()} / {unitId}
          </h1>
          <p>{data.unit.title || 'Untitled Unit'}</p>
        </div>
        <Link className="button secondary" href="/dashboard">
          Back
        </Link>
      </div>

      <div className="card">
        <p>
          <strong>Type:</strong> {data.unit.type || 'N/A'}
        </p>
        <p>
          <strong>Year:</strong> {data.unit.year || 'N/A'}
        </p>
        <p>
          <strong>Photos:</strong> {data.photos.length}
        </p>
        <p>
          <a href={`/preview/${tenant}/${unitId}`} target="_blank" rel="noopener noreferrer">
            Open HTML Preview
          </a>
          {' | '}
          <a href={`/pdf-view/${tenant}/${unitId}`} target="_blank" rel="noopener noreferrer">
            Open PDF Preview
          </a>
          {' | '}
          <a href={`/pdf/${tenant}/${unitId}`} target="_blank" rel="noopener noreferrer">
            Download PDF
          </a>
        </p>
      </div>
    </main>
  );
}
