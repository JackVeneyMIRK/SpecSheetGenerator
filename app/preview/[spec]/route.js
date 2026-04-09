import serviceModule from '@/lib/specSheetService';
import tenantModule from '@/lib/tenant';
import specRefModule from '@/lib/specRef';

const { renderSheet } = serviceModule;
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
