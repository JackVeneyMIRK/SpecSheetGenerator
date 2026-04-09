import { NextResponse } from 'next/server';
import authModule from '@/lib/auth';

const { AUTH_BYPASS, COOKIE_NAME, getSessionToken } = authModule;

export function middleware(request) {
  if (AUTH_BYPASS) return NextResponse.next();
  const { pathname } = request.nextUrl;

  if (pathname === '/login') return NextResponse.next();

  const protectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/api/');
  if (!protectedRoute) return NextResponse.next();

  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (token === getSessionToken()) return NextResponse.next();

  return NextResponse.redirect(new URL('/login', request.url));
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
