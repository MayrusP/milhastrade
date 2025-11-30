import { useState } from 'react';
import { Offer } from '@/types';
import { TransactionService } from '@/services/transactionService';

interface StartTransactionModalProps {
  offer: Offer;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const StartTransactionModal = ({ 
  offer, 
  isOpen, 
  onClose, 
  onSuccess 
}: StartTransactionModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const formatMiles = (miles: number) => {
    return new Intl.NumberFormat('pt-BR').format(miles);
  };

  const handleStartTransaction = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      await TransactionService.createTransaction({ offerId: offer.id });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao iniciar transação');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Iniciar Transação
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4 mb-6">
          <div>
            <h3 className="font-semibold text-gray-900">{offer.title}</h3>
            <p className="text-sm text-gray-600">{offer.airline?.name || 'Companhia não especificada'}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Milhas</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatMiles(offer.milesAmount)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Preço</p>
              <p className="text-lg font-semibold text-primary-600">
                {formatPrice(offer.price)}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Vendedor</h4>
            <div className="text-sm text-gray-600">
              <p><strong>Nome:</strong> {offer.user.name}</p>
              <p><strong>Email:</strong> {offer.user.email}</p>
              {offer.user.phone && (
                <p><strong>Telefone:</strong> {offer.user.phone}</p>
              )}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              Como funciona a transação?
            </h4>
            <ol className="text-sm text-blue-700 space-y-1">
              <li>1. Você inicia a transação</li>
              <li>2. O vendedor confirma a venda</li>
              <li>3. Vocês combinam os detalhes da transferência</li>
              <li>4. Você marca como concluída após receber as milhas</li>
            </ol>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            Cancelar
          </button>
          <button
            onClick={handleStartTransaction}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Iniciando...' : 'Iniciar Transação'}
          </button>
        </div>
      </div>
    </div>
  );
};