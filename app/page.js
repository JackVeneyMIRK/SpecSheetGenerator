import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import tenantModule from '@/lib/tenant';

const { tenantFromHost } = tenantModule;

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const headerStore = await headers();
  const host = (headerStore.get('host') || '').toLowerCase();
  const hostname = host.split(':')[0];

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    redirect('/dashboard');
  }

  const tenant = tenantFromHost(hostname);
  if (tenant) {
    redirect(`/dashboard/${tenant}`);
  }

  redirect('/dashboard');
}
