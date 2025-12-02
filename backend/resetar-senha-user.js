const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetarSenha() {
  try {
    console.log('🔍 Buscando usuário user@test.com...\n');

    const user = await prisma.user.findUnique({
      where: { email: 'user@test.com' }
    });

    if (!user) {
      console.log('❌ Usuário não encontrado!\n');
      console.log('Criando usuário...\n');
      
      const hashedPassword = await bcrypt.hash('senha123', 10);
      
      const newUser = await prisma.user.create({
        data: {
          email: 'user@test.com',
          password: hashedPassword,
          name: 'Usuário Teste',
          phone: '(11) 98888-8888',
          role: 'USER',
          credits: 5000,
          isVerified: false,
        }
      });

      console.log('✅ Usuário criado com sucesso!\n');
      console.log('📧 Email:', newUser.email);
      console.log('🔑 Senha:', 'senha123');
      console.log('👤 Role:', newUser.role);
      console.log('💰 Créditos:', newUser.credits);
      console.log('✅ Verificado:', newUser.isVerified ? 'Sim' : 'Não');
      
    } else {
      console.log('✅ Usuário encontrado!\n');
      console.log('📧 Email:', user.email);
      console.log('👤 Nome:', user.name);
      console.log('👤 Role:', user.role);
      console.log('💰 Créditos:', user.credits);
      console.log('✅ Verificado:', user.isVerified ? 'Sim' : 'Não');
      
      console.log('\n🔧 Resetando senha para "senha123"...\n');
      
      const hashedPassword = await bcrypt.hash('senha123', 10);
      
      await prisma.user.update({
        where: { email: 'user@test.com' },
        data: { 
          password: hashedPassword
        }
      });

      console.log('✅ Senha resetada com sucesso!');
      console.log('🔑 Nova senha: senha123');
    }

    console.log('\n✅ Você pode fazer login agora com:');
    console.log('   Email: user@test.com');
    console.log('   Senha: senha123\n');

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetarSenha();
