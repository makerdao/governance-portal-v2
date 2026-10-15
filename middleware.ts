import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: '/api-docs'
};

export async function middleware(request: NextRequest) {
  // Redirect /api-docs with query params to clean URL
  if (request.nextUrl.search.length > 0) {
    const url = new URL('/api-docs', request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
