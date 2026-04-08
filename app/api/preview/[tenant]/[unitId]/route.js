import serviceModule from '@/lib/specSheetService';

const { renderSheet } = serviceModule;

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  const { tenant, unitId } = await params;
  const asTenant = new URL(request.url).searchParams.get('as') || null;

  try {
    const html = await renderSheet(tenant, unitId, asTenant);
    return new Response(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (error) {
    const message = error?.message || 'Unable to render preview';
    const status = error?.status || 500;
    return new Response(`Error: ${message}`, { status });
  }
}
