import { PrismaClient, Prisma } from '@prisma/client';
import { CreateTransactionInput, UpdateTransactionStatusInput } from '../utils/validation';
import { ErrorCodes, DEFAULT_PAGINATION } from '../utils/constants';

const prisma = new PrismaClient();

export class TransactionService {
  static async createTransaction(buyerId: string, data: CreateTransactionInput) {
    // Get offer details
    const offer = await prisma.offer.findUnique({
      where: { id: data.offerId },
      include: {
        user: true,
      },
    });

    if (!offer) {
      throw new Error(ErrorCodes.NOT_FOUND);
    }

    // Check if offer is available
    if (offer.status !== 'ACTIVE') {
      throw new Error(ErrorCodes.OFFER_NOT_AVAILABLE);
    }

    // Check if buyer is not the seller
    if (offer.userId === buyerId) {
      throw new Error(ErrorCodes.TRANSACTION_FAILED);
    }

    // Check if there's already a pending transaction for this offer
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        offerId: data.offerId,
        status: 'PENDING',
      },
    });

    if (existingTransaction) {
      throw new Error(ErrorCodes.OFFER_NOT_AVAILABLE);
    }

    const transaction = await prisma.transaction.create({
      data: {
        buyerId,
        sellerId: offer.userId,
        offerId: data.offerId,
        amount: offer.price,
      },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        offer: {
          include: {
            airline: true,
          },
        },
      },
    });

    return transaction;
  }

  static async getUserTransactions(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const where: Prisma.TransactionWhereInput = {
      OR: [
        { buyerId: userId },
        { sellerId: userId },
      ],
    };

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          buyer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          seller: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          offer: {
            include: {
              airline: true,
            },
          },
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getTransactionById(id: string, userId: string) {
    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        OR: [
          { buyerId: userId },
          { sellerId: userId },
        ],
      },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        offer: {
          include: {
            airline: true,
          },
        },
      },
    });

    if (!transaction) {
      throw new Error(ErrorCodes.NOT_FOUND);
    }

    return transaction;
  }

  static async updateTransactionStatus(
    id: string,
    userId: string,
    data: UpdateTransactionStatusInput
  ) {
    // Get transaction details
    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        OR: [
          { buyerId: userId },
          { sellerId: userId },
        ],
      },
      include: {
        offer: true,
      },
    });

    if (!transaction) {
      throw new Error(ErrorCodes.NOT_FOUND);
    }

    // Validate status transition
    const validTransitions = this.getValidStatusTransitions(
      transaction.status,
      userId,
      transaction.buyerId,
      transaction.sellerId
    );

    if (!validTransitions.includes(data.status)) {
      throw new Error(ErrorCodes.TRANSACTION_FAILED);
    }

    // Update transaction status
    const updatedTransaction = await prisma.transaction.update({
      where: { id },
      data: { status: data.status },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        offer: {
          include: {
            airline: true,
          },
        },
      },
    });

    // Update offer status if transaction is completed or cancelled
    if (data.status === 'COMPLETED') {
      await prisma.offer.update({
        where: { id: transaction.offerId },
        data: { status: 'SOLD' },
      });
    } else if (data.status === 'CANCELLED') {
      // Make offer available again
      await prisma.offer.update({
        where: { id: transaction.offerId },
        data: { status: 'ACTIVE' },
      });
    }

    return updatedTransaction;
  }

  private static getValidStatusTransitions(
    currentStatus: string,
    userId: string,
    buyerId: string,
    sellerId: string
  ): string[] {
    const isBuyer = userId === buyerId;
    const isSeller = userId === sellerId;

    switch (currentStatus) {
      case 'PENDING':
        if (isSeller) {
          return ['CONFIRMED', 'CANCELLED'];
        }
        if (isBuyer) {
          return ['CANCELLED'];
        }
        return [];

      case 'CONFIRMED':
        if (isBuyer) {
          return ['COMPLETED', 'CANCELLED'];
        }
        if (isSeller) {
          return ['CANCELLED'];
        }
        return [];

      case 'COMPLETED':
      case 'CANCELLED':
        return []; // Final states

      default:
        return [];
    }
  }

  static async getTransactionStats(userId: string) {
    const [
      totalBought,
      totalSold,
      pendingAsBuyer,
      pendingAsSeller,
      completedTransactions,
    ] = await Promise.all([
      prisma.transaction.count({
        where: {
          buyerId: userId,
          status: 'COMPLETED',
        },
      }),
      prisma.transaction.count({
        where: {
          sellerId: userId,
          status: 'COMPLETED',
        },
      }),
      prisma.transaction.count({
        where: {
          buyerId: userId,
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
      }),
      prisma.transaction.count({
        where: {
          sellerId: userId,
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
      }),
      prisma.transaction.aggregate({
        where: {
          OR: [
            { buyerId: userId },
            { sellerId: userId },
          ],
          status: 'COMPLETED',
        },
        _sum: {
          amount: true,
        },
      }),
    ]);

    return {
      totalBought,
      totalSold,
      pendingAsBuyer,
      pendingAsSeller,
      totalTransactionValue: completedTransactions._sum.amount || 0,
    };
  }
}