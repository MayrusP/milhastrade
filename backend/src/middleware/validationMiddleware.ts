import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { ErrorCodes, HttpStatus } from '../utils/constants';

export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'Dados inválidos',
          code: ErrorCodes.VALIDATION_ERROR,
          errors: error.errors,
        });
      }

      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Erro interno do servidor',
        code: ErrorCodes.INTERNAL_SERVER_ERROR,
      });
    }
  };
};

export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'Parâmetros de consulta inválidos',
          code: ErrorCodes.VALIDATION_ERROR,
          errors: error.errors,
        });
      }

      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Erro interno do servidor',
        code: ErrorCodes.INTERNAL_SERVER_ERROR,
      });
    }
  };
};