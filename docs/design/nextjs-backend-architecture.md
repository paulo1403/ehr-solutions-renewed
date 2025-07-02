# Arquitectura Backend con Next.js Full-Stack

## 🏗️ Estructura de API con Next.js App Router

### 📁 Organización de API Routes

```
app/
├── api/
│   ├── auth/
│   │   ├── login/route.ts           # POST /api/auth/login
│   │   ├── register/route.ts        # POST /api/auth/register
│   │   ├── refresh/route.ts         # POST /api/auth/refresh
│   │   └── logout/route.ts          # POST /api/auth/logout
│   ├── clinics/
│   │   ├── route.ts                 # GET, POST /api/clinics
│   │   └── [id]/
│   │       ├── route.ts             # GET, PUT, DELETE /api/clinics/:id
│   │       ├── users/route.ts       # GET /api/clinics/:id/users
│   │       └── patients/route.ts    # GET /api/clinics/:id/patients
│   ├── patients/
│   │   ├── route.ts                 # GET, POST /api/patients
│   │   ├── [id]/route.ts            # GET, PUT, DELETE /api/patients/:id
│   │   └── search/route.ts          # GET /api/patients/search
│   ├── ehr/
│   │   ├── route.ts                 # GET, POST /api/ehr
│   │   ├── [id]/route.ts            # GET, PUT, DELETE /api/ehr/:id
│   │   └── [id]/
│   │       ├── fhir/route.ts        # GET /api/ehr/:id/fhir
│   │       └── share/route.ts       # POST /api/ehr/:id/share
│   └── requests/
│       ├── route.ts                 # GET, POST /api/requests
│       ├── [id]/route.ts            # GET, PUT /api/requests/:id
│       └── [id]/
│           ├── approve/route.ts     # POST /api/requests/:id/approve
│           └── reject/route.ts      # POST /api/requests/:id/reject
├── actions/                         # Server Actions
│   ├── auth.ts
│   ├── clinic.ts
│   ├── patient.ts
│   └── ehr.ts
└── middleware.ts                    # Middleware global
```

## 🔐 Ejemplo: Autenticación con API Routes

### API Route: Login

```typescript
// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email },
      include: { clinic: true },
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Generar token JWT
    const token = jwt.sign(
      { userId: user.id, clinicId: user.clinicId, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    // Actualizar último login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        clinic: user.clinic,
      },
      token,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
```

## ⚡ Server Actions: Alternativa Moderna

### Server Action: Crear Paciente

```typescript
// app/actions/patient.ts
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function createPatient(formData: FormData) {
  const session = await auth();

  if (!session?.user) {
    throw new Error('No autorizado');
  }

  const patientData = {
    nationalId: formData.get('nationalId') as string,
    firstName: formData.get('firstName') as string,
    lastName: formData.get('lastName') as string,
    dateOfBirth: new Date(formData.get('dateOfBirth') as string),
    gender: formData.get('gender') as any,
    phone: formData.get('phone') as string,
    email: (formData.get('email') as string) || null,
    clinicId: session.user.clinicId,
    // ... más campos
  };

  try {
    const patient = await prisma.patient.create({
      data: patientData,
    });

    revalidatePath('/dashboard/patients');
    redirect(`/dashboard/patients/${patient.id}`);
  } catch (error) {
    throw new Error('Error al crear paciente');
  }
}
```

### Uso en Componente React

```typescript
// app/dashboard/patients/new/page.tsx
import { createPatient } from '@/actions/patient';

export default function NewPatientPage() {
  return (
    <form action={createPatient}>
      <input name="nationalId" required />
      <input name="firstName" required />
      <input name="lastName" required />
      <button type="submit">Crear Paciente</button>
    </form>
  );
}
```

## 🛡️ Middleware para Autenticación

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export function middleware(request: NextRequest) {
  // Rutas protegidas
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET!);
      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // API Routes protegidas
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const authHeader = request.headers.get('authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token requerido' }, { status: 401 });
    }

    try {
      const token = authHeader.substring(7);
      jwt.verify(token, process.env.JWT_SECRET!);
      return NextResponse.next();
    } catch {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/((?!auth).*)'],
};
```

## 🗄️ Configuración de Base de Datos

### Prisma Client

```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

## 🎯 Ventajas de Next.js Full-Stack

### ✅ **Beneficios Inmediatos**

1. **Un solo repositorio**: Código frontend y backend juntos
2. **Tipo safety**: TypeScript compartido entre cliente y servidor
3. **Performance**: Optimizaciones automáticas de Next.js
4. **Deployment**: Deploy completo con un comando
5. **Development**: Un solo servidor de desarrollo

### ✅ **Características Avanzadas**

1. **Server Components**: Componentes que corren en el servidor
2. **Streaming**: Carga progresiva de la UI
3. **Static Generation**: Páginas estáticas cuando sea posible
4. **Edge Runtime**: Funciones que corren cerca del usuario
5. **Automatic Code Splitting**: Carga solo el código necesario

### ✅ **Para tu Proyecto EHR**

1. **Seguridad**: Middleware nativo para proteger rutas
2. **Performance**: Carga rápida crucial para aplicaciones médicas
3. **Escalabilidad**: Preparado para Vercel/AWS/Azure
4. **Mantenimiento**: Una sola tecnología que mantener
5. **Productividad**: Desarrollo más rápido

## 📋 Próximos Pasos

Con esta arquitectura, nuestro plan se simplifica:

### ✅ **Fase 2 Actualizada: Sistema Core (Semanas 5-10)**

- [ ] Configurar PostgreSQL + Prisma
- [ ] Implementar API Routes de autenticación
- [ ] Crear middleware de protección
- [ ] Desarrollar dashboard con Server Components
- [ ] Implementar CRUD con Server Actions

¿Te parece mejor esta aproximación? ¡Es mucho más simple y moderno! 🚀
