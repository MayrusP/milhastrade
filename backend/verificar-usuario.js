const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function verificarUsuario() {
  try {
    console.log('🔍 Buscando usuário mayrus.possa@gmail.com...\n');

    const user = await prisma.user.findUnique({
      where: { email: 'mayrus.possa@gmail.com' },
      include: {
        _count: {
          select: {
            offers: true,
            buyerTransactions: true,
            sellerTransactions: true,
          }
        }
      }
    });

    if (!user) {
      console.log('❌ Usuário não encontrado!\n');
      console.log('Criando usuário...\n');
      
      const hashedPassword = await bcrypt.hash('senha123', 10);
      
      const newUser = await prisma.user.create({
        data: {
          email: 'mayrus.possa@gmail.com',
          password: hashedPassword,
          name: 'Mayrus Possa',
          phone: '(11) 99999-9999',
          role: 'ADMIN',
          credits: 50000,
          isVerified: true,
        }
      });

      console.log('✅ Usuário criado com sucesso!\n');
      console.log('📧 Email:', newUser.email);
      console.log('🔑 Senha:', 'senha123');
      console.log('👑 Role:', newUser.role);
      console.log('💰 Créditos:', newUser.credits);
      
    } else {
      console.log('✅ Usuário encontrado!\n');
      console.log('📧 Email:', user.email);
      console.log('👤 Nome:', user.name);
      console.log('📱 Telefone:', user.phone || 'Não informado');
      console.log('👑 Role:', user.role);
      console.log('💰 Créditos:', user.credits);
      console.log('✅ Verificado:', user.isVerified ? 'Sim' : 'Não');
      console.log('📅 Criado em:', user.createdAt);
      console.log('🔄 Atualizado em:', user.updatedAt);
      console.log('\n📊 Estatísticas:');
      console.log('  - Ofertas:', user._count.offers);
      console.log('  - Compras:', user._count.buyerTransactions);
      console.log('  - Vendas:', user._count.sellerTransactions);
      
      console.log('\n🔧 Resetando senha para "senha123"...\n');
      
      const hashedPassword = await bcrypt.hash('senha123', 10);
      
      await prisma.user.update({
        where: { email: 'mayrus.possa@gmail.com' },
        data: { 
          password: hashedPassword,
          isVerified: true,
          role: 'ADMIN'
        }
      });

      console.log('✅ Senha resetada com sucesso!');
      console.log('🔑 Nova senha: senha123');
    }

    console.log('\n✅ Você pode fazer login agora com:');
    console.log('   Email: mayrus.possa@gmail.com');
    console.log('   Senha: senha123\n');

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarUsuario();
