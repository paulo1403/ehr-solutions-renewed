'use client';

import { Heart } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError(''); // Limpiar error al escribir
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // Login exitoso - redirigir al dashboard
        router.push('/dashboard');
      } else {
        setError(data.message || 'Error al iniciar sesión');
      }
    } catch (err) {
      setError('Error de conexión. Intenta nuevamente.');
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Error en login:', err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        {/* Header */}
        <div className='text-center'>
          <div className='flex justify-center'>
            <div className='flex items-center space-x-2'>
              <Heart className='h-10 w-10 text-blue-600' />
              <span className='text-2xl font-bold text-gray-900'>
                EHR Solutions
              </span>
            </div>
          </div>
          <h2 className='mt-6 text-3xl font-bold text-gray-900'>
            Iniciar Sesión
          </h2>
          <p className='mt-2 text-sm text-gray-600'>
            Accede a tu cuenta para gestionar historiales clínicos
          </p>
        </div>

        {/* Form */}
        <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
          <div className='space-y-4'>
            <div>
              <label htmlFor='email' className='sr-only'>
                Email
              </label>
              <input
                id='email'
                name='email'
                type='email'
                autoComplete='email'
                required
                className='relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm'
                placeholder='Correo electrónico'
                value={formData.email}
                onChange={handleChange}
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
                autoComplete='current-password'
                required
                className='relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm'
                placeholder='Contraseña'
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className='bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm'>
              {error}
            </div>
          )}

          <div>
            <Button
              type='submit'
              className='group relative w-full flex justify-center py-3 px-4 text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
              disabled={isLoading}
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </div>

          <div className='text-center'>
            <p className='text-sm text-gray-600'>
              ¿No tienes cuenta?{' '}
              <Link
                href='/register'
                className='font-medium text-blue-600 hover:text-blue-500'
              >
                Regístrate aquí
              </Link>
            </p>
          </div>
        </form>

        {/* Demo Credentials */}
        <div className='mt-6 p-4 bg-gray-50 rounded-lg'>
          <h3 className='text-sm font-medium text-gray-900 mb-2'>
            Credenciales de Demo:
          </h3>
          <div className='text-xs text-gray-600 space-y-1'>
            <p>
              <strong>Admin:</strong> admin@demo.com / admin123
            </p>
            <p>
              <strong>Doctor:</strong> doctor@demo.com / doctor123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
