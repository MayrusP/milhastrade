import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/common/Layout';
import { api } from '../services/api';
import { UserRatings } from '../components/rating/UserRatings';
import { StarRating } from '../components/rating/StarRating';
import { VerificationStatus } from '../components/verification/VerificationStatus';
import { VerifiedBadge } from '../components/verification/VerifiedBadge';
import { formatPhone } from '../utils/formatters';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  credits: number;
  isVerified?: boolean;
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

export const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      console.log('🔍 ProfilePage - Carregando perfil...');
      const response = await api.get('/user/profile');
      console.log('📡 ProfilePage - Resposta da API:', response.data);
      
      if (response.data.success) {
        const userData = response.data.data.user;
        console.log('✅ ProfilePage - Dados do usuário:', userData);
        console.log('🔍 ProfilePage - isVerified:', userData.isVerified, typeof userData.isVerified);
        setProfile(userData);
      }
    } catch (error) {
      console.error('❌ ProfilePage - Erro ao carregar perfil:', error);
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

  if (!profile) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-lg text-red-600">Erro ao carregar perfil</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Meu Perfil</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informações do Perfil */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Informações Pessoais</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome</label>
                <div className="flex items-center space-x-2">
                  <p className="text-gray-900">{profile.name}</p>
                  <VerifiedBadge isVerified={profile.isVerified || false} showText />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="text-gray-900">{profile.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Telefone</label>
                <p className="text-gray-900">{formatPhone(profile.phone) || 'Não informado'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Membro desde</label>
                <p className="text-gray-900">
                  {new Date(profile.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar com Créditos e Estatísticas */}
          <div className="space-y-6">
            {/* Botão Ver Perfil Público */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <Link
                to={`/user/${profile.id}`}
                className="w-full flex items-center justify-center px-4 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Perfil Público
              </Link>
            </div>



            {/* Estatísticas */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Estatísticas</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Ofertas criadas:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{profile._count.offers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Compras realizadas:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{profile._count.buyerTransactions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Vendas realizadas:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{profile._count.sellerTransactions}</span>
                </div>
                {profile.ratingStats && profile.ratingStats.totalRatings > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Avaliação média:</span>
                    <div className="flex flex-col items-center space-y-1">
                      <div className="flex items-center space-x-1">
                        <StarRating rating={profile.ratingStats.averageRating} size="sm" />
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {profile.ratingStats.averageRating.toFixed(1)}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        ({profile.ratingStats.totalRatings} {profile.ratingStats.totalRatings === 1 ? 'avaliação' : 'avaliações'})
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Seção de Verificação */}
        <div className="mt-8">
          <VerificationStatus />
        </div>

        {/* Seção de Avaliações */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <UserRatings userId={profile.id} isPublicView={false} />
        </div>
      </div>
    </Layout>
  );
};