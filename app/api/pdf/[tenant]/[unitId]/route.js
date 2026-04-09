import serviceModule from '@/lib/specSheetService';
import pdfModule from '@/lib/pdfGenerator';

const { renderSheet } = serviceModule;
const { generatePDF } = pdfModule;

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  const { tenant, unitId } = await params;
  const url = new URL(request.url);
  const asTenant = url.searchParams.get('as') || null;
  const download = url.searchParams.has('download');

  try {
    const html = await renderSheet(tenant, unitId, asTenant);
    const pdf = await generatePDF(html);
    return new Response(pdf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `${download ? 'attachment' : 'inline'}; filename="${unitId}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Failed to generate PDF', {
      tenant,
      unitId,
      asTenant,
      error,
    });

    const status = error?.status || 500;
    const message =
      process.env.NODE_ENV !== 'production'
        ? error?.message || 'Unable to generate PDF'
        : 'Unable to generate PDF';
    return new Response(`Error: ${message}`, { status });
  }
}
