import serviceModule from '@/lib/specSheetService';
import pdfModule from '@/lib/pdfGenerator';
import tenantModule from '@/lib/tenant';
import specRefModule from '@/lib/specRef';

const { renderSheet } = serviceModule;
const { generatePDF } = pdfModule;
const { tenantFromHost } = tenantModule;
const { decodeSpecRef } = specRefModule;

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  const { spec } = await params;
  const decoded = decodeSpecRef(spec);
  if (!decoded) return new Response('Not found', { status: 404 });

  const { tenant, unitId } = decoded;
  const url = new URL(request.url);
  const host = request.headers.get('host') || '';
  const hostname = host.split(':')[0];
  const hostTenant = tenantFromHost(hostname);
  const asTenant = url.searchParams.get('as') || hostTenant || tenant;

  try {
    const html = await renderSheet(tenant, unitId, asTenant);
    const pdf = await generatePDF(html);
    return new Response(pdf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${unitId}.pdf"`,
      },
    });
  } catch (error) {
    const status = error?.status || 500;
    console.error('Failed to generate inline PDF', {
      tenant,
      unitId,
      asTenant,
      error,
    });
    const message =
      process.env.NODE_ENV !== 'production'
        ? `Error: ${error?.message || 'Unable to generate PDF'}`
        : 'Error: Unable to generate PDF';
    return new Response(message, { status });
  }
}
