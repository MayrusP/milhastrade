import { api } from './api';

export interface VerificationStatus {
  status: 'NOT_SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string | null;
  rejectionReason: string | null;
  reviewedAt: string | null;
  reviewedBy: string | null;
  documentType: string | null;
}

export interface PendingVerification {
  id: string;
  userId: string;
  status: string;
  documentType: string;
  documentFrontUrl: string;
  documentBackUrl: string;
  userPhotoUrl?: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface VerificationStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  verifiedUsers: number;
}

export const verificationService = {
  // Obter status de verificação do usuário atual
  async getVerificationStatus(): Promise<VerificationStatus> {
    const response = await api.get('/verification/status');
    return response.data.data;
  },

  // Upload de documentos para verificação
  async uploadDocuments(documentType: 'RG' | 'CNH', frontFile: File, backFile: File, photoFile: File) {
    const formData = new FormData();
    formData.append('documentType', documentType);
    formData.append('front', frontFile);
    formData.append('back', backFile);
    formData.append('photo', photoFile);

    const response = await api.post('/verification/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Admin: Obter verificações pendentes
  async getPendingVerifications(): Promise<PendingVerification[]> {
    const response = await api.get('/verification/admin/pending');
    return response.data.data.verifications;
  },

  // Admin: Obter estatísticas de verificação
  async getVerificationStats(): Promise<VerificationStats> {
    const response = await api.get('/verification/admin/stats');
    return response.data.data;
  },

  // Admin: Obter detalhes de uma verificação
  async getVerificationDetails(verificationId: string) {
    const response = await api.get(`/verification/admin/${verificationId}`);
    return response.data.data;
  },

  // Admin: Revisar verificação (aprovar/rejeitar)
  async reviewVerification(verificationId: string, action: 'APPROVE' | 'REJECT', rejectionReason?: string) {
    const response = await api.put(`/verification/admin/${verificationId}/review`, {
      action,
      rejectionReason,
    });
    return response.data;
  },
};