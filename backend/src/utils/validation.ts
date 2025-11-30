import { z } from 'zod';

// User validation schemas
export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número'),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

// Offer validation schemas
export const createOfferSchema = z.object({
  title: z.string().min(5, 'Título deve ter pelo menos 5 caracteres'),
  description: z.string().optional(),
  milesAmount: z.number().int().positive('Quantidade de milhas deve ser positiva'),
  price: z.number().positive('Preço deve ser positivo'),
  type: z.enum(['SALE', 'EXCHANGE']),
  airlineId: z.string().cuid('ID da companhia aérea inválido'),
});

export const updateOfferSchema = createOfferSchema.partial();

// Transaction validation schemas
export const createTransactionSchema = z.object({
  offerId: z.string().cuid('ID da oferta inválido'),
});

export const updateTransactionStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']),
});

// Query validation schemas
export const offerQuerySchema = z.object({
  airlineId: z.string().cuid().optional(),
  type: z.enum(['SALE', 'EXCHANGE']).optional(),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  minMiles: z.number().int().positive().optional(),
  maxMiles: z.number().int().positive().optional(),
  sortBy: z.enum(['price', 'milesAmount', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateOfferInput = z.infer<typeof createOfferSchema>;
export type UpdateOfferInput = z.infer<typeof updateOfferSchema>;
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionStatusInput = z.infer<typeof updateTransactionStatusSchema>;
export type OfferQueryInput = z.infer<typeof offerQuerySchema>;