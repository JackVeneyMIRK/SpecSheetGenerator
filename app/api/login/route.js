import { NextResponse } from 'next/server';
import authModule from '@/lib/auth';

const { COOKIE_NAME, getSessionToken, isValidPassword } = authModule;

export async function POST(request) {
  const form = await request.formData();
  const password = String(form.get('password') || '');

  if (!isValidPassword(password)) {
    return NextResponse.redirect(new URL('/login', request.url), 303);
  }

  const response = NextResponse.redirect(new URL('/dashboard', request.url), 303);
  response.cookies.set(COOKIE_NAME, getSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 12,
  });
  return response;
}
