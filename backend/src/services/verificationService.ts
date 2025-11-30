import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type VerificationStatus = 'NOT_SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED';
export type DocumentType = 'RG' | 'CNH';

export interface CreateVerificationData {
  userId: string;
  documentType: DocumentType;
  documentFrontUrl: string;
  documentBackUrl: string;
}

export interface ReviewVerificationData {
  verificationId: string;
  action: 'APPROVE' | 'REJECT';
  rejectionReason?: string;
  reviewedBy: string;
}

export const verificationService = {
  // Criar ou atualizar verificação do usuário
  async createOrUpdateVerification(data: CreateVerificationData) {
    const existingVerification = await prisma.userVerification.findUnique({
      where: { userId: data.userId }
    });

    if (existingVerification) {
      return await prisma.userVerification.update({
        where: { userId: data.userId },
        data: {
          status: 'PENDING',
          documentType: data.documentType,
          documentFrontUrl: data.documentFrontUrl,
          documentBackUrl: data.documentBackUrl,
          rejectionReason: null,
          reviewedBy: null,
          reviewedAt: null,
          updatedAt: new Date()
        }
      });
    } else {
      return await prisma.userVerification.create({
        data: {
          userId: data.userId,
          status: 'PENDING',
          documentType: data.documentType,
          documentFrontUrl: data.documentFrontUrl,
          documentBackUrl: data.documentBackUrl
        }
      });
    }
  },

  // Buscar status de verificação do usuário
  async getUserVerificationStatus(userId: string) {
    const verification = await prisma.userVerification.findUnique({
      where: { userId },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!verification) {
      return {
        status: 'NOT_SUBMITTED' as VerificationStatus,
        submittedAt: null,
        rejectionReason: null,
        reviewedAt: null,
        reviewedBy: null
      };
    }

    return {
      status: verification.status,
      submittedAt: verification.createdAt,
      rejectionReason: verification.rejectionReason,
      reviewedAt: verification.reviewedAt,
      reviewedBy: verification.reviewer?.name || null,
      documentType: verification.documentType
    };
  },

  // Listar verificações pendentes (admin)
  async getPendingVerifications() {
    return await prisma.userVerification.findMany({
      where: {
        status: 'PENDING'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc' // Mais antigas primeiro
      }
    });
  },

  // Revisar verificação (aprovar/rejeitar)
  async reviewVerification(data: ReviewVerificationData) {
    const verification = await prisma.userVerification.findUnique({
      where: { id: data.verificationId },
      include: { user: true }
    });

    if (!verification) {
      throw new Error('Verificação não encontrada');
    }

    if (verification.status !== 'PENDING') {
      throw new Error('Verificação não está pendente');
    }

    const newStatus = data.action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    
    // Atualizar verificação
    const updatedVerification = await prisma.userVerification.update({
      where: { id: data.verificationId },
      data: {
        status: newStatus,
        rejectionReason: data.action === 'REJECT' ? data.rejectionReason : null,
        reviewedBy: data.reviewedBy,
        reviewedAt: new Date()
      }
    });

    // Atualizar campo is_verified do usuário
    await prisma.user.update({
      where: { id: verification.userId },
      data: {
        isVerified: data.action === 'APPROVE'
      }
    });

    // Criar notificação para o usuário
    const notificationTitle = data.action === 'APPROVE' 
      ? '✅ Verificação Aprovada!' 
      : '❌ Verificação Rejeitada';
    
    const notificationMessage = data.action === 'APPROVE'
      ? 'Parabéns! Sua identidade foi verificada com sucesso.'
      : `Sua verificação foi rejeitada. Motivo: ${data.rejectionReason}`;

    await prisma.notification.create({
      data: {
        userId: verification.userId,
        type: 'VERIFICATION_STATUS',
        title: notificationTitle,
        message: notificationMessage,
        data: JSON.stringify({
          verificationId: data.verificationId,
          status: newStatus,
          rejectionReason: data.rejectionReason
        })
      }
    });

    return updatedVerification;
  },

  // Buscar verificação por ID
  async getVerificationById(verificationId: string) {
    return await prisma.userVerification.findUnique({
      where: { id: verificationId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true
          }
        },
        reviewer: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
  },

  // Estatísticas de verificação
  async getVerificationStats() {
    const [total, pending, approved, rejected] = await Promise.all([
      prisma.userVerification.count(),
      prisma.userVerification.count({ where: { status: 'PENDING' } }),
      prisma.userVerification.count({ where: { status: 'APPROVED' } }),
      prisma.userVerification.count({ where: { status: 'REJECTED' } })
    ]);

    const totalUsers = await prisma.user.count();
    const verifiedUsers = await prisma.user.count({ where: { isVerified: true } });

    return {
      total,
      pending,
      approved,
      rejected,
      totalUsers,
      verifiedUsers,
      verificationRate: totalUsers > 0 ? (verifiedUsers / totalUsers) * 100 : 0
    };
  }
};