import serviceModule from '@/lib/specSheetService';
import pdfModule from '@/lib/pdfGenerator';
import tenantModule from '@/lib/tenant';

const { renderSheet } = serviceModule;
const { generatePDF } = pdfModule;
const { tenantFromHost } = tenantModule;

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  const { tenant, unitId } = await params;
  const url = new URL(request.url);
  const host = request.headers.get('host') || '';
  const hostname = host.split(':')[0];
  const hostTenant = tenantFromHost(hostname);
  const asTenant = url.searchParams.get('as') || hostTenant || null;

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
