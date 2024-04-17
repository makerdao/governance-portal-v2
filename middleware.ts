import { NextRequest, NextResponse } from 'next/server';
import { config as libConfig } from 'lib/config';

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' }
      ]
    }
  ]
};

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname === '/api-docs' && search.length > 0) {
    return NextResponse.redirect('/api-docs');
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const dev = libConfig.NODE_ENV === 'development';

  const cspHeader = `
    default-src 'self' https://*.makerdao.com;
    script-src 'self'  ${
      dev ? "'unsafe-eval' 'unsafe-inline'" : ''
    } cdn.vercel-insights.com 'nonce-${nonce}'; 
    style-src 'self' 'unsafe-inline';
    frame-src https://connect.trezor.io https://www.youtube-nocookie.com https://player.vimeo.com https://vercel.live https://verify.walletconnect.com;
    font-src 'self' data:;
    connect-src http://localhost:8545 http://127.0.0.1:8546 http://127.0.0.1:8545 http://localhost:3001 'self' https: wss:;
    img-src 'self' https: data:;
  `;

  // Replace newline characters and spaces
  const contentSecurityPolicyHeaderValue = cspHeader.replace(/\s{2,}/g, ' ').trim();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', contentSecurityPolicyHeaderValue);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders
    }
  });

  response.headers.set('Content-Security-Policy', contentSecurityPolicyHeaderValue);

  return response;
}
