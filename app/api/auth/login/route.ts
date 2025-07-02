import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import {
  comparePassword,
  generateRefreshToken,
  generateToken,
} from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar datos de entrada
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Datos inválidos',
          errors: validation.error.errors.map(err => err.message),
        },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    // Buscar usuario en la base de datos
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        clinic: {
          select: {
            id: true,
            name: true,
            license: true,
          },
        },
      },
    });

    // Verificar si el usuario existe y está activo
    if (!user || !user.isActive) {
      return NextResponse.json(
        {
          success: false,
          message: 'Credenciales inválidas',
        },
        { status: 401 }
      );
    }

    // Verificar contraseña
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          message: 'Credenciales inválidas',
        },
        { status: 401 }
      );
    }

    // Generar tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Actualizar último login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Preparar datos del usuario para la respuesta
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      clinic: user.clinic,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
    };

    // Crear respuesta con cookies httpOnly para mayor seguridad
    const response = NextResponse.json({
      success: true,
      message: 'Login exitoso',
      data: {
        user: userData,
        token,
      },
    });

    // Configurar cookies seguras
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 horas
      path: '/',
    });

    response.cookies.set('refresh-token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 días
      path: '/',
    });

    return response;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('Error en login:', error);
    }
    return NextResponse.json(
      {
        success: false,
        message: 'Error interno del servidor',
      },
      { status: 500 }
    );
  }
}
