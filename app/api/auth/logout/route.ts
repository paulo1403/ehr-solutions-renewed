import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Crear respuesta que elimina la cookie de autenticación
    const response = NextResponse.json(
      { message: 'Sesión cerrada exitosamente' },
      { status: 200 }
    );

    // Eliminar la cookie de autenticación
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // Expira inmediatamente
      path: '/',
    });

    return response;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('Error en logout:', error);
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
