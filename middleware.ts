import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (pathname === '/api-docs' && search.length > 0) {
    return NextResponse.redirect('/api-docs');
  }

  return NextResponse.next();
}
