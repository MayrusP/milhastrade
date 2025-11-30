import { Request, Response } from 'express';
import { userService } from '../services/userService';

export const userController = {
  // Obter perfil do usuário
  async getProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const user = await userService.getUserProfile(userId);
      res.json(user);
    } catch (error) {
      console.error('Erro ao obter perfil:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  // Adicionar créditos
  async addCredits(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { amount } = req.body;

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Valor deve ser maior que zero' });
      }

      const updatedUser = await userService.addCredits(userId, amount);
      res.json({
        message: 'Créditos adicionados com sucesso',
        credits: updatedUser.credits
      });
    } catch (error) {
      console.error('Erro ao adicionar créditos:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  // Atualizar perfil
  async updateProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { name, phone } = req.body;

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const updatedUser = await userService.updateProfile(userId, { name, phone });
      res.json({
        message: 'Perfil atualizado com sucesso',
        user: updatedUser
      });
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
};