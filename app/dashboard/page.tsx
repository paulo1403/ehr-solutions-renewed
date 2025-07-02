'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  specialties: string[];
  clinic: {
    id: string;
    name: string;
  };
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          router.push('/login');
        }
      } catch {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch {
      // Si falla, aún así redirigir al login
      router.push('/login');
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Se redirigirá al login
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-white shadow-sm border-b'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-4'>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>
                EHR Solutions Dashboard
              </h1>
              <p className='text-gray-600'>
                Bienvenido, {user.firstName} {user.lastName}
              </p>
            </div>
            <Button onClick={handleLogout} variant='outline'>
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* User Info Card */}
        <div className='bg-white rounded-lg shadow-md p-6 mb-8'>
          <h2 className='text-xl font-semibold text-gray-900 mb-4'>
            Información del Usuario
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <p className='text-gray-600'>
                <span className='font-medium'>Email:</span> {user.email}
              </p>
              <p className='text-gray-600'>
                <span className='font-medium'>Rol:</span> {user.role}
              </p>
            </div>
            <div>
              <p className='text-gray-600'>
                <span className='font-medium'>Clínica:</span> {user.clinic.name}
              </p>
              {user.specialties && user.specialties.length > 0 && (
                <p className='text-gray-600'>
                  <span className='font-medium'>Especialización:</span>{' '}
                  {user.specialties.join(', ')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {/* Gestión de Clínicas - Solo para SUPER_ADMIN */}
          {user.role === 'SUPER_ADMIN' && (
            <div className='bg-white rounded-lg shadow-md p-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                Gestión de Clínicas
              </h3>
              <p className='text-gray-600 mb-4'>
                Administra todas las clínicas del sistema
              </p>
              <Button
                className='w-full'
                onClick={() => router.push('/clinics')}
              >
                Gestionar Clínicas
              </Button>
            </div>
          )}

          <div className='bg-white rounded-lg shadow-md p-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>
              Pacientes
            </h3>
            <p className='text-gray-600 mb-4'>
              Gestiona los registros de pacientes
            </p>
            <Button className='w-full' disabled>
              Ver Pacientes (Próximamente)
            </Button>
          </div>

          <div className='bg-white rounded-lg shadow-md p-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>
              Historiales Clínicos
            </h3>
            <p className='text-gray-600 mb-4'>
              Administra los historiales clínicos electrónicos
            </p>
            <Button className='w-full' disabled>
              Ver HCE (Próximamente)
            </Button>
          </div>

          <div className='bg-white rounded-lg shadow-md p-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>
              Solicitudes
            </h3>
            <p className='text-gray-600 mb-4'>
              Gestiona las solicitudes de intercambio
            </p>
            <Button className='w-full' disabled>
              Ver Solicitudes (Próximamente)
            </Button>
          </div>
        </div>

        {/* Development Info */}
        <div className='mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6'>
          <h3 className='text-lg font-semibold text-blue-900 mb-2'>
            Estado del Desarrollo
          </h3>
          <p className='text-blue-700 mb-4'>
            ✅ Sistema de autenticación completado
            <br />
            🚧 CRUD de pacientes - En desarrollo
            <br />
            🚧 Gestión de HCE - Planificado
            <br />
            🚧 Intercambio de datos - Fase futura
          </p>
        </div>
      </main>
    </div>
  );
}
