'use client';

import { Building, Edit, FileText, Plus, Trash2, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';

interface Clinic {
  id: string;
  name: string;
  description?: string;
  license: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  email: string;
  website?: string;
  emergencyPhone?: string;
  specialties: string[];
  allowDataSharing: boolean;
  autoApproveRequests: boolean;
  encryptionEnabled: boolean;
  auditLogRetention: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    users: number;
    patients: number;
  };
}

interface ApiResponse {
  success: boolean;
  data?: Clinic[];
  message?: string;
}

export default function ClinicsPage() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchClinics();
  }, []);

  const fetchClinics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/clinics');
      const data: ApiResponse = await response.json();

      if (data.success && data.data) {
        setClinics(data.data);
      } else {
        setError(data.message || 'Error cargando clínicas');
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('Error fetching clinics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (clinicId: string, clinicName: string) => {
    if (
      !confirm(
        `¿Estás seguro de que deseas desactivar la clínica "${clinicName}"?`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/clinics/${clinicId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        alert('Clínica desactivada exitosamente');
        fetchClinics(); // Recargar la lista
      } else {
        alert(data.message || 'Error desactivando clínica');
      }
    } catch (err) {
      alert('Error de conexión');
      console.error('Error deleting clinic:', err);
    }
  };

  const formatAddress = (clinic: Clinic) => {
    return `${clinic.street}, ${clinic.city}, ${clinic.state} ${clinic.zipCode}, ${clinic.country}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <div className='h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent'></div>
          <p className='mt-2 text-gray-600'>Cargando clínicas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <div className='text-red-500 mb-4'>
            <Building className='h-12 w-12 mx-auto' />
          </div>
          <h2 className='text-xl font-semibold text-gray-900 mb-2'>
            Error cargando clínicas
          </h2>
          <p className='text-gray-600 mb-4'>{error}</p>
          <Button onClick={fetchClinics}>Reintentar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='bg-white shadow'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-6'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>
                Gestión de Clínicas
              </h1>
              <p className='mt-1 text-sm text-gray-500'>
                Administra todas las clínicas del sistema
              </p>
            </div>
            <Button
              onClick={() => router.push('/clinics/new')}
              className='flex items-center gap-2'
            >
              <Plus className='h-4 w-4' />
              Nueva Clínica
            </Button>
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {clinics.length === 0 ? (
          <div className='text-center py-12'>
            <Building className='h-12 w-12 text-gray-400 mx-auto mb-4' />
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              No hay clínicas registradas
            </h3>
            <p className='text-gray-500 mb-4'>
              Comienza creando tu primera clínica
            </p>
            <Button
              onClick={() => router.push('/clinics/new')}
              className='flex items-center gap-2'
            >
              <Plus className='h-4 w-4' />
              Crear Primera Clínica
            </Button>
          </div>
        ) : (
          <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {clinics.map(clinic => (
              <div
                key={clinic.id}
                className='bg-white rounded-lg shadow hover:shadow-md transition-shadow'
              >
                <div className='p-6'>
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <div className='flex items-center gap-2 mb-2'>
                        <Building className='h-5 w-5 text-blue-500' />
                        <h3 className='text-lg font-semibold text-gray-900 line-clamp-1'>
                          {clinic.name}
                        </h3>
                      </div>
                      <p className='text-sm text-gray-600 mb-3 line-clamp-2'>
                        {clinic.description || 'Sin descripción'}
                      </p>
                    </div>
                    <div
                      className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                        clinic.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {clinic.isActive ? 'Activa' : 'Inactiva'}
                    </div>
                  </div>

                  <div className='space-y-2 mb-4'>
                    <div className='flex items-center gap-2 text-sm text-gray-600'>
                      <span className='font-medium'>Licencia:</span>
                      <span>{clinic.license}</span>
                    </div>
                    <div className='flex items-center gap-2 text-sm text-gray-600'>
                      <span className='font-medium'>Dirección:</span>
                      <span className='line-clamp-1'>
                        {formatAddress(clinic)}
                      </span>
                    </div>
                    <div className='flex items-center gap-2 text-sm text-gray-600'>
                      <span className='font-medium'>Teléfono:</span>
                      <span>{clinic.phone}</span>
                    </div>
                    <div className='flex items-center gap-2 text-sm text-gray-600'>
                      <span className='font-medium'>Email:</span>
                      <span className='line-clamp-1'>{clinic.email}</span>
                    </div>
                  </div>

                  <div className='flex items-center justify-between mb-4 pt-4 border-t border-gray-100'>
                    <div className='flex items-center gap-4 text-sm text-gray-500'>
                      <div className='flex items-center gap-1'>
                        <Users className='h-4 w-4' />
                        <span>{clinic._count.users} usuarios</span>
                      </div>
                      <div className='flex items-center gap-1'>
                        <FileText className='h-4 w-4' />
                        <span>{clinic._count.patients} pacientes</span>
                      </div>
                    </div>
                  </div>

                  <div className='flex items-center gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => router.push(`/clinics/${clinic.id}`)}
                      className='flex-1'
                    >
                      <Edit className='h-4 w-4 mr-1' />
                      Editar
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleDelete(clinic.id, clinic.name)}
                      className='text-red-600 hover:text-red-700 hover:bg-red-50'
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>

                  <div className='mt-3 text-xs text-gray-400'>
                    Creada: {formatDate(clinic.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
