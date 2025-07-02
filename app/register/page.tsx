'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  specialization: string;
  clinicId: string;
}

export default function RegisterPage() {
  const [form, setForm] = useState<RegisterForm>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    specialization: '',
    clinicId: '',
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (form.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          firstName: form.firstName,
          lastName: form.lastName,
          specialization: form.specialization || undefined,
          clinicId: form.clinicId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/dashboard');
      } else {
        setError(data.error || 'Error en el registro');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4'>
      <div className='max-w-md w-full space-y-8'>
        <div className='bg-white p-8 rounded-xl shadow-lg'>
          <div className='text-center'>
            <h2 className='text-3xl font-bold text-gray-900'>Registro</h2>
            <p className='mt-2 text-gray-600'>
              Crea tu cuenta en EHR Solutions
            </p>
          </div>

          <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
            {error && (
              <div className='bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded'>
                {error}
              </div>
            )}

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label htmlFor='firstName' className='sr-only'>
                  Nombre
                </label>
                <input
                  id='firstName'
                  name='firstName'
                  type='text'
                  required
                  value={form.firstName}
                  onChange={handleInputChange}
                  className='relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                  placeholder='Nombre'
                />
              </div>
              <div>
                <label htmlFor='lastName' className='sr-only'>
                  Apellido
                </label>
                <input
                  id='lastName'
                  name='lastName'
                  type='text'
                  required
                  value={form.lastName}
                  onChange={handleInputChange}
                  className='relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                  placeholder='Apellido'
                />
              </div>
            </div>

            <div>
              <label htmlFor='email' className='sr-only'>
                Email
              </label>
              <input
                id='email'
                name='email'
                type='email'
                required
                value={form.email}
                onChange={handleInputChange}
                className='relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                placeholder='Email'
              />
            </div>

            <div>
              <label htmlFor='specialization' className='sr-only'>
                Especialización
              </label>
              <input
                id='specialization'
                name='specialization'
                type='text'
                value={form.specialization}
                onChange={handleInputChange}
                className='relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                placeholder='Especialización (opcional)'
              />
            </div>

            <div>
              <label htmlFor='clinicId' className='sr-only'>
                ID de Clínica
              </label>
              <input
                id='clinicId'
                name='clinicId'
                type='text'
                required
                value={form.clinicId}
                onChange={handleInputChange}
                className='relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                placeholder='ID de Clínica'
              />
            </div>

            <div>
              <label htmlFor='password' className='sr-only'>
                Contraseña
              </label>
              <input
                id='password'
                name='password'
                type='password'
                required
                value={form.password}
                onChange={handleInputChange}
                className='relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                placeholder='Contraseña'
              />
            </div>

            <div>
              <label htmlFor='confirmPassword' className='sr-only'>
                Confirmar Contraseña
              </label>
              <input
                id='confirmPassword'
                name='confirmPassword'
                type='password'
                required
                value={form.confirmPassword}
                onChange={handleInputChange}
                className='relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                placeholder='Confirmar Contraseña'
              />
            </div>

            <Button
              type='submit'
              className='w-full'
              disabled={loading}
              size='lg'
            >
              {loading ? 'Registrando...' : 'Registrarse'}
            </Button>

            <div className='text-center'>
              <span className='text-gray-600'>¿Ya tienes una cuenta? </span>
              <Link
                href='/login'
                className='font-medium text-blue-600 hover:text-blue-500'
              >
                Inicia Sesión
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
