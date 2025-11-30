import React, { useState, useEffect } from 'react';
import { verificationService, VerificationStatus as VerificationStatusType } from '../../services/verificationService';
import { DocumentUpload } from './DocumentUpload';

export const VerificationStatus: React.FC = () => {
  const [status, setStatus] = useState<VerificationStatusType | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadVerificationStatus();
  }, []);

  const loadVerificationStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Debug: verificar se há token
      const token = localStorage.getItem('auth_token');
      console.log('🔍 Token de autenticação:', token ? 'Presente' : 'Ausente');
      
      const verificationStatus = await verificationService.getVerificationStatus();
      console.log('✅ Status de verificação carregado:', verificationStatus);
      setStatus(verificationStatus);
    } catch (error: any) {
      console.error('❌ Erro detalhado ao carregar status:', error);
      console.error('❌ Response:', error.response?.data);
      console.error('❌ Status:', error.response?.status);
      
      let errorMessage = 'Erro ao carregar status de verificação';
      if (error.response?.status === 401) {
        errorMessage = 'Você precisa estar logado para ver o status de verificação';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = () => {
    setShowUpload(false);
    loadVerificationStatus(); // Recarregar status
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'NOT_SUBMITTED':
        return {
          icon: '📄',
          text: 'Não verificado',
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          description: 'Sua identidade ainda não foi verificada'
        };
      case 'PENDING':
        return {
          icon: '⏳',
          text: 'Em análise',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          description: 'Seus documentos estão sendo analisados'
        };
      case 'APPROVED':
        return {
          icon: '✅',
          text: 'Verificado',
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          description: 'Sua identidade foi verificada com sucesso'
        };
      case 'REJECTED':
        return {
          icon: '❌',
          text: 'Rejeitado',
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          description: 'Verificação rejeitada'
        };
      default:
        return {
          icon: '❓',
          text: 'Desconhecido',
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          description: 'Status desconhecido'
        };
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (showUpload) {
    return (
      <DocumentUpload
        onUploadSuccess={handleUploadSuccess}
        onCancel={() => setShowUpload(false)}
      />
    );
  }

  if (!status) return null;

  const statusInfo = getStatusInfo(status.status);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Verificação de Identidade
        </h3>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
          <span className="mr-1">{statusInfo.icon}</span>
          {statusInfo.text}
        </span>
      </div>

      <div className="space-y-4">
        <p className="text-gray-600 dark:text-gray-400">
          {statusInfo.description}
        </p>

        {/* Informações detalhadas baseadas no status */}
        {status.status === 'NOT_SUBMITTED' && (
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                Por que verificar sua identidade?
              </h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Aumenta a confiança dos outros usuários</li>
                <li>• Acesso a recursos premium da plataforma</li>
                <li>• Maior segurança nas transações</li>
                <li>• Badge de verificado no seu perfil</li>
              </ul>
            </div>
            <button
              onClick={() => setShowUpload(true)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Iniciar Verificação
            </button>
          </div>
        )}

        {status.status === 'PENDING' && status.submittedAt && (
          <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <span className="font-medium">Documentos enviados em:</span>{' '}
              {new Date(status.submittedAt).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2">
              Tipo de documento: <span className="font-medium">{status.documentType}</span>
            </p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2">
              Nossa equipe está analisando seus documentos. Você receberá uma notificação quando a análise for concluída.
            </p>
          </div>
        )}

        {status.status === 'APPROVED' && status.reviewedAt && (
          <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-4">
            <p className="text-sm text-green-800 dark:text-green-200">
              <span className="font-medium">Verificado em:</span>{' '}
              {new Date(status.reviewedAt).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
            {status.reviewedBy && (
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                Revisado por: <span className="font-medium">{status.reviewedBy}</span>
              </p>
            )}
            <p className="text-sm text-green-700 dark:text-green-300 mt-2">
              🎉 Parabéns! Sua identidade foi verificada com sucesso. Agora você tem o badge de usuário verificado.
            </p>
          </div>
        )}

        {status.status === 'REJECTED' && (
          <div className="space-y-4">
            <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
              <p className="text-sm text-red-800 dark:text-red-200 font-medium mb-2">
                Verificação rejeitada
              </p>
              {status.rejectionReason && (
                <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                  <span className="font-medium">Motivo:</span> {status.rejectionReason}
                </p>
              )}
              {status.reviewedAt && (
                <p className="text-sm text-red-700 dark:text-red-300">
                  <span className="font-medium">Rejeitado em:</span>{' '}
                  {new Date(status.reviewedAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              )}
            </div>
            <button
              onClick={() => setShowUpload(true)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        )}
      </div>
    </div>
  );
};