import React, { useState, useEffect } from 'react';
import { StarRating } from './StarRating';
import { api } from '../../services/api';

interface Rating {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  reviewer: {
    id: string;
    name: string;
  };
  transaction: {
    id: string;
    createdAt: string;
    offer: {
      title: string;
      milesAmount: number;
    };
  };
}

interface RatingStats {
  totalRatings: number;
  averageRating: number;
  distribution: {
    [key: number]: number;
  };
}

interface UserRatingsProps {
  userId: string;
  isPublicView?: boolean;
}

export const UserRatings: React.FC<UserRatingsProps> = ({ 
  userId, 
  isPublicView = false 
}) => {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [stats, setStats] = useState<RatingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRatings();
  }, [userId]);

  const loadRatings = async () => {
    try {
      const response = await api.get(`/user/${userId}/ratings`);
      if (response.data.success) {
        setRatings(response.data.data.ratings);
        setStats(response.data.data.stats);
      }
    } catch (error: any) {
      console.error('Erro ao carregar avaliações:', error);
      setError('Erro ao carregar avaliações');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!stats || stats.totalRatings === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
        <p className="text-gray-500">
          {isPublicView ? 'Este usuário ainda não possui avaliações' : 'Você ainda não possui avaliações'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <StarRating rating={stats.averageRating} size="lg" />
            <div className="flex items-center space-x-1">
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {stats.averageRating.toFixed(1)}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                ({stats.totalRatings} {stats.totalRatings === 1 ? 'avaliação' : 'avaliações'})
              </span>
            </div>
          </div>
        </div>

        {/* Distribuição das estrelas */}
        <div className="space-y-1">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = stats.distribution[star] || 0;
            const percentage = stats.totalRatings > 0 ? (count / stats.totalRatings) * 100 : 0;
            
            return (
              <div key={star} className="flex items-center space-x-2 text-sm">
                <span className="w-8 text-gray-600 dark:text-gray-400">{star}★</span>
                <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="w-8 text-gray-600 dark:text-gray-400 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lista de avaliações */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Avaliações Recebidas
        </h3>
        
        {ratings.map((rating) => (
          <div key={rating.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-medium text-sm">
                    {rating.reviewer.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {rating.reviewer.name}
                  </p>
                  <StarRating rating={rating.rating} size="sm" />
                </div>
              </div>
              <span className="text-sm text-gray-500">
                {formatDate(rating.createdAt)}
              </span>
            </div>

            {rating.comment && (
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                {rating.comment}
              </p>
            )}

            <div className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-700 rounded p-2">
              <p>
                Transação: {rating.transaction.offer.title} • 
                {rating.transaction.offer.milesAmount.toLocaleString()} milhas
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};