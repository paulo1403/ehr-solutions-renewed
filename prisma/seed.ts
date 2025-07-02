/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Crear clínica de ejemplo
  const clinic = await prisma.clinic.upsert({
    where: { license: 'CLI-EJEMPLO-001' },
    update: {},
    create: {
      name: 'Clínica Ejemplo',
      license: 'CLI-EJEMPLO-001',
      street: 'Av. Principal 123',
      city: 'Lima',
      state: 'Lima',
      zipCode: '15001',
      phone: '+51 1 234-5678',
      email: 'admin@clinica-ejemplo.com',
      website: 'https://clinica-ejemplo.com',
      specialties: ['CARDIOLOGY', 'GENERAL_MEDICINE'],
      isActive: true,
    },
  });

  console.log('✅ Clínica creada:', clinic);

  // Crear usuario administrador
  const bcrypt = await import('bcryptjs');
  const hashedPassword = await bcrypt.hash('admin123456', 12);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@clinica-ejemplo.com' },
    update: {},
    create: {
      email: 'admin@clinica-ejemplo.com',
      passwordHash: hashedPassword,
      firstName: 'Admin',
      lastName: 'Sistema',
      role: 'CLINIC_ADMIN',
      clinicId: clinic.id,
      isActive: true,
    },
  });

  console.log('✅ Usuario administrador creado:', {
    id: adminUser.id,
    email: adminUser.email,
    name: `${adminUser.firstName} ${adminUser.lastName}`,
  });

  console.log('🎉 Seeding completado!');
  console.log('\n📝 Datos de prueba:');
  console.log(`📧 Email: admin@clinica-ejemplo.com`);
  console.log(`🔑 Password: admin123456`);
  console.log(`🏥 Clínica ID: ${clinic.id}`);
}

main()
  .catch(e => {
    console.error('❌ Error durante el seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
