'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

function isActive(pathname, href, exact = false) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Sidebar({ tenants }) {
  const pathname = usePathname();

  return (
    <aside className="admin-sidebar">
      <div className="admin-brand">
        <p className="admin-brand-kicker">Spec Sheet</p>
        <h1>Dashboard</h1>
      </div>

      <nav className="admin-nav">
        <Link
          href="/dashboard"
          className={`admin-nav-item ${isActive(pathname, '/dashboard', true) ? 'active' : ''}`}
        >
          Overview
        </Link>

        <p className="admin-nav-group">Tenants</p>
        {tenants.map((tenant) => (
          <Link
            key={tenant.tenant}
            href={`/dashboard/${tenant.tenant}`}
            className={`admin-nav-item ${isActive(pathname, `/dashboard/${tenant.tenant}`) ? 'active' : ''}`}
          >
            <span>{tenant.tenant.toUpperCase()}</span>
          </Link>
        ))}
      </nav>

      <form method="post" action="/api/logout" className="admin-logout">
        <button className="button secondary" type="submit">
          Sign Out
        </button>
      </form>
    </aside>
  );
}
