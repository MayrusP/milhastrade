import { Request, Response } from 'express';
import { TransactionService } from '../services/transactionService';
import { createTransactionSchema, updateTransactionStatusSchema } from '../utils/validation';
import { ErrorCodes, HttpStatus } from '../utils/constants';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export class TransactionController {
  static async createTransaction(req: AuthenticatedRequest, res: Response) {
    try {
      const validatedData = createTransactionSchema.parse(req.body);
      const buyerId = req.user.userId;

      const transaction = await TransactionService.createTransaction(buyerId, validatedData);

      res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'Transação iniciada com sucesso',
        data: { transaction },
      });
    } catch (error: any) {
      if (error.message === ErrorCodes.NOT_FOUND) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: 'Oferta não encontrada',
          code: ErrorCodes.NOT_FOUND,
        });
      }

      if (error.message === ErrorCodes.OFFER_NOT_AVAILABLE) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'Oferta não está disponível para transação',
          code: ErrorCodes.OFFER_NOT_AVAILABLE,
        });
      }

      if (error.message === ErrorCodes.TRANSACTION_FAILED) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'Não é possível comprar sua própria oferta',
          code: ErrorCodes.TRANSACTION_FAILED,
        });
      }

      if (error.name === 'ZodError') {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'Dados inválidos',
          code: ErrorCodes.VALIDATION_ERROR,
          errors: error.errors,
        });
      }

      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Erro interno do servidor',
        code: ErrorCodes.INTERNAL_SERVER_ERROR,
      });
    }
  }

  static async getUserTransactions(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user.userId;
      const page = parseInt(req.query['page'] as string) || 1;
      const limit = parseInt(req.query['limit'] as string) || 20;

      const result = await TransactionService.getUserTransactions(userId, page, limit);

      res.status(HttpStatus.OK).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Erro interno do servidor',
        code: ErrorCodes.INTERNAL_SERVER_ERROR,
      });
    }
  }

  static async getTransactionById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const transaction = await TransactionService.getTransactionById(id, userId);

      res.status(HttpStatus.OK).json({
        success: true,
        data: { transaction },
      });
    } catch (error: any) {
      if (error.message === ErrorCodes.NOT_FOUND) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: 'Transação não encontrada',
          code: ErrorCodes.NOT_FOUND,
        });
      }

      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Erro interno do servidor',
        code: ErrorCodes.INTERNAL_SERVER_ERROR,
      });
    }
  }

  static async updateTransactionStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const validatedData = updateTransactionStatusSchema.parse(req.body);
      const userId = req.user.userId;

      const transaction = await TransactionService.updateTransactionStatus(
        id,
        userId,
        validatedData
      );

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Status da transação atualizado com sucesso',
        data: { transaction },
      });
    } catch (error: any) {
      if (error.message === ErrorCodes.NOT_FOUND) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: 'Transação não encontrada',
          code: ErrorCodes.NOT_FOUND,
        });
      }

      if (error.message === ErrorCodes.TRANSACTION_FAILED) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'Transição de status inválida',
          code: ErrorCodes.TRANSACTION_FAILED,
        });
      }

      if (error.name === 'ZodError') {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'Dados inválidos',
          code: ErrorCodes.VALIDATION_ERROR,
          errors: error.errors,
        });
      }

      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Erro interno do servidor',
        code: ErrorCodes.INTERNAL_SERVER_ERROR,
      });
    }
  }

  static async getTransactionStats(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user.userId;
      const stats = await TransactionService.getTransactionStats(userId);

      res.status(HttpStatus.OK).json({
        success: true,
        data: { stats },
      });
    } catch (error: any) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Erro interno do servidor',
        code: ErrorCodes.INTERNAL_SERVER_ERROR,
      });
    }
  }
}