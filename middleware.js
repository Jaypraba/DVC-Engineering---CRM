import { NextResponse } from 'next/server';

// crm.dvceng.com/ serves the CRM app; dvceng.com/ serves the public marketing site.
export function middleware(request) {
  const host = request.headers.get('host') || '';
  if (host.startsWith('crm.')) {
    return NextResponse.rewrite(new URL('/crm', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: '/',
};
