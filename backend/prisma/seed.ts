import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create airlines
  const airlines = [
    { name: 'TAM Linhas Aéreas', code: 'JJ' },
    { name: 'Gol Linhas Aéreas', code: 'G3' },
    { name: 'Azul Linhas Aéreas', code: 'AD' },
    { name: 'LATAM Airlines', code: 'LA' },
    { name: 'American Airlines', code: 'AA' },
    { name: 'Delta Air Lines', code: 'DL' },
    { name: 'United Airlines', code: 'UA' },
    { name: 'Emirates', code: 'EK' },
    { name: 'Lufthansa', code: 'LH' },
    { name: 'Air France', code: 'AF' },
  ];

  console.log('Seeding airlines...');
  for (const airline of airlines) {
    await prisma.airline.upsert({
      where: { code: airline.code },
      update: {},
      create: airline,
    });
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });