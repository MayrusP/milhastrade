import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '../components/common/Layout';
import { api } from '../services/api';
import { UserRatings } from '../components/rating/UserRatings';
import { StarRating } from '../components/rating/StarRating';
import { formatPhone } from '../utils/formatters';

interface PublicProfile {
  id: string;
  name: string;
  phone?: string;
  isVerified: boolean;
  createdAt: string;
  _count: {
    offers: number;
    buyerTransactions: number;
    sellerTransactions: number;
    ratings: number;
  };
  ratingStats: {
    averageRating: number;
    totalRatings: number;
  };
}

export const PublicProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (userId) {
      loadPublicProfile(userId);
    }
  }, [userId]);

  const loadPublicProfile = async (id: string) => {
    try {
      console.log('🔍 Carregando perfil público para ID:', id);
      const response = await api.get(`/user/public-profile/${id}`);
      console.log('📡 Resposta da API:', response.data);
      
      if (response.data.success) {
        setProfile(response.data.data.user);
        console.log('✅ Perfil carregado com sucesso:', response.data.data.user);
      } else {
        console.log('❌ API retornou erro:', response.data.message);
        setError('Perfil não encontrado');
      }
    } catch (error: any) {
      console.error('❌ Erro ao carregar perfil público:', error);
      console.error('📊 Detalhes do erro:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.status === 401) {
        setError('Você precisa estar logado para ver perfis de usuários');
      } else if (error.response?.status === 404) {
        setError('Usuário não encontrado');
      } else {
        setError('Erro ao carregar perfil');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-lg">Carregando perfil...</div>
        </div>
      </Layout>
    );
  }

  if (error || !profile) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-6 text-center">
          <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-6">
            <h1 className="text-2xl font-bold text-red-800 dark:text-red-200 mb-2">
              Perfil não encontrado
            </h1>
            <p className="text-red-600 dark:text-red-300 mb-4">
              {error || 'O usuário que você está procurando não existe.'}
            </p>
            <Link
              to="/dashboard"
              className="inline-block px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              Voltar ao Dashboard
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar ao Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Perfil de {profile.name}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informações Básicas */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Informações Públicas
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nome
                </label>
                <p className="text-gray-900 dark:text-white">{profile.name}</p>
              </div>
              {profile.phone && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Telefone
                  </label>
                  <p className="text-gray-900 dark:text-white">{formatPhone(profile.phone)}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Membro desde
                </label>
                <p className="text-gray-900 dark:text-white">
                  {new Date(profile.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </div>

          {/* Estatísticas Públicas */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Estatísticas
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Ofertas criadas:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {profile._count.offers}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Compras realizadas:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {profile._count.buyerTransactions}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Vendas realizadas:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {profile._count.sellerTransactions}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Avaliação/Confiabilidade */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Confiabilidade
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status de Verificação */}
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                profile.isVerified 
                  ? 'bg-green-100 dark:bg-green-900' 
                  : 'bg-gray-100 dark:bg-gray-700'
              }`}>
                {profile.isVerified ? (
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                )}
              </div>
              <div>
                <p className={`text-sm font-medium ${
                  profile.isVerified 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {profile.isVerified ? 'Identidade Verificada' : 'Identidade Não Verificada'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {profile.isVerified 
                    ? 'Documentos aprovados pela equipe' 
                    : 'Verificação de identidade pendente'
                  }
                </p>
              </div>
            </div>

            {/* Experiência em Transações */}
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Experiência
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {profile._count.buyerTransactions + profile._count.sellerTransactions} transação(ões) realizadas
                </p>
              </div>
            </div>
            
            {profile.ratingStats.totalRatings > 0 && (
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <StarRating rating={profile.ratingStats.averageRating} size="sm" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {profile.ratingStats.averageRating.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {profile.ratingStats.totalRatings} avaliação(ões)
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Avaliações */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <UserRatings userId={profile.id} isPublicView={true} />
        </div>
      </div>
    </Layout>
  );
};