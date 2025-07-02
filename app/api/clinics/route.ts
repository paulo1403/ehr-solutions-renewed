import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Schema de validación para crear clínica
const createClinicSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().optional(),
  license: z.string().min(5, 'La licencia debe tener al menos 5 caracteres'),
  street: z.string().min(10, 'La dirección debe ser más específica'),
  city: z.string().min(2, 'La ciudad es requerida'),
  state: z.string().min(2, 'El estado/región es requerido'),
  zipCode: z.string().min(5, 'El código postal es requerido'),
  country: z.string().default('Peru'),
  phone: z.string().min(10, 'El teléfono debe tener al menos 10 dígitos'),
  email: z.string().email('Email inválido'),
  website: z.string().url('URL inválida').optional().or(z.literal('')),
  emergencyPhone: z.string().optional(),
  specialties: z.array(z.string()).default([]),
  allowDataSharing: z.boolean().default(true),
  autoApproveRequests: z.boolean().default(false),
  encryptionEnabled: z.boolean().default(true),
  auditLogRetention: z.number().default(2555),
});

// GET - Obtener todas las clínicas (solo SUPER_ADMIN)
export async function GET(request: NextRequest) {
  try {
    const authCookie = request.cookies.get('auth-token');
    if (!authCookie) {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      );
    }

    const payload = verifyToken(authCookie.value);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: 'Token inválido' },
        { status: 401 }
      );
    }

    // Verificar que es SUPER_ADMIN
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { role: true, isActive: true },
    });

    if (!user || !user.isActive || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Permisos insuficientes' },
        { status: 403 }
      );
    }

    // Obtener todas las clínicas con información adicional
    const clinics = await prisma.clinic.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        license: true,
        street: true,
        city: true,
        state: true,
        zipCode: true,
        country: true,
        phone: true,
        email: true,
        website: true,
        emergencyPhone: true,
        specialties: true,
        allowDataSharing: true,
        autoApproveRequests: true,
        encryptionEnabled: true,
        auditLogRetention: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            users: true,
            patients: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: clinics,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('Error obteniendo clínicas:', error);
    }
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Crear nueva clínica (solo SUPER_ADMIN)
export async function POST(request: NextRequest) {
  try {
    const authCookie = request.cookies.get('auth-token');
    if (!authCookie) {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      );
    }

    const payload = verifyToken(authCookie.value);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: 'Token inválido' },
        { status: 401 }
      );
    }

    // Verificar que es SUPER_ADMIN
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { role: true, isActive: true },
    });

    if (!user || !user.isActive || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Permisos insuficientes' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = createClinicSchema.safeParse(body);

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

    const {
      name,
      description,
      license,
      street,
      city,
      state,
      zipCode,
      country,
      phone,
      email,
      website,
      emergencyPhone,
      specialties,
      allowDataSharing,
      autoApproveRequests,
      encryptionEnabled,
      auditLogRetention,
    } = validation.data;

    // Verificar que la licencia sea única
    const existingClinic = await prisma.clinic.findUnique({
      where: { license },
    });

    if (existingClinic) {
      return NextResponse.json(
        {
          success: false,
          message: 'Ya existe una clínica con esta licencia',
        },
        { status: 400 }
      );
    }

    // Crear la clínica
    const clinic = await prisma.clinic.create({
      data: {
        name,
        description,
        license,
        street,
        city,
        state,
        zipCode,
        country,
        phone,
        email,
        website: website || null,
        emergencyPhone: emergencyPhone || null,
        specialties,
        allowDataSharing,
        autoApproveRequests,
        encryptionEnabled,
        auditLogRetention,
      },
      select: {
        id: true,
        name: true,
        description: true,
        license: true,
        street: true,
        city: true,
        state: true,
        zipCode: true,
        country: true,
        phone: true,
        email: true,
        website: true,
        emergencyPhone: true,
        specialties: true,
        allowDataSharing: true,
        autoApproveRequests: true,
        encryptionEnabled: true,
        auditLogRetention: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Clínica creada exitosamente',
        data: clinic,
      },
      { status: 201 }
    );
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('Error creando clínica:', error);
    }
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
