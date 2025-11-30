import { PrismaClient, Prisma } from '@prisma/client';
import { CreateOfferInput, UpdateOfferInput, OfferQueryInput } from '../utils/validation';
import { ErrorCodes, DEFAULT_PAGINATION } from '../utils/constants';

const prisma = new PrismaClient();

export class OfferService {
  static async createOffer(userId: string, data: CreateOfferInput) {
    // Verify airline exists
    const airline = await prisma.airline.findUnique({
      where: { id: data.airlineId },
    });

    if (!airline) {
      throw new Error(ErrorCodes.NOT_FOUND);
    }

    const offer = await prisma.offer.create({
      data: {
        ...data,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        airline: true,
      },
    });

    return offer;
  }

  static async getOffers(query: OfferQueryInput = {}) {
    const {
      airlineId,
      type,
      minPrice,
      maxPrice,
      minMiles,
      maxMiles,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = DEFAULT_PAGINATION.page,
      limit = DEFAULT_PAGINATION.limit,
    } = query;

    const where: Prisma.OfferWhereInput = {
      status: 'ACTIVE',
    };

    // Apply filters
    if (airlineId) {
      where.airlineId = airlineId;
    }

    if (type) {
      where.type = type;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = minPrice;
      if (maxPrice) where.price.lte = maxPrice;
    }

    if (minMiles || maxMiles) {
      where.milesAmount = {};
      if (minMiles) where.milesAmount.gte = minMiles;
      if (maxMiles) where.milesAmount.lte = maxMiles;
    }

    const orderBy: Prisma.OfferOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    const skip = (page - 1) * limit;

    const [offers, total] = await Promise.all([
      prisma.offer.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          airline: true,
        },
      }),
      prisma.offer.count({ where }),
    ]);

    return {
      offers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getOfferById(id: string) {
    const offer = await prisma.offer.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        airline: true,
      },
    });

    if (!offer) {
      throw new Error(ErrorCodes.NOT_FOUND);
    }

    return offer;
  }

  static async updateOffer(id: string, userId: string, data: UpdateOfferInput) {
    // Check if offer exists and belongs to user
    const existingOffer = await prisma.offer.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingOffer) {
      throw new Error(ErrorCodes.NOT_FOUND);
    }

    // If airlineId is being updated, verify it exists
    if (data.airlineId) {
      const airline = await prisma.airline.findUnique({
        where: { id: data.airlineId },
      });

      if (!airline) {
        throw new Error(ErrorCodes.NOT_FOUND);
      }
    }

    const offer = await prisma.offer.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        airline: true,
      },
    });

    return offer;
  }

  static async deleteOffer(id: string, userId: string) {
    // Check if offer exists and belongs to user
    const existingOffer = await prisma.offer.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingOffer) {
      throw new Error(ErrorCodes.NOT_FOUND);
    }

    // Check if offer has pending transactions
    const pendingTransactions = await prisma.transaction.findFirst({
      where: {
        offerId: id,
        status: 'PENDING',
      },
    });

    if (pendingTransactions) {
      throw new Error(ErrorCodes.OFFER_NOT_AVAILABLE);
    }

    await prisma.offer.delete({
      where: { id },
    });

    return { message: 'Oferta removida com sucesso' };
  }

  static async getUserOffers(userId: string, query: OfferQueryInput = {}) {
    const {
      type,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = DEFAULT_PAGINATION.page,
      limit = DEFAULT_PAGINATION.limit,
    } = query;

    const where: Prisma.OfferWhereInput = {
      userId,
    };

    if (type) {
      where.type = type;
    }

    const orderBy: Prisma.OfferOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    const skip = (page - 1) * limit;

    const [offers, total] = await Promise.all([
      prisma.offer.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          airline: true,
          transactions: {
            select: {
              id: true,
              status: true,
              createdAt: true,
              buyer: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      }),
      prisma.offer.count({ where }),
    ]);

    return {
      offers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getAirlines() {
    return await prisma.airline.findMany({
      orderBy: { name: 'asc' },
    });
  }
}