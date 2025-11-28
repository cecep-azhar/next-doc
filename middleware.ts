import { auth } from '@/lib/auth-config';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default auth(async (req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const hostname = req.headers.get('host') || '';

  // =============================================================================
  // TENANT/SUBDOMAIN DETECTION
  // =============================================================================
  
  // Get subdomain from hostname
  const subdomain = getSubdomain(hostname);
  
  // Store subdomain in header for later use
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-tenant-subdomain', subdomain || '');

  // =============================================================================
  // PUBLIC ROUTES (No Auth Required)
  // =============================================================================
  
  const publicRoutes = [
    '/',
    '/auth/signin',
    '/auth/signup',
    '/auth/error',
    '/auth/verify',
    '/pricing',
    '/about',
    '/contact',
    '/api/webhook/stripe',
  ];

  const isPublicRoute = publicRoutes.some(route => nextUrl.pathname === route);
  const isAuthRoute = nextUrl.pathname.startsWith('/auth');
  const isApiRoute = nextUrl.pathname.startsWith('/api');

  // =============================================================================
  // SUPER ADMIN ROUTES
  // =============================================================================
  
  if (nextUrl.pathname.startsWith('/saas-admin')) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/auth/signin', nextUrl));
    }

    if (req.auth?.user?.role !== 'SUPERADMIN') {
      return NextResponse.redirect(new URL('/', nextUrl));
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // =============================================================================
  // TENANT-SPECIFIC ROUTES
  // =============================================================================
  
  // If subdomain exists and not on auth route, handle tenant routing
  if (subdomain && !isAuthRoute && !isApiRoute) {
    // Note: Tenant verification moved to page-level since Edge Runtime doesn't support DB queries
    // The actual tenant check will happen in the page component
    
    // For authenticated tenant routes, ensure user is logged in
    if (nextUrl.pathname.startsWith('/dashboard') || 
        nextUrl.pathname.startsWith('/settings')) {
      if (!isLoggedIn) {
        const redirectUrl = new URL('/auth/signin', nextUrl);
        redirectUrl.searchParams.set('callbackUrl', nextUrl.pathname);
        return NextResponse.redirect(redirectUrl);
      }
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // =============================================================================
  // AUTHENTICATION REDIRECTS
  // =============================================================================
  
  // Redirect authenticated users away from auth pages
  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl));
  }

  // Redirect unauthenticated users to signin for protected routes
  if (!isLoggedIn && !isPublicRoute && !isApiRoute) {
    const redirectUrl = new URL('/auth/signin', nextUrl);
    redirectUrl.searchParams.set('callbackUrl', nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // =============================================================================
  // CONTINUE TO NEXT
  // =============================================================================
  
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
});

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Extract subdomain from hostname
 * Examples:
 * - demo.localhost:3000 → demo
 * - demo.docuverse.id → demo
 * - docuverse.id → null
 * - localhost:3000 → null
 */
function getSubdomain(hostname: string): string | null {
  // Remove port
  const host = hostname.split(':')[0];
  
  // Split by dots
  const parts = host.split('.');
  
  // If localhost or IP, no subdomain
  if (parts.length === 1 || parts[0] === 'localhost' || /^\d+$/.test(parts[0])) {
    return null;
  }
  
  // If more than 2 parts and not localhost, first part is subdomain
  if (parts.length >= 3) {
    return parts[0];
  }
  
  // If exactly 2 parts (e.g., docuverse.id), no subdomain
  return null;
}

// =============================================================================
// MIDDLEWARE CONFIG
// =============================================================================

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
