import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { registerSchema, loginSchema } from '../utils/validation';
import { ErrorCodes, HttpStatus } from '../utils/constants';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const validatedData = registerSchema.parse(req.body);
      const result = await AuthService.register(validatedData);

      res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'Usuário registrado com sucesso',
        data: result,
      });
    } catch (error: any) {
      if (error.message === ErrorCodes.DUPLICATE_EMAIL) {
        return res.status(HttpStatus.CONFLICT).json({
          success: false,
          message: 'Email já está em uso',
          code: ErrorCodes.DUPLICATE_EMAIL,
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

  static async login(req: Request, res: Response) {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await AuthService.login(validatedData);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Login realizado com sucesso',
        data: result,
      });
    } catch (error: any) {
      if (error.message === ErrorCodes.INVALID_CREDENTIALS) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          success: false,
          message: 'Email ou senha inválidos',
          code: ErrorCodes.INVALID_CREDENTIALS,
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

  static async me(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const user = await AuthService.getUserById(userId);

      res.status(HttpStatus.OK).json({
        success: true,
        data: { user },
      });
    } catch (error: any) {
      if (error.message === ErrorCodes.NOT_FOUND) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: 'Usuário não encontrado',
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

  static async logout(req: Request, res: Response) {
    // Since we're using stateless JWT, logout is handled on the client side
    // by removing the token from storage
    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Logout realizado com sucesso',
    });
  }
}