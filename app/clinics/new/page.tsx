'use client';

import { ArrowLeft, Building, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

interface ClinicFormData {
  name: string;
  description: string;
  license: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  emergencyPhone: string;
  specialties: string[];
  allowDataSharing: boolean;
  autoApproveRequests: boolean;
  encryptionEnabled: boolean;
  auditLogRetention: number;
}

const initialFormData: ClinicFormData = {
  name: '',
  description: '',
  license: '',
  street: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'Peru',
  phone: '',
  email: '',
  website: '',
  emergencyPhone: '',
  specialties: [],
  allowDataSharing: true,
  autoApproveRequests: false,
  encryptionEnabled: true,
  auditLogRetention: 2555,
};

const availableSpecialties = [
  'CARDIOLOGY',
  'DERMATOLOGY',
  'NEUROLOGY',
  'PEDIATRICS',
  'PSYCHIATRY',
  'SURGERY',
  'ONCOLOGY',
  'ORTHOPEDICS',
  'GYNECOLOGY',
  'RADIOLOGY',
  'PATHOLOGY',
  'ANESTHESIOLOGY',
];

export default function NewClinicPage() {
  const [formData, setFormData] = useState<ClinicFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: target.checked,
      }));
    } else if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value) || 0,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }

    // Limpiar error si el campo ahora tiene valor
    if (errors[name] && value.trim()) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSpecialtyChange = (specialty: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      specialties: checked
        ? [...prev.specialties, specialty]
        : prev.specialties.filter(s => s !== specialty),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.license.trim()) {
      newErrors.license = 'La licencia es requerida';
    }

    if (!formData.street.trim()) {
      newErrors.street = 'La dirección es requerida';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'La ciudad es requerida';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'El estado/región es requerido';
    }

    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'El código postal es requerido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'La URL debe comenzar con http:// o https://';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/clinics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        alert('Clínica creada exitosamente');
        router.push('/clinics');
      } else {
        if (data.errors && Array.isArray(data.errors)) {
          alert(`Errores:\n${data.errors.join('\n')}`);
        } else {
          alert(data.message || 'Error creando clínica');
        }
      }
    } catch (err) {
      alert('Error de conexión');
      console.error('Error creating clinic:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='bg-white shadow'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center py-6'>
            <Button
              variant='outline'
              onClick={() => router.back()}
              className='mr-4 flex items-center gap-2'
            >
              <ArrowLeft className='h-4 w-4' />
              Volver
            </Button>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>
                Nueva Clínica
              </h1>
              <p className='mt-1 text-sm text-gray-500'>
                Completa la información para registrar una nueva clínica
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className='mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8'>
        <form onSubmit={handleSubmit} className='space-y-8'>
          {/* Información Básica */}
          <div className='rounded-lg bg-white p-6 shadow'>
            <div className='mb-6 flex items-center gap-2'>
              <Building className='h-5 w-5 text-blue-500' />
              <h2 className='text-lg font-semibold text-gray-900'>
                Información Básica
              </h2>
            </div>

            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Nombre de la Clínica *
                </label>
                <input
                  type='text'
                  name='name'
                  value={formData.name}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder='Ej: Centro Médico San Rafael'
                />
                {errors.name && (
                  <p className='mt-1 text-sm text-red-600'>{errors.name}</p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Licencia de Funcionamiento *
                </label>
                <input
                  type='text'
                  name='license'
                  value={formData.license}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 ${
                    errors.license ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder='Ej: LIC-2024-001234'
                />
                {errors.license && (
                  <p className='mt-1 text-sm text-red-600'>{errors.license}</p>
                )}
              </div>

              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-700'>
                  Descripción
                </label>
                <textarea
                  name='description'
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500'
                  placeholder='Descripción breve de la clínica y sus servicios'
                />
              </div>
            </div>
          </div>

          {/* Dirección */}
          <div className='rounded-lg bg-white p-6 shadow'>
            <h2 className='mb-6 text-lg font-semibold text-gray-900'>
              Dirección
            </h2>

            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-700'>
                  Dirección *
                </label>
                <input
                  type='text'
                  name='street'
                  value={formData.street}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 ${
                    errors.street ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder='Ej: Av. Javier Prado 1234, San Isidro'
                />
                {errors.street && (
                  <p className='mt-1 text-sm text-red-600'>{errors.street}</p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Ciudad *
                </label>
                <input
                  type='text'
                  name='city'
                  value={formData.city}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 ${
                    errors.city ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder='Ej: Lima'
                />
                {errors.city && (
                  <p className='mt-1 text-sm text-red-600'>{errors.city}</p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Estado/Región *
                </label>
                <input
                  type='text'
                  name='state'
                  value={formData.state}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 ${
                    errors.state ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder='Ej: Lima'
                />
                {errors.state && (
                  <p className='mt-1 text-sm text-red-600'>{errors.state}</p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Código Postal *
                </label>
                <input
                  type='text'
                  name='zipCode'
                  value={formData.zipCode}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 ${
                    errors.zipCode ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder='Ej: 15036'
                />
                {errors.zipCode && (
                  <p className='mt-1 text-sm text-red-600'>{errors.zipCode}</p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  País
                </label>
                <select
                  name='country'
                  value={formData.country}
                  onChange={handleChange}
                  className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500'
                >
                  <option value='Peru'>Perú</option>
                  <option value='Colombia'>Colombia</option>
                  <option value='Ecuador'>Ecuador</option>
                  <option value='Bolivia'>Bolivia</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contacto */}
          <div className='rounded-lg bg-white p-6 shadow'>
            <h2 className='mb-6 text-lg font-semibold text-gray-900'>
              Información de Contacto
            </h2>

            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Teléfono Principal *
                </label>
                <input
                  type='tel'
                  name='phone'
                  value={formData.phone}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 ${
                    errors.phone ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder='Ej: +51 1 234-5678'
                />
                {errors.phone && (
                  <p className='mt-1 text-sm text-red-600'>{errors.phone}</p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Teléfono de Emergencia
                </label>
                <input
                  type='tel'
                  name='emergencyPhone'
                  value={formData.emergencyPhone}
                  onChange={handleChange}
                  className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500'
                  placeholder='Ej: +51 1 234-5679'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Email *
                </label>
                <input
                  type='email'
                  name='email'
                  value={formData.email}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder='Ej: contacto@clinica.com'
                />
                {errors.email && (
                  <p className='mt-1 text-sm text-red-600'>{errors.email}</p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Sitio Web
                </label>
                <input
                  type='url'
                  name='website'
                  value={formData.website}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 ${
                    errors.website ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder='Ej: https://www.clinica.com'
                />
                {errors.website && (
                  <p className='mt-1 text-sm text-red-600'>{errors.website}</p>
                )}
              </div>
            </div>
          </div>

          {/* Especialidades */}
          <div className='rounded-lg bg-white p-6 shadow'>
            <h2 className='mb-6 text-lg font-semibold text-gray-900'>
              Especialidades Médicas
            </h2>

            <div className='grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4'>
              {availableSpecialties.map(specialty => (
                <label
                  key={specialty}
                  className='flex items-center space-x-2 rounded border p-3 hover:bg-gray-50'
                >
                  <input
                    type='checkbox'
                    checked={formData.specialties.includes(specialty)}
                    onChange={e =>
                      handleSpecialtyChange(specialty, e.target.checked)
                    }
                    className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                  />
                  <span className='text-sm text-gray-700'>
                    {specialty.replace('_', ' ')}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Configuraciones */}
          <div className='rounded-lg bg-white p-6 shadow'>
            <h2 className='mb-6 text-lg font-semibold text-gray-900'>
              Configuraciones del Sistema
            </h2>

            <div className='space-y-4'>
              <div className='flex items-center space-x-3'>
                <input
                  type='checkbox'
                  name='allowDataSharing'
                  checked={formData.allowDataSharing}
                  onChange={handleChange}
                  className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                />
                <div>
                  <label className='text-sm font-medium text-gray-700'>
                    Permitir Compartir Datos
                  </label>
                  <p className='text-xs text-gray-500'>
                    Permite compartir información médica con otras clínicas
                  </p>
                </div>
              </div>

              <div className='flex items-center space-x-3'>
                <input
                  type='checkbox'
                  name='autoApproveRequests'
                  checked={formData.autoApproveRequests}
                  onChange={handleChange}
                  className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                />
                <div>
                  <label className='text-sm font-medium text-gray-700'>
                    Auto-aprobar Solicitudes
                  </label>
                  <p className='text-xs text-gray-500'>
                    Aprueba automáticamente las solicitudes de acceso a datos
                  </p>
                </div>
              </div>

              <div className='flex items-center space-x-3'>
                <input
                  type='checkbox'
                  name='encryptionEnabled'
                  checked={formData.encryptionEnabled}
                  onChange={handleChange}
                  className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                />
                <div>
                  <label className='text-sm font-medium text-gray-700'>
                    Encriptación Habilitada
                  </label>
                  <p className='text-xs text-gray-500'>
                    Utiliza encriptación adicional para los datos médicos
                  </p>
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Retención de Logs de Auditoría (días)
                </label>
                <input
                  type='number'
                  name='auditLogRetention'
                  value={formData.auditLogRetention}
                  onChange={handleChange}
                  min='30'
                  max='3650'
                  className='mt-1 block w-32 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500'
                />
                <p className='mt-1 text-xs text-gray-500'>
                  Días para mantener los registros de auditoría (30-3650 días)
                </p>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className='flex justify-end space-x-4'>
            <Button
              type='button'
              variant='outline'
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type='submit'
              disabled={loading}
              className='flex items-center gap-2'
            >
              {loading ? (
                <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
              ) : (
                <Save className='h-4 w-4' />
              )}
              {loading ? 'Creando...' : 'Crear Clínica'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
