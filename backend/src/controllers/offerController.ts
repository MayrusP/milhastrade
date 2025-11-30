import { Request, Response } from 'express';
import { OfferService } from '../services/offerService';
import { createOfferSchema, updateOfferSchema, offerQuerySchema } from '../utils/validation';
import { ErrorCodes, HttpStatus } from '../utils/constants';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export class OfferController {
  static async createOffer(req: AuthenticatedRequest, res: Response) {
    try {
      const validatedData = createOfferSchema.parse(req.body);
      const userId = req.user.userId;

      const offer = await OfferService.createOffer(userId, validatedData);

      res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'Oferta criada com sucesso',
        data: { offer },
      });
    } catch (error: any) {
      if (error.message === ErrorCodes.NOT_FOUND) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: 'Companhia aérea não encontrada',
          code: ErrorCodes.NOT_FOUND,
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

  static async getOffers(req: Request, res: Response) {
    try {
      const query = offerQuerySchema.parse(req.query);
      const result = await OfferService.getOffers(query);

      res.status(HttpStatus.OK).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'Parâmetros de consulta inválidos',
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

  static async getOfferById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const offer = await OfferService.getOfferById(id);

      res.status(HttpStatus.OK).json({
        success: true,
        data: { offer },
      });
    } catch (error: any) {
      if (error.message === ErrorCodes.NOT_FOUND) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: 'Oferta não encontrada',
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

  static async updateOffer(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const validatedData = updateOfferSchema.parse(req.body);
      const userId = req.user.userId;

      const offer = await OfferService.updateOffer(id, userId, validatedData);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Oferta atualizada com sucesso',
        data: { offer },
      });
    } catch (error: any) {
      if (error.message === ErrorCodes.NOT_FOUND) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: 'Oferta não encontrada ou você não tem permissão para editá-la',
          code: ErrorCodes.NOT_FOUND,
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

  static async deleteOffer(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const result = await OfferService.deleteOffer(id, userId);

      res.status(HttpStatus.OK).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      if (error.message === ErrorCodes.NOT_FOUND) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: 'Oferta não encontrada ou você não tem permissão para removê-la',
          code: ErrorCodes.NOT_FOUND,
        });
      }

      if (error.message === ErrorCodes.OFFER_NOT_AVAILABLE) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'Não é possível remover oferta com transações pendentes',
          code: ErrorCodes.OFFER_NOT_AVAILABLE,
        });
      }

      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Erro interno do servidor',
        code: ErrorCodes.INTERNAL_SERVER_ERROR,
      });
    }
  }

  static async getUserOffers(req: AuthenticatedRequest, res: Response) {
    try {
      const query = offerQuerySchema.parse(req.query);
      const userId = req.user.userId;

      const result = await OfferService.getUserOffers(userId, query);

      res.status(HttpStatus.OK).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'Parâmetros de consulta inválidos',
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

  static async getAirlines(req: Request, res: Response) {
    try {
      const airlines = await OfferService.getAirlines();

      res.status(HttpStatus.OK).json({
        success: true,
        data: { airlines },
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