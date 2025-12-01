import React, { useState, useEffect } from 'react';
import { verificationService, PendingVerification, VerificationStats } from '../../services/verificationService';
import { API_URL } from '../../config/api';

export const AdminVerificationPanel: React.FC = () => {
  const [pendingVerifications, setPendingVerifications] = useState<PendingVerification[]>([]);
  const [stats, setStats] = useState<VerificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState<PendingVerification | null>(null);
  const [reviewModal, setReviewModal] = useState<{
    isOpen: boolean;
    verification: PendingVerification | null;
    action: 'APPROVE' | 'REJECT' | null;
  }>({ isOpen: false, verification: null, action: null });
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [verificationsData, statsData] = await Promise.all([
        verificationService.getPendingVerifications(),
        verificationService.getVerificationStats()
      ]);
      setPendingVerifications(verificationsData);
      setStats(statsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = (verification: PendingVerification, action: 'APPROVE' | 'REJECT') => {
    setReviewModal({
      isOpen: true,
      verification,
      action
    });
    setRejectionReason('');
  };

  const confirmReview = async () => {
    if (!reviewModal.verification || !reviewModal.action) return;

    if (reviewModal.action === 'REJECT' && !rejectionReason.trim()) {
      alert('Por favor, informe o motivo da rejeição');
      return;
    }

    setProcessing(true);
    try {
      await verificationService.reviewVerification(
        reviewModal.verification.id,
        reviewModal.action,
        reviewModal.action === 'REJECT' ? rejectionReason : undefined
      );
      
      // Recarregar dados
      await loadData();
      
      // Fechar modal
      setReviewModal({ isOpen: false, verification: null, action: null });
      setRejectionReason('');
      
      alert(`Verificação ${reviewModal.action === 'APPROVE' ? 'aprovada' : 'rejeitada'} com sucesso!`);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao processar verificação');
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-600">Pendentes</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <div className="text-sm text-gray-600">Aprovadas</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <div className="text-sm text-gray-600">Rejeitadas</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-purple-600">{stats.verifiedUsers}</div>
            <div className="text-sm text-gray-600">Usuários Verificados</div>
          </div>
        </div>
      )}

      {/* Lista de verificações pendentes */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Verificações Pendentes ({pendingVerifications.length})
          </h3>
        </div>

        {pendingVerifications.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            Nenhuma verificação pendente
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {pendingVerifications.map((verification) => (
              <div key={verification.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {verification.user.name}
                      </h4>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        {verification.documentType}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {verification.user.email}
                    </p>
                    <p className="text-sm text-gray-500">
                      Enviado em: {formatDate(verification.createdAt)}
                    </p>
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => setSelectedVerification(verification)}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Ver Documentos
                    </button>
                    <button
                      onClick={() => handleReview(verification, 'APPROVE')}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                      Aprovar
                    </button>
                    <button
                      onClick={() => handleReview(verification, 'REJECT')}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                      Rejeitar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de visualização de documentos */}
      {selectedVerification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Documentos de {selectedVerification.user.name}
                </h3>
                <button
                  onClick={() => setSelectedVerification(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Frente do Documento</h4>
                  <img
                    src={`${API_URL}${selectedVerification.documentFrontUrl}`}
                    alt="Frente do documento"
                    className="w-full rounded-lg border"
                  />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Verso do Documento</h4>
                  <img
                    src={`${API_URL}${selectedVerification.documentBackUrl}`}
                    alt="Verso do documento"
                    className="w-full rounded-lg border"
                  />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Selfie com Documento</h4>
                  {selectedVerification.userPhotoUrl ? (
                    <img
                      src={`${API_URL}${selectedVerification.userPhotoUrl}`}
                      alt="Selfie do usuário segurando documento"
                      className="w-full rounded-lg border"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-100 dark:bg-gray-700 rounded-lg border flex items-center justify-center">
                      <span className="text-gray-500 dark:text-gray-400">Selfie não disponível</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedVerification(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Fechar
                </button>
                <button
                  onClick={() => {
                    handleReview(selectedVerification, 'APPROVE');
                    setSelectedVerification(null);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Aprovar
                </button>
                <button
                  onClick={() => {
                    handleReview(selectedVerification, 'REJECT');
                    setSelectedVerification(null);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Rejeitar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmação de revisão */}
      {reviewModal.isOpen && reviewModal.verification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {reviewModal.action === 'APPROVE' ? 'Aprovar Verificação' : 'Rejeitar Verificação'}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Usuário: <span className="font-medium">{reviewModal.verification.user.name}</span>
              </p>

              {reviewModal.action === 'REJECT' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Motivo da rejeição *
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Explique o motivo da rejeição..."
                  />
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={() => setReviewModal({ isOpen: false, verification: null, action: null })}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  disabled={processing}
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmReview}
                  disabled={processing || (reviewModal.action === 'REJECT' && !rejectionReason.trim())}
                  className={`flex-1 px-4 py-2 text-white rounded-md transition-colors ${
                    reviewModal.action === 'APPROVE'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  } disabled:opacity-50`}
                >
                  {processing ? 'Processando...' : 'Confirmar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};