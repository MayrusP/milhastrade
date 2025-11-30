import React, { useState } from 'react';
import { StarRating } from './StarRating';
import { api } from '../../services/api';

interface Transaction {
  id: string;
  offer: {
    title: string;
    milesAmount: number;
    airline?: {
      name: string;
    };
  };
  buyer: {
    id: string;
    name: string;
  };
  seller: {
    id: string;
    name: string;
  };
  createdAt: string;
}

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  currentUserId: string;
  onRatingSubmitted: () => void;
}

export const RatingModal: React.FC<RatingModalProps> = ({
  isOpen,
  onClose,
  transaction,
  currentUserId,
  onRatingSubmitted
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !transaction) return null;

  // Determinar quem está sendo avaliado
  const isCurrentUserBuyer = transaction.buyer.id === currentUserId;
  const reviewedUser = isCurrentUserBuyer ? transaction.seller : transaction.buyer;
  const userRole = isCurrentUserBuyer ? 'comprador' : 'vendedor';
  const reviewedRole = isCurrentUserBuyer ? 'vendedor' : 'comprador';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Por favor, selecione uma avaliação');
      return;
    }

    if (comment.trim().length < 10) {
      setError('O comentário deve ter pelo menos 10 caracteres');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await api.post('/ratings', {
        transactionId: transaction.id,
        rating,
        comment: comment.trim(),
        reviewedUserId: reviewedUser.id
      });

      onRatingSubmitted();
      onClose();
      
      // Reset form
      setRating(0);
      setComment('');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erro ao enviar avaliação');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setComment('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Avaliar Transação
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 className="font-medium text-gray-900 dark:text-white mb-1">
            {transaction.offer.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {transaction.offer.milesAmount.toLocaleString()} milhas • {transaction.offer.airline?.name || 'Companhia não especificada'}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Você como {userRole} • Avaliar {reviewedRole}: <span className="font-medium">{reviewedUser.name}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sua avaliação
            </label>
            <div className="flex justify-center">
              <StarRating
                rating={rating}
                size="lg"
                interactive={true}
                onRatingChange={setRating}
              />
            </div>
            {rating > 0 && (
              <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-1">
                {rating === 1 && 'Muito ruim'}
                {rating === 2 && 'Ruim'}
                {rating === 3 && 'Regular'}
                {rating === 4 && 'Bom'}
                {rating === 5 && 'Excelente'}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Comentário (mínimo 10 caracteres)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              maxLength={500}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              placeholder="Compartilhe sua experiência com esta transação (mínimo 10 caracteres)..."
            />
            <p className="text-xs text-gray-500 mt-1">
              {comment.length}/500 caracteres
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 rounded-md transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || rating === 0 || comment.trim().length < 10}
              className="flex-1 px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Avaliação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};