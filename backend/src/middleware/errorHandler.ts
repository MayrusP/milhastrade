import { Request, Response, NextFunction } from 'express';
import { ErrorCodes, HttpStatus } from '../utils/constants';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (
  error: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);

  // Default error response
  let statusCode = error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
  let message = error.message || 'Erro interno do servidor';
  let code = error.code || ErrorCodes.INTERNAL_SERVER_ERROR;

  // Handle specific error types
  if (error.name === 'ZodError') {
    statusCode = HttpStatus.BAD_REQUEST;
    message = 'Dados inválidos';
    code = ErrorCodes.VALIDATION_ERROR;
  }

  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    statusCode = HttpStatus.UNAUTHORIZED;
    message = 'Token inválido ou expirado';
    code = ErrorCodes.UNAUTHORIZED;
  }

  // Prisma errors
  if (error.name === 'PrismaClientKnownRequestError') {
    const prismaError = error as any;
    
    if (prismaError.code === 'P2002') {
      statusCode = HttpStatus.CONFLICT;
      message = 'Dados duplicados';
      code = ErrorCodes.DUPLICATE_EMAIL;
    }
    
    if (prismaError.code === 'P2025') {
      statusCode = HttpStatus.NOT_FOUND;
      message = 'Registro não encontrado';
      code = ErrorCodes.NOT_FOUND;
    }
  }

  res.status(statusCode).json({
    success: false,
    message,
    code,
    ...(process.env['NODE_ENV'] === 'development' && { stack: error.stack }),
  });
};