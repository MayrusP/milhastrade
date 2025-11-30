import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const userService = {
  // Obter perfil completo do usuário
  async getUserProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        credits: true,
        createdAt: true,
        _count: {
          offers: true,
          buyerTransactions: true,
          sellerTransactions: true
        }
      }
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    return user;
  },

  // Adicionar créditos ao usuário
  async addCredits(userId: string, amount: number) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        credits: {
          increment: amount
        }
      },
      select: {
        id: true,
        credits: true
      }
    });

    return user;
  },

  // Debitar créditos do usuário
  async debitCredits(userId: string, amount: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true }
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    if (user.credits < amount) {
      throw new Error('Créditos insuficientes');
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        credits: {
          decrement: amount
        }
      },
      select: {
        id: true,
        credits: true
      }
    });

    return updatedUser;
  },

  // Atualizar perfil do usuário
  async updateProfile(userId: string, data: { name?: string; phone?: string }) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.phone && { phone: data.phone })
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        credits: true
      }
    });

    return user;
  },

  // Transferir créditos entre usuários
  async transferCredits(fromUserId: string, toUserId: string, amount: number) {
    return await prisma.$transaction(async (tx) => {
      // Verificar se o usuário remetente tem créditos suficientes
      const fromUser = await tx.user.findUnique({
        where: { id: fromUserId },
        select: { credits: true }
      });

      if (!fromUser || fromUser.credits < amount) {
        throw new Error('Créditos insuficientes');
      }

      // Debitar do remetente
      await tx.user.update({
        where: { id: fromUserId },
        data: {
          credits: {
            decrement: amount
          }
        }
      });

      // Creditar ao destinatário
      await tx.user.update({
        where: { id: toUserId },
        data: {
          credits: {
            increment: amount
          }
        }
      });

      return { success: true };
    });
  }
};