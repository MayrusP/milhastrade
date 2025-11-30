import { Request, Response } from 'express';
import { verificationService, DocumentType } from '../services/verificationService';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import path from 'path';

export const verificationController = {
  // Upload de documentos para verificação
  async uploadDocuments(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { documentType } = req.body;
      
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      // Validar tipo de documento
      if (!documentType || !['RG', 'CNH'].includes(documentType)) {
        return res.status(400).json({ 
          error: 'Tipo de documento inválido. Use RG ou CNH.' 
        });
      }

      // Verificar se os arquivos foram enviados
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      if (!files || !files.front || !files.back) {
        return res.status(400).json({ 
          error: 'É necessário enviar a frente e o verso do documento' 
        });
      }

      const frontFile = files.front[0];
      const backFile = files.back[0];

      // Construir URLs dos arquivos
      const frontUrl = `/uploads/verifications/${userId}/${frontFile.filename}`;
      const backUrl = `/uploads/verifications/${userId}/${backFile.filename}`;

      // Criar ou atualizar verificação
      const verification = await verificationService.createOrUpdateVerification({
        userId,
        documentType: documentType as DocumentType,
        documentFrontUrl: frontUrl,
        documentBackUrl: backUrl
      });

      res.json({
        success: true,
        message: 'Documentos enviados para análise com sucesso',
        data: {
          verificationId: verification.id,
          status: verification.status,
          submittedAt: verification.createdAt
        }
      });

    } catch (error) {
      console.error('Erro no upload de documentos:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  },

  // Obter status da verificação do usuário
  async getVerificationStatus(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const status = await verificationService.getUserVerificationStatus(userId);

      res.json({
        success: true,
        data: status
      });

    } catch (error) {
      console.error('Erro ao obter status de verificação:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  },

  // Listar verificações pendentes (admin only)
  async getPendingVerifications(req: Request, res: Response) {
    try {
      const userRole = req.user?.role;
      
      if (userRole !== 'ADMIN') {
        return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
      }

      const verifications = await verificationService.getPendingVerifications();

      res.json({
        success: true,
        data: {
          verifications,
          count: verifications.length
        }
      });

    } catch (error) {
      console.error('Erro ao listar verificações pendentes:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  },

  // Revisar verificação - aprovar ou rejeitar (admin only)
  async reviewVerification(req: Request, res: Response) {
    try {
      const userRole = req.user?.role;
      const userId = req.user?.id;
      const { id: verificationId } = req.params;
      const { action, rejectionReason } = req.body;
      
      if (userRole !== 'ADMIN') {
        return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
      }

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      // Validar ação
      if (!action || !['APPROVE', 'REJECT'].includes(action)) {
        return res.status(400).json({ 
          error: 'Ação inválida. Use APPROVE ou REJECT.' 
        });
      }

      // Validar motivo para rejeições
      if (action === 'REJECT' && (!rejectionReason || rejectionReason.trim().length === 0)) {
        return res.status(400).json({ 
          error: 'Motivo da rejeição é obrigatório.' 
        });
      }

      const updatedVerification = await verificationService.reviewVerification({
        verificationId,
        action,
        rejectionReason: action === 'REJECT' ? rejectionReason.trim() : undefined,
        reviewedBy: userId
      });

      res.json({
        success: true,
        message: `Verificação ${action === 'APPROVE' ? 'aprovada' : 'rejeitada'} com sucesso`,
        data: {
          verificationId: updatedVerification.id,
          status: updatedVerification.status,
          reviewedAt: updatedVerification.reviewedAt
        }
      });

    } catch (error) {
      console.error('Erro ao revisar verificação:', error);
      
      if (error instanceof Error) {
        if (error.message === 'Verificação não encontrada') {
          return res.status(404).json({ error: error.message });
        }
        if (error.message === 'Verificação não está pendente') {
          return res.status(400).json({ error: error.message });
        }
      }
      
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  },

  // Obter detalhes de uma verificação específica (admin only)
  async getVerificationDetails(req: Request, res: Response) {
    try {
      const userRole = req.user?.role;
      const { id: verificationId } = req.params;
      
      if (userRole !== 'ADMIN') {
        return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
      }

      const verification = await verificationService.getVerificationById(verificationId);

      if (!verification) {
        return res.status(404).json({ error: 'Verificação não encontrada' });
      }

      res.json({
        success: true,
        data: verification
      });

    } catch (error) {
      console.error('Erro ao obter detalhes da verificação:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  },

  // Obter estatísticas de verificação (admin only)
  async getVerificationStats(req: Request, res: Response) {
    try {
      const userRole = req.user?.role;
      
      if (userRole !== 'ADMIN') {
        return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
      }

      const stats = await verificationService.getVerificationStats();

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
};