import { FileText, Heart, Lock, Network, Shield, Users } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50'>
      {/* Header */}
      <header className='container mx-auto px-4 py-6'>
        <nav className='flex items-center justify-between'>
          <div className='flex items-center space-x-2'>
            <Heart className='h-8 w-8 text-blue-600' />
            <span className='text-2xl font-bold text-gray-900'>
              EHR Solutions
            </span>
          </div>
          <div className='flex items-center space-x-4'>
            <Button variant='ghost' asChild>
              <Link href='/login'>Iniciar Sesión</Link>
            </Button>
            <Button asChild>
              <Link href='/register'>Registro</Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className='container mx-auto px-4 py-12'>
        <div className='text-center mb-16'>
          <h1 className='text-4xl md:text-6xl font-bold text-gray-900 mb-6'>
            Intercambio Seguro de
            <span className='text-blue-600'> Historiales Clínicos</span>
          </h1>
          <p className='text-xl text-gray-600 mb-8 max-w-3xl mx-auto'>
            Plataforma innovadora que permite a las clínicas compartir
            historiales clínicos electrónicos de forma segura utilizando
            blockchain y estándares HL7 FHIR.
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Button size='lg' asChild>
              <Link href='/demo'>Ver Demo</Link>
            </Button>
            <Button size='lg' variant='outline' asChild>
              <Link href='/docs'>Documentación</Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16'>
          <FeatureCard
            icon={<Shield className='h-12 w-12 text-blue-600' />}
            title='Seguridad Garantizada'
            description='Protección de datos mediante cifrado avanzado y tecnología blockchain para inmutabilidad y transparencia.'
          />
          <FeatureCard
            icon={<Network className='h-12 w-12 text-green-600' />}
            title='Interoperabilidad'
            description='Compatibilidad total con estándares HL7 FHIR para intercambio fluido entre diferentes sistemas.'
          />
          <FeatureCard
            icon={<FileText className='h-12 w-12 text-purple-600' />}
            title='Gestión Completa'
            description='Sistema integral para la gestión de pacientes, historiales clínicos y solicitudes entre clínicas.'
          />
          <FeatureCard
            icon={<Users className='h-12 w-12 text-orange-600' />}
            title='Colaboración'
            description='Facilita la colaboración entre profesionales de la salud para mejorar la atención al paciente.'
          />
          <FeatureCard
            icon={<Lock className='h-12 w-12 text-red-600' />}
            title='Control de Acceso'
            description='Sistema granular de permisos y auditoría completa de todos los accesos a información médica.'
          />
          <FeatureCard
            icon={<Heart className='h-12 w-12 text-pink-600' />}
            title='Centrado en el Paciente'
            description='Diseñado pensando en la continuidad y calidad de la atención médica del paciente.'
          />
        </div>

        {/* Process Section */}
        <section className='bg-white rounded-lg shadow-lg p-8 mb-16'>
          <h2 className='text-3xl font-bold text-center text-gray-900 mb-12'>
            ¿Cómo Funciona?
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
            <ProcessStep
              number='1'
              title='Solicitud'
              description='La clínica solicita acceso al historial clínico de un paciente'
            />
            <ProcessStep
              number='2'
              title='Autorización'
              description='La clínica propietaria revisa y aprueba la solicitud'
            />
            <ProcessStep
              number='3'
              title='Handshake'
              description='Se establece una conexión segura mediante blockchain'
            />
            <ProcessStep
              number='4'
              title='Acceso'
              description='Se entrega el historial en formato HL7 FHIR estándar'
            />
          </div>
        </section>

        {/* CTA Section */}
        <section className='text-center'>
          <h2 className='text-3xl font-bold text-gray-900 mb-6'>
            ¿Listo para Transformar tu Clínica?
          </h2>
          <p className='text-xl text-gray-600 mb-8'>
            Únete a la revolución del intercambio seguro de datos médicos
          </p>
          <Button size='lg' asChild>
            <Link href='/contact'>Contáctanos</Link>
          </Button>
        </section>
      </main>

      {/* Footer */}
      <footer className='bg-gray-900 text-white py-12 mt-16'>
        <div className='container mx-auto px-4'>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
            <div>
              <div className='flex items-center space-x-2 mb-4'>
                <Heart className='h-6 w-6' />
                <span className='text-xl font-bold'>EHR Solutions</span>
              </div>
              <p className='text-gray-400'>
                Transformando la atención médica a través de la tecnología
                segura e interoperable.
              </p>
            </div>
            <div>
              <h3 className='font-semibold mb-4'>Producto</h3>
              <ul className='space-y-2 text-gray-400'>
                <li>
                  <Link href='/features' className='hover:text-white'>
                    Características
                  </Link>
                </li>
                <li>
                  <Link href='/security' className='hover:text-white'>
                    Seguridad
                  </Link>
                </li>
                <li>
                  <Link href='/integrations' className='hover:text-white'>
                    Integraciones
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className='font-semibold mb-4'>Recursos</h3>
              <ul className='space-y-2 text-gray-400'>
                <li>
                  <Link href='/docs' className='hover:text-white'>
                    Documentación
                  </Link>
                </li>
                <li>
                  <Link href='/api' className='hover:text-white'>
                    API
                  </Link>
                </li>
                <li>
                  <Link href='/support' className='hover:text-white'>
                    Soporte
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className='font-semibold mb-4'>Empresa</h3>
              <ul className='space-y-2 text-gray-400'>
                <li>
                  <Link href='/about' className='hover:text-white'>
                    Acerca de
                  </Link>
                </li>
                <li>
                  <Link href='/privacy' className='hover:text-white'>
                    Privacidad
                  </Link>
                </li>
                <li>
                  <Link href='/terms' className='hover:text-white'>
                    Términos
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className='border-t border-gray-800 mt-8 pt-8 text-center text-gray-400'>
            <p>
              © 2025 EHR Solutions. Proyecto de tesis - Universidad Nacional de
              Ingeniería.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className='bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow'>
      <div className='flex justify-center mb-4'>{icon}</div>
      <h3 className='text-xl font-semibold text-gray-900 mb-2'>{title}</h3>
      <p className='text-gray-600'>{description}</p>
    </div>
  );
}

interface ProcessStepProps {
  number: string;
  title: string;
  description: string;
}

function ProcessStep({ number, title, description }: ProcessStepProps) {
  return (
    <div className='text-center'>
      <div className='w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4'>
        {number}
      </div>
      <h3 className='text-lg font-semibold text-gray-900 mb-2'>{title}</h3>
      <p className='text-gray-600'>{description}</p>
    </div>
  );
}
