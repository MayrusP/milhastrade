import React, { useState } from 'react';
import { api } from '../../services/api';

interface Transaction {
  id: string;
  transactionHash: string;
  status: string;
  amount: number;
  createdAt: string;
  buyer: {
    id: string;
    name: string;
    email: string;
  };
  seller: {
    id: string;
    name: string;
    email: string;
  };
  offer: {
    title: string;
    milesAmount: number;
    price: number;
    airline: {
      name: string;
    };
  };
}

interface TransactionSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TransactionSearchModal: React.FC<TransactionSearchModalProps> = ({
  isOpen,
  onClose
}) => {
  const [searchHash, setSearchHash] = useState('');
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

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
    return date.toLocaleString('pt-BR');
  };

  const handleSearch = async () => {
    if (!searchHash.trim()) {
      setError('Digite um ID de transação');
      return;
    }

    setIsSearching(true);
    setError('');
    setTransaction(null);

    try {
      const response = await api.get(`/transactions/hash/${searchHash.trim()}`);
      
      if (response.data.success) {
        setTransaction(response.data.data.transaction);
      }
    } catch (error: any) {
      console.error('Erro ao buscar transação:', error);
      
      if (error.response?.status === 404) {
        setError('Transação não encontrada');
      } else if (error.response?.status === 403) {
        setError('Você não tem permissão para ver esta transação');
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Erro ao buscar transação. Tente novamente.');
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleClose = () => {
    setSearchHash('');
    setTransaction(null);
    setError('');
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold">Buscar Transação</h2>
                <p className="text-blue-100 text-sm">Digite o ID da transação para consultar</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:text-blue-100 focus:outline-none transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Search Input */}
          <div className="mb-6">
            <label htmlFor="searchHash" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ID da Transação
            </label>
            <div className="flex space-x-3">
              <input
                type="text"
                id="searchHash"
                value={searchHash}
                onChange={(e) => setSearchHash(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                placeholder="Ex: A1B2C3D4E5F6G7H8"
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white font-mono"
                maxLength={16}
              />
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSearching ? (
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  'Buscar'
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p className="text-red-700 dark:text-red-300 text-sm font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Transaction Details */}
          {transaction && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Detalhes da Transação
                </h3>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  {transaction.status === 'COMPLETED' ? 'Concluída' : transaction.status}
                </span>
              </div>

              {/* Transaction ID */}
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900 rounded-md">
                <p className="text-sm text-blue-700 dark:text-blue-300 font-medium mb-1">ID da Transação:</p>
                <p className="text-blue-800 dark:text-blue-200 font-mono text-lg">{transaction.transactionHash}</p>
              </div>

              {/* Offer Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Oferta</h4>
                  <p className="text-gray-700 dark:text-gray-300">{transaction.offer.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatMiles(transaction.offer.milesAmount)} milhas • {transaction.offer.airline?.name || 'Companhia não especificada'}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Valor</h4>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatPrice(transaction.amount)}
                  </p>
                </div>
              </div>

              {/* Participants */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-white dark:bg-gray-600 rounded-md">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Comprador</h4>
                  <p className="text-gray-700 dark:text-gray-300">{transaction.buyer.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{transaction.buyer.email}</p>
                </div>
                <div className="p-3 bg-white dark:bg-gray-600 rounded-md">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Vendedor</h4>
                  <p className="text-gray-700 dark:text-gray-300">{transaction.seller.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{transaction.seller.email}</p>
                </div>
              </div>

              {/* Transaction Date */}
              <div className="p-3 bg-white dark:bg-gray-600 rounded-md">
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">Data da Transação</h4>
                <p className="text-gray-700 dark:text-gray-300">{formatDateTime(transaction.createdAt)}</p>
              </div>
            </div>
          )}

          {/* Close Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};