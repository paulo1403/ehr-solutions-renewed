import { NextRequest, NextResponse } from 'next/server';

import { verifyToken } from '@/lib/auth';

// Rutas que no requieren autenticación
const publicRoutes = ['/', '/login', '/register'];

// Rutas de API que no requieren autenticación
const publicApiRoutes = ['/api/auth/login', '/api/auth/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir acceso a rutas públicas
  if (publicRoutes.includes(pathname) || publicApiRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Permitir acceso a archivos estáticos
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Verificar token de autenticación
  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    // Redirigir a login si no hay token
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Verificar el token
    const payload = verifyToken(token);
    if (!payload) {
      // Token inválido, redirigir a login
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Token válido, permitir acceso
    return NextResponse.next();
  } catch {
    // Error al verificar token, redirigir a login
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
