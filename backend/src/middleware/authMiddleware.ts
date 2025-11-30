import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { ErrorCodes, HttpStatus } from '../utils/constants';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
    id: string;
    role: string;
  };
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: 'Token de acesso não fornecido',
        code: ErrorCodes.UNAUTHORIZED,
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    const decoded = verifyToken(token);
    
    // Buscar dados completos do usuário incluindo role
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true
      }
    });

    if (!user) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: 'Usuário não encontrado',
        code: ErrorCodes.UNAUTHORIZED,
      });
    }

    // Adicionar dados do usuário ao request
    (req as any).user = {
      userId: user.id,
      id: user.id, // Para compatibilidade
      email: user.email,
      role: user.role
    };

    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: 'Token inválido',
        code: ErrorCodes.UNAUTHORIZED,
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: 'Token expirado',
        code: ErrorCodes.UNAUTHORIZED,
      });
    }

    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Erro interno do servidor',
      code: ErrorCodes.INTERNAL_SERVER_ERROR,
    });
  }
};