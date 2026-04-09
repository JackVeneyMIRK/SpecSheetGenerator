import { NextResponse } from 'next/server';

// These constants are duplicated here so this file stays Edge-compatible.
// lib/auth.js uses Node's `crypto` which is unavailable in the Edge runtime.
const COOKIE_NAME = 'sg_session';

const AUTH_BYPASS =
  process.env.NODE_ENV !== 'production' &&
  process.env.AUTH_BYPASS === 'true';

/** Compute the expected session token using the Web Crypto API (Edge-safe). */
let _tokenCache = null;
async function getExpectedToken() {
  if (_tokenCache) return _tokenCache;
  const password = process.env.DASHBOARD_PASSWORD || 'changeme';
  const encoded = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  _tokenCache = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return _tokenCache;
}

// Paths that must always pass through unauthenticated.
const ALWAYS_ALLOW = new Set(['/login', '/api/login', '/api/logout']);

export async function proxy(request) {
  if (AUTH_BYPASS) return NextResponse.next();
  const { pathname } = request.nextUrl;

  if (ALWAYS_ALLOW.has(pathname)) return NextResponse.next();

  const protectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/api/');
  if (!protectedRoute) return NextResponse.next();

  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (token && token === (await getExpectedToken())) return NextResponse.next();

  return NextResponse.redirect(new URL('/login', request.url));
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
