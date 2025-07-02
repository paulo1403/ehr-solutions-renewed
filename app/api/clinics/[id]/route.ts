import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Schema de validación para actualizar clínica
const updateClinicSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .optional(),
  description: z.string().optional(),
  license: z
    .string()
    .min(5, 'La licencia debe tener al menos 5 caracteres')
    .optional(),
  street: z.string().min(10, 'La dirección debe ser más específica').optional(),
  city: z.string().min(2, 'La ciudad es requerida').optional(),
  state: z.string().min(2, 'El estado/región es requerido').optional(),
  zipCode: z.string().min(5, 'El código postal es requerido').optional(),
  country: z.string().optional(),
  phone: z
    .string()
    .min(10, 'El teléfono debe tener al menos 10 dígitos')
    .optional(),
  email: z.string().email('Email inválido').optional(),
  website: z.string().url('URL inválida').optional().or(z.literal('')),
  emergencyPhone: z.string().optional(),
  specialties: z.array(z.string()).optional(),
  allowDataSharing: z.boolean().optional(),
  autoApproveRequests: z.boolean().optional(),
  encryptionEnabled: z.boolean().optional(),
  auditLogRetention: z.number().optional(),
  isActive: z.boolean().optional(),
});

// GET - Obtener una clínica específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Verificar que el usuario está activo
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { role: true, isActive: true, clinicId: true },
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { success: false, message: 'Usuario no autorizado' },
        { status: 403 }
      );
    }

    // SUPER_ADMIN puede ver cualquier clínica, otros solo la suya
    const canViewAll = user.role === 'SUPER_ADMIN';
    if (!canViewAll && user.clinicId !== params.id) {
      return NextResponse.json(
        { success: false, message: 'Permisos insuficientes' },
        { status: 403 }
      );
    }

    // Obtener la clínica
    const clinic = await prisma.clinic.findUnique({
      where: { id: params.id },
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
            ehr: true,
          },
        },
      },
    });

    if (!clinic) {
      return NextResponse.json(
        { success: false, message: 'Clínica no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: clinic,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('Error obteniendo clínica:', error);
    }
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar una clínica
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Verificar permisos
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { role: true, isActive: true, clinicId: true },
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { success: false, message: 'Usuario no autorizado' },
        { status: 403 }
      );
    }

    // Solo SUPER_ADMIN puede actualizar cualquier clínica, CLINIC_ADMIN solo la suya
    const canUpdateAll = user.role === 'SUPER_ADMIN';
    const canUpdateOwn =
      user.role === 'CLINIC_ADMIN' && user.clinicId === params.id;

    if (!canUpdateAll && !canUpdateOwn) {
      return NextResponse.json(
        { success: false, message: 'Permisos insuficientes' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = updateClinicSchema.safeParse(body);

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

    // Verificar que la clínica existe
    const existingClinic = await prisma.clinic.findUnique({
      where: { id: params.id },
    });

    if (!existingClinic) {
      return NextResponse.json(
        { success: false, message: 'Clínica no encontrada' },
        { status: 404 }
      );
    }

    // Si se está actualizando la licencia, verificar que sea única
    if (
      validation.data.license &&
      validation.data.license !== existingClinic.license
    ) {
      const licenseExists = await prisma.clinic.findUnique({
        where: { license: validation.data.license },
      });

      if (licenseExists) {
        return NextResponse.json(
          {
            success: false,
            message: 'Ya existe una clínica con esta licencia',
          },
          { status: 400 }
        );
      }
    }

    // Actualizar la clínica
    const updatedClinic = await prisma.clinic.update({
      where: { id: params.id },
      data: {
        ...validation.data,
        website:
          validation.data.website === '' ? null : validation.data.website,
        emergencyPhone:
          validation.data.emergencyPhone === ''
            ? null
            : validation.data.emergencyPhone,
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
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Clínica actualizada exitosamente',
      data: updatedClinic,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('Error actualizando clínica:', error);
    }
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar (desactivar) una clínica
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Solo SUPER_ADMIN puede eliminar clínicas
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

    // Verificar que la clínica existe
    const clinic = await prisma.clinic.findUnique({
      where: { id: params.id },
      select: { id: true, name: true, isActive: true },
    });

    if (!clinic) {
      return NextResponse.json(
        { success: false, message: 'Clínica no encontrada' },
        { status: 404 }
      );
    }

    // Desactivar la clínica (soft delete)
    await prisma.clinic.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      message: `Clínica ${clinic.name} desactivada exitosamente`,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('Error eliminando clínica:', error);
    }
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
