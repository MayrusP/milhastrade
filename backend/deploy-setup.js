/**
 * Script para preparar o banco de dados PostgreSQL na AWS
 * Execute este script DEPOIS de rodar as migrations
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Iniciando setup do banco de dados...\n');

  try {
    // 1. Criar companhias aéreas
    console.log('✈️  Criando companhias aéreas...');
    const airlines = [
      { name: 'LATAM Airlines', code: 'LA' },
      { name: 'Gol Linhas Aéreas', code: 'G3' },
      { name: 'Azul Linhas Aéreas', code: 'AD' },
      { name: 'American Airlines', code: 'AA' },
      { name: 'United Airlines', code: 'UA' },
      { name: 'Delta Air Lines', code: 'DL' },
      { name: 'Emirates', code: 'EK' },
      { name: 'Air France', code: 'AF' },
      { name: 'Lufthansa', code: 'LH' },
      { name: 'TAP Air Portugal', code: 'TP' }
    ];

    for (const airline of airlines) {
      await prisma.airline.upsert({
        where: { code: airline.code },
        update: {},
        create: airline
      });
    }
    console.log(`✅ ${airlines.length} companhias aéreas criadas!\n`);

    // 2. Criar usuários de teste
    console.log('👥 Criando usuários de teste...');
    
    const users = [
      {
        email: 'mayrus@admin.com',
        password: await bcrypt.hash('senha123', 10),
        name: 'Mayrus Admin',
        phone: '11999999999',
        role: 'ADMIN',
        credits: 10000.0,
        isVerified: true
      },
      {
        email: 'teste@teste.com',
        password: await bcrypt.hash('senha123', 10),
        name: 'Usuário Teste',
        phone: '11988888888',
        role: 'USER',
        credits: 1000.0,
        isVerified: true
      },
      {
        email: 'vendedor@teste.com',
        password: await bcrypt.hash('senha123', 10),
        name: 'Vendedor Teste',
        phone: '11977777777',
        role: 'VIP',
        credits: 5000.0,
        isVerified: true
      }
    ];

    for (const userData of users) {
      await prisma.user.upsert({
        where: { email: userData.email },
        update: {},
        create: userData
      });
    }
    console.log(`✅ ${users.length} usuários criados!\n`);

    // 3. Criar algumas ofertas de exemplo
    console.log('🎫 Criando ofertas de exemplo...');
    
    const latam = await prisma.airline.findUnique({ where: { code: 'LA' } });
    const gol = await prisma.airline.findUnique({ where: { code: 'G3' } });
    const vendedor = await prisma.user.findUnique({ where: { email: 'vendedor@teste.com' } });

    if (latam && gol && vendedor) {
      const offers = [
        {
          title: '50.000 milhas LATAM',
          description: 'Milhas LATAM Pass válidas por 12 meses',
          milesAmount: 50000,
          price: 1500.0,
          type: 'SALE',
          status: 'ACTIVE',
          userId: vendedor.id,
          airlineId: latam.id
        },
        {
          title: '30.000 milhas Gol',
          description: 'Milhas Smiles prontas para uso',
          milesAmount: 30000,
          price: 900.0,
          type: 'SALE',
          status: 'ACTIVE',
          userId: vendedor.id,
          airlineId: gol.id
        }
      ];

      for (const offer of offers) {
        await prisma.offer.create({ data: offer });
      }
      console.log(`✅ ${offers.length} ofertas criadas!\n`);
    }

    console.log('🎉 Setup concluído com sucesso!\n');
    console.log('📋 Credenciais de acesso:');
    console.log('   Admin: mayrus@admin.com / senha123');
    console.log('   Usuário: teste@teste.com / senha123');
    console.log('   Vendedor: vendedor@teste.com / senha123\n');

  } catch (error) {
    console.error('❌ Erro durante o setup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
