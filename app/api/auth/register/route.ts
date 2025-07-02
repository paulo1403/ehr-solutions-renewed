import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { generateToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Schema de validación para el registro
const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  specialization: z.string().optional(),
  clinicId: z.string().uuid('ID de clínica inválido'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = registerSchema.parse(body);

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'El usuario ya existe' },
        { status: 400 }
      );
    }

    // Verificar que la clínica existe
    const clinic = await prisma.clinic.findUnique({
      where: { id: validatedData.clinicId },
    });

    if (!clinic) {
      return NextResponse.json(
        { error: 'Clínica no encontrada' },
        { status: 400 }
      );
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Crear el usuario
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        passwordHash: hashedPassword,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        specialties: validatedData.specialization
          ? [validatedData.specialization]
          : [],
        role: 'DOCTOR', // Por defecto, los nuevos usuarios son doctores
        clinicId: validatedData.clinicId,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        specialties: true,
        clinic: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Generar token JWT
    const fullUser = {
      ...user,
      clinicId: validatedData.clinicId,
    };
    const token = generateToken(fullUser);

    // Crear la respuesta con el token en una cookie segura
    const response = NextResponse.json(
      {
        user,
        message: 'Usuario registrado exitosamente',
      },
      { status: 201 }
    );

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 horas
      path: '/',
    });

    return response;
  } catch (error) {
    // Log error for debugging (in development)
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('Error en registro:', error);
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
