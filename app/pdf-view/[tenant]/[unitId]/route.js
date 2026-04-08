import serviceModule from '@/lib/specSheetService';
import pdfModule from '@/lib/pdfGenerator';

const { renderSheet } = serviceModule;
const { generatePDF } = pdfModule;

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  const { tenant, unitId } = await params;
  const asTenant = new URL(request.url).searchParams.get('as') || null;

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
    return new Response(`Error: ${error?.message || 'Unable to generate PDF'}`, { status });
  }
}
