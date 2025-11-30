import api from './api';
import { 
  Transaction, 
  CreateTransactionRequest, 
  UpdateTransactionStatusRequest, 
  TransactionListResponse,
  TransactionStats,
  ApiResponse 
} from '@/types';

export class TransactionService {
  static async createTransaction(data: CreateTransactionRequest): Promise<Transaction> {
    const response = await api.post<ApiResponse<{ transaction: Transaction }>>('/transactions', data);
    
    if (response.data.success && response.data.data) {
      return response.data.data.transaction;
    }
    
    throw new Error(response.data.message || 'Erro ao iniciar transação');
  }

  static async getUserTransactions(page = 1, limit = 20): Promise<TransactionListResponse> {
    const response = await api.get<ApiResponse<TransactionListResponse>>(
      `/transactions/user?page=${page}&limit=${limit}`
    );
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Erro ao buscar transações');
  }

  static async getTransactionById(id: string): Promise<Transaction> {
    const response = await api.get<ApiResponse<{ transaction: Transaction }>>(`/transactions/${id}`);
    
    if (response.data.success && response.data.data) {
      return response.data.data.transaction;
    }
    
    throw new Error(response.data.message || 'Erro ao buscar transação');
  }

  static async updateTransactionStatus(
    id: string, 
    data: UpdateTransactionStatusRequest
  ): Promise<Transaction> {
    const response = await api.put<ApiResponse<{ transaction: Transaction }>>(
      `/transactions/${id}/status`, 
      data
    );
    
    if (response.data.success && response.data.data) {
      return response.data.data.transaction;
    }
    
    throw new Error(response.data.message || 'Erro ao atualizar status da transação');
  }

  static async getTransactionStats(): Promise<TransactionStats> {
    const response = await api.get<ApiResponse<{ stats: TransactionStats }>>('/transactions/stats');
    
    if (response.data.success && response.data.data) {
      return response.data.data.stats;
    }
    
    throw new Error(response.data.message || 'Erro ao buscar estatísticas');
  }
}