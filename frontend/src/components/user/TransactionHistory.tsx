import { useState, useEffect } from 'react';
import { TransactionService } from '@/services/transactionService';
import { Transaction, TransactionListResponse, TransactionStatus } from '@/types';
import { useAuth } from '@/hooks/useAuth';

export const TransactionHistory = () => {
  const { user } = useAuth();
  const [data, setData] = useState<TransactionListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const response = await TransactionService.getUserTransactions();
      setData(response);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar transações');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (transactionId: string, status: TransactionStatus) => {
    try {
      await TransactionService.updateTransactionStatus(transactionId, { status });
      await fetchTransactions(); // Refresh the list
    } catch (err: any) {
      alert(err.message || 'Erro ao atualizar status da transação');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const formatMiles = (miles: number) => {
    return new Intl.NumberFormat('pt-BR').format(miles);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const dateFormatted = date.toLocaleDateString('pt-BR');
    const timeFormatted = date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    return `${dateFormatted} às ${timeFormatted}`;
  };

  const getStatusColor = (status: TransactionStatus) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: TransactionStatus) => {
    switch (status) {
      case 'PENDING':
        return 'Pendente';
      case 'CONFIRMED':
        return 'Confirmada';
      case 'COMPLETED':
        return 'Concluída';
      case 'CANCELLED':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const getAvailableActions = (transaction: Transaction) => {
    if (!user) return [];

    const isBuyer = transaction.buyer.id === user.id;
    const isSeller = transaction.seller.id === user.id;
    const actions = [];

    switch (transaction.status) {
      case 'PENDING':
        if (isSeller) {
          actions.push({ label: 'Confirmar', status: 'CONFIRMED' as TransactionStatus });
          actions.push({ label: 'Cancelar', status: 'CANCELLED' as TransactionStatus });
        }
        if (isBuyer) {
          actions.push({ label: 'Cancelar', status: 'CANCELLED' as TransactionStatus });
        }
        break;
      case 'CONFIRMED':
        if (isBuyer) {
          actions.push({ label: 'Marcar como Concluída', status: 'COMPLETED' as TransactionStatus });
          actions.push({ label: 'Cancelar', status: 'CANCELLED' as TransactionStatus });
        }
        if (isSeller) {
          actions.push({ label: 'Cancelar', status: 'CANCELLED' as TransactionStatus });
        }
        break;
    }

    return actions;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-md animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-4 w-3/4"></div>
              <div className="grid grid-cols-4 gap-4">
                <div className="h-6 bg-gray-200 rounded"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <h1 className="text-2xl font-bold text-gray-900">Histórico de Transações</h1>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Transactions List */}
      {data && data.transactions.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">
            Você ainda não possui transações
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {data?.transactions.map((transaction) => {
            const isBuyer = transaction.buyer.id === user?.id;
            const otherUser = isBuyer ? transaction.seller : transaction.buyer;
            const role = isBuyer ? 'Comprador' : 'Vendedor';
            const actions = getAvailableActions(transaction);

            return (
              <div key={transaction.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {transaction.offer.title}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>Você é o: <strong>{role}</strong></span>
                      <span>•</span>
                      <span>{isBuyer ? 'Vendedor' : 'Comprador'}: {otherUser.name}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                    {getStatusLabel(transaction.status)}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Companhia</p>
                    <p className="text-sm font-medium text-gray-900">
                      {transaction.offer.airline?.name || 'Companhia não especificada'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Milhas</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatMiles(transaction.offer.milesAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Valor</p>
                    <p className="text-sm font-medium text-primary-600">
                      {formatPrice(transaction.amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Data</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDateTime(transaction.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Contato do {isBuyer ? 'Vendedor' : 'Comprador'}
                  </h4>
                  <div className="text-sm text-gray-600">
                    <p><strong>Nome:</strong> {otherUser.name}</p>
                    <p><strong>Email:</strong> {otherUser.email}</p>
                    {otherUser.phone && (
                      <p><strong>Telefone:</strong> {otherUser.phone}</p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                {actions.length > 0 && (
                  <div className="flex space-x-2">
                    {actions.map((action, index) => (
                      <button
                        key={index}
                        onClick={() => handleStatusUpdate(transaction.id, action.status)}
                        className={`px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                          action.status === 'CANCELLED'
                            ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
                            : action.status === 'COMPLETED'
                            ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                            : 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500'
                        }`}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {data && data.pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <div className="text-sm text-gray-600">
            Página {data.pagination.page} de {data.pagination.totalPages} 
            ({data.pagination.total} transações no total)
          </div>
        </div>
      )}
    </div>
  );
};