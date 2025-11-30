import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';

interface PendingApproval {
  id: string;
  type?: string; // 'ADD_PASSENGER' ou 'EDIT_PASSENGER'
  transactionId: string;
  passengerId: string | null;
  passengerName: string;
  buyerName: string;
  buyerId?: string;
  offerTitle: string;
  changedFields?: Array<{
    field: string;
    oldValue: string;
    newValue: string;
    critical: boolean;
  }>;
  newPassengerData?: {
    fullName: string;
    cpf: string;
    birthDate: string;
    email: string;
    fareType: string;
  };
  reason: string;
  createdAt: string;
}

interface PendingApprovalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprovalProcessed: () => void;
}

export const PendingApprovalsModal: React.FC<PendingApprovalsModalProps> = ({
  isOpen,
  onClose,
  onApprovalProcessed
}) => {
  const [approvals, setApprovals] = useState<PendingApproval[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadPendingApprovals();
    }
  }, [isOpen]);

  const loadPendingApprovals = async () => {
    console.log('🔄 Carregando aprovações pendentes...');
    setLoading(true);
    try {
      const response = await api.get('/user/pending-approvals');
      console.log('📡 Resposta do carregamento:', response.data);
      if (response.data.success) {
        console.log('📋 Aprovações carregadas:', response.data.data.pendingApprovals.length);
        console.log('📋 Detalhes das aprovações:', response.data.data.pendingApprovals);
        setApprovals(response.data.data.pendingApprovals);
      }
    } catch (error) {
      console.error('Erro ao carregar aprovações pendentes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (approvalId: string, action: 'APPROVE' | 'REJECT', reason?: string) => {
    if (processing === approvalId) {
      console.log('⚠️ Aprovação já está sendo processada');
      return; // Evitar cliques múltiplos
    }

    console.log('🔄 Processando aprovação:', { approvalId, action, reason });
    console.log('📊 Estado atual das aprovações:', approvals.length);
    setProcessing(approvalId);
    
    try {
      const response = await api.put(`/passenger-edits/${approvalId}/approve`, {
        action,
        reason
      });

      console.log('📡 Resposta da aprovação:', response.data);

      if (response.data.success) {
        console.log('✅ Resposta de sucesso recebida');
        console.log(`✅ ${action === 'APPROVE' ? 'Aprovação' : 'Rejeição'} processada com sucesso`);
        
        // Mostrar notificação de sucesso
        const message = action === 'APPROVE' 
          ? 'Alterações aprovadas e aplicadas com sucesso!' 
          : 'Alterações rejeitadas. Dados mantidos como originais.';
        
        setNotification({ message, type: 'success' });
        
        // Remover a aprovação da lista IMEDIATAMENTE
        setApprovals(currentApprovals => {
          const filteredApprovals = currentApprovals.filter(approval => approval.id !== approvalId);
          console.log(`🗑️ Removendo aprovação ${approvalId}. Antes: ${currentApprovals.length}, Depois: ${filteredApprovals.length}`);
          return filteredApprovals;
        });
        
        // Notificar componente pai
        onApprovalProcessed();
        
        // Remover notificação após 3 segundos
        setTimeout(() => {
          setNotification(null);
        }, 3000);
      }
    } catch (error: any) {
      console.error('❌ Erro ao processar aprovação:', error);
      
      const errorMessage = error.response?.data?.message || 'Erro ao processar aprovação. Tente novamente.';
      setNotification({ message: errorMessage, type: 'error' });
      
      // Remover notificação de erro após 5 segundos
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    } finally {
      setProcessing(null);
    }
  };

  const getFieldLabel = (field: string) => {
    const labels: Record<string, string> = {
      fullName: 'Nome Completo',
      cpf: 'CPF',
      birthDate: 'Data de Nascimento',
      email: 'E-mail',
      fareType: 'Tipo de Tarifa'
    };
    return labels[field] || field;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold">🔍 Aprovações Pendentes</h3>
              <p className="text-orange-100 text-sm mt-1">
                Alterações de dados dos passageiros aguardando sua aprovação
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-orange-100 hover:text-white transition-colors"
              disabled={loading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Notificação */}
          {notification && (
            <div className={`mb-4 p-4 rounded-lg border ${
              notification.type === 'success' 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <div className="flex items-center">
                {notification.type === 'success' ? (
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                )}
                <span className="text-sm font-medium">{notification.message}</span>
              </div>
            </div>
          )}
          {loading ? (
            <div className="text-center py-8">
              <div className="text-lg">Carregando aprovações pendentes...</div>
            </div>
          ) : approvals.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-gray-500">Não há aprovações pendentes</p>
              <p className="text-sm text-gray-400 mt-1">
                Todas as alterações foram processadas
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {approvals.map((approval) => (
                <div key={approval.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-6">
                  {/* Cabeçalho da aprovação */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {approval.type === 'ADD_PASSENGER' ? '➕ ' : '✏️ '}{approval.passengerName}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Oferta: {approval.offerTitle}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Comprador: {approval.buyerId ? (
                          <Link 
                            to={`/user/${approval.buyerId}`}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {approval.buyerName}
                          </Link>
                        ) : (
                          approval.buyerName
                        )}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Solicitado em: {formatDateTime(approval.createdAt)}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApproval(approval.id, 'APPROVE')}
                        disabled={processing === approval.id}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        {processing === approval.id && (
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        )}
                        <span>{processing === approval.id ? 'Processando...' : 'Aprovar'}</span>
                      </button>
                      <button
                        onClick={() => {
                          if (processing === approval.id) return;
                          const reason = prompt('Motivo da rejeição (opcional):');
                          if (reason !== null) {
                            handleApproval(approval.id, 'REJECT', reason);
                          }
                        }}
                        disabled={processing === approval.id}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        {processing === approval.id && (
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        )}
                        <span>Rejeitar</span>
                      </button>
                    </div>
                  </div>

                  {/* Motivo da alteração */}
                  {approval.reason && (
                    <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-3 mb-4">
                      <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                        Motivo da Alteração:
                      </h5>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        {approval.reason}
                      </p>
                    </div>
                  )}

                  {/* Alterações solicitadas */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    {approval.type === 'ADD_PASSENGER' ? (
                      // Mostrar dados do novo passageiro
                      <>
                        <h5 className="font-medium text-gray-900 dark:text-white mb-3">
                          ➕ Novo Passageiro Solicitado:
                        </h5>
                        {approval.newPassengerData && (
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-white dark:bg-gray-600 rounded-md">
                              <div>
                                <span className="font-medium text-gray-900 dark:text-white">Nome:</span>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{approval.newPassengerData.fullName}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-900 dark:text-white">CPF:</span>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{approval.newPassengerData.cpf}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-900 dark:text-white">Data de Nascimento:</span>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{approval.newPassengerData.birthDate}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-900 dark:text-white">E-mail:</span>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{approval.newPassengerData.email}</p>
                              </div>
                              <div className="md:col-span-2">
                                <span className="font-medium text-gray-900 dark:text-white">Tipo de Tarifa:</span>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{approval.newPassengerData.fareType}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      // Mostrar alterações de passageiro existente
                      <>
                        <h5 className="font-medium text-gray-900 dark:text-white mb-3">
                          ✏️ Alterações Solicitadas:
                        </h5>
                        <div className="space-y-3">
                          {approval.changedFields?.map((change, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-600 rounded-md">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="font-medium text-gray-900 dark:text-white">
                                    {getFieldLabel(change.field)}
                                  </span>
                                  {change.critical && (
                                    <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                                      Crítico
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm">
                                  <div className="text-gray-600 dark:text-gray-400">
                                    <span className="font-medium">De:</span> {change.oldValue}
                                  </div>
                                  <div className="text-gray-900 dark:text-white">
                                    <span className="font-medium">Para:</span> {change.newValue}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )) || <p className="text-gray-500">Nenhuma alteração especificada</p>}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Botão Fechar */}
          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              disabled={loading}
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};