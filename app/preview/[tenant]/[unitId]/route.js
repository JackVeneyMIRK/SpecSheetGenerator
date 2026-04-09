import serviceModule from '@/lib/specSheetService';
import tenantModule from '@/lib/tenant';

const { renderSheet } = serviceModule;
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
    return new Response(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (error) {
    const isDev = process.env.NODE_ENV !== 'production';
    const status = error?.status || 500;
    if (!isDev) console.error('[preview] render error:', error?.stack || error);
    const message = isDev
      ? (error?.stack || error?.message || 'Unable to render preview')
      : 'Unable to render preview';
    return new Response(`<pre style="font:14px monospace;padding:24px">${message}</pre>`, {
      status,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }
}
