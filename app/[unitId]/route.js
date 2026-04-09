import serviceModule from '@/lib/specSheetService';
import tenantModule from '@/lib/tenant';

const { renderSheet } = serviceModule;
const { tenantFromHost } = tenantModule;

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  const { unitId } = await params;
  if (unitId === 'favicon.ico') return new Response(null, { status: 404 });

  const url = new URL(request.url);
  const host = request.headers.get('host') || '';
  const hostname = host.split(':')[0];
  const tenant = tenantFromHost(hostname) ?? url.searchParams.get('tenant') ?? 'mirk';

  try {
    const html = await renderSheet(tenant, unitId);
    return new Response(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (error) {
    const status = error?.status || 500;
    const isDevelopment = process.env.NODE_ENV === 'development';
    const message = isDevelopment
      ? `Error: ${error?.message || 'Unable to render unit'}`
      : 'Error: Unable to render unit';

    console.error('Failed to render unit sheet', {
      tenant,
      unitId,
      status,
      error,
    });

    return new Response(message, { status });
  }
}
