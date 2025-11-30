import { User } from './User';
import { Offer } from './Offer';

export type TransactionStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface Transaction {
  id: string;
  status: TransactionStatus;
  amount: number;
  createdAt: string;
  updatedAt: string;
  buyer: User;
  seller: User;
  offer: Offer;
}

export interface CreateTransactionRequest {
  offerId: string;
}

export interface UpdateTransactionStatusRequest {
  status: TransactionStatus;
}

export interface TransactionListResponse {
  transactions: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TransactionStats {
  totalBought: number;
  totalSold: number;
  pendingAsBuyer: number;
  pendingAsSeller: number;
  totalTransactionValue: number;
}