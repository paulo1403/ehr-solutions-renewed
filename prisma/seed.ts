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

  // Crear usuario administrador de clínica
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

  console.log('✅ Usuario administrador de clínica creado:', {
    id: adminUser.id,
    email: adminUser.email,
    name: `${adminUser.firstName} ${adminUser.lastName}`,
  });

  // Crear usuario super administrador
  const superAdminPassword = await bcrypt.hash('superadmin123', 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@ehrsolutions.com' },
    update: {},
    create: {
      email: 'superadmin@ehrsolutions.com',
      passwordHash: superAdminPassword,
      firstName: 'Super',
      lastName: 'Admin',
      role: 'SUPER_ADMIN',
      clinicId: clinic.id, // Asociamos a la clínica de ejemplo
      isActive: true,
    },
  });

  console.log('✅ Super administrador creado:', {
    id: superAdmin.id,
    email: superAdmin.email,
    name: `${superAdmin.firstName} ${superAdmin.lastName}`,
  });

  console.log('🎉 Seeding completado!');
  console.log('\n📝 Datos de prueba:');
  console.log(`\n� ADMINISTRADOR DE CLÍNICA:`);
  console.log(`�📧 Email: admin@clinica-ejemplo.com`);
  console.log(`🔑 Password: admin123456`);
  console.log(`\n👑 SUPER ADMINISTRADOR:`);
  console.log(`📧 Email: superadmin@ehrsolutions.com`);
  console.log(`🔑 Password: superadmin123`);
  console.log(`\n🏥 Clínica ID: ${clinic.id}`);
}

main()
  .catch(e => {
    console.error('❌ Error durante el seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
