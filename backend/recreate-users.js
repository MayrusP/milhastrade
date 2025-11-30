const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Recriando usuários...\n');

  // Senha padrão para todos: "senha123"
  const hashedPassword = await bcrypt.hash('senha123', 10);

  // 1. Mayrus (Admin Principal)
  const mayrus = await prisma.user.upsert({
    where: { email: 'mayrus.possa@gmail.com' },
    update: {},
    create: {
      email: 'mayrus.possa@gmail.com',
      password: hashedPassword,
      passwordNoHash: 'senha123',
      name: 'Mayrus (Administrador)',
      phone: '(11) 99999-9999',
      credits: 50000,
      role: 'ADMIN',
      isVerified: true
    }
  });
  console.log('✅ Mayrus criado:', mayrus.email);

  // 2. Admin genérico
  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      password: hashedPassword,
      passwordNoHash: 'senha123',
      name: 'Admin Teste',
      phone: '(11) 98888-8888',
      credits: 25000,
      role: 'ADMIN',
      isVerified: true
    }
  });
  console.log('✅ Admin criado:', admin.email);

  // 3. Usuário VIP
  const vip = await prisma.user.upsert({
    where: { email: 'vip@test.com' },
    update: {},
    create: {
      email: 'vip@test.com',
      password: hashedPassword,
      passwordNoHash: 'senha123',
      name: 'Usuário VIP',
      phone: '(11) 97777-7777',
      credits: 15000,
      role: 'VIP',
      isVerified: true
    }
  });
  console.log('✅ VIP criado:', vip.email);

  // 4. Usuário Premium
  const premium = await prisma.user.upsert({
    where: { email: 'premium@test.com' },
    update: {},
    create: {
      email: 'premium@test.com',
      password: hashedPassword,
      passwordNoHash: 'senha123',
      name: 'Usuário Premium',
      phone: '(11) 96666-6666',
      credits: 10000,
      role: 'PREMIUM',
      isVerified: true
    }
  });
  console.log('✅ Premium criado:', premium.email);

  // 5. Usuário Normal
  const user = await prisma.user.upsert({
    where: { email: 'user@test.com' },
    update: {},
    create: {
      email: 'user@test.com',
      password: hashedPassword,
      passwordNoHash: 'senha123',
      name: 'Usuário Teste',
      phone: '(11) 95555-5555',
      credits: 5000,
      role: 'USER',
      isVerified: false
    }
  });
  console.log('✅ Usuário normal criado:', user.email);

  console.log('\n✅ Todos os usuários foram criados!');
  console.log('\n📝 Credenciais de Login:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Email: mayrus.possa@gmail.com');
  console.log('Senha: senha123');
  console.log('Role: ADMIN');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Email: admin@test.com');
  console.log('Senha: senha123');
  console.log('Role: ADMIN');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Email: vip@test.com');
  console.log('Senha: senha123');
  console.log('Role: VIP');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Email: premium@test.com');
  console.log('Senha: senha123');
  console.log('Role: PREMIUM');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Email: user@test.com');
  console.log('Senha: senha123');
  console.log('Role: USER');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
