import serviceModule from '@/lib/specSheetService';
import pdfModule from '@/lib/pdfGenerator';
import tenantModule from '@/lib/tenant';

const { renderSheet } = serviceModule;
const { generatePDF } = pdfModule;
const { tenantFromHost } = tenantModule;

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  const { unitId } = await params;
  const url = new URL(request.url);
  const host = request.headers.get('host') || '';
  const hostname = host.split(':')[0];
  const tenant = tenantFromHost(hostname) ?? url.searchParams.get('tenant') ?? 'mirk';

  try {
    const html = await renderSheet(tenant, unitId);
    const pdf = await generatePDF(html);
    return new Response(pdf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${unitId}.pdf"`,
      },
    });
  } catch (error) {
    const status = error?.status || 500;
    const isDevelopment = process.env.NODE_ENV === 'development';

    console.error('Failed to generate PDF', {
      tenant,
      unitId,
      error,
    });

    const message = isDevelopment
      ? `Error: ${error?.message || 'Unable to generate PDF'}`
      : 'Unable to generate PDF';

    return new Response(message, { status });
  }
}
