import React, { useState, useEffect } from 'react';
import { Layout } from '../components/common/Layout';
import { TransactionSearchModal } from '../components/common/TransactionSearchModal';
import { EditOfferModal } from '../components/common/EditOfferModal';
import { EditPassengerDataModal } from '../components/common/EditPassengerDataModal';
import { PendingApprovalsModal } from '../components/common/PendingApprovalsModal';
import { NotificationsPanel } from '../components/common/NotificationsPanel';
import { api } from '../services/api';
import { Link } from 'react-router-dom';
import { RatingModal } from '../components/rating/RatingModal';
import { useAuth } from '../hooks/useAuthSimple';
import { useNotifications } from '../hooks/useNotifications';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  credits: number;
  createdAt: string;
  _count: {
    offers: number;
    buyerTransactions: number;
    sellerTransactions: number;
  };
}

interface Offer {
  id: string;
  title: string;
  description?: string;
  milesAmount: number;
  price: number;
  status: string;
  type: string;
  createdAt: string;
  airline: {
    id: string;
    name: string;
    code?: string;
  };
}

interface Transaction {
  id: string;
  transactionHash: string;
  status: string;
  amount: number;
  createdAt: string;
  offer: {
    id: string;
    title: string;
    milesAmount: number;
    price: number;
    type: string;
    airline: {
      name: string;
    };
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
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
}

export const DashboardPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { markAllAsRead } = useNotifications();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  
  // Marcar todas notificações como lidas ao entrar no Dashboard
  useEffect(() => {
    markAllAsRead();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  
  const [offers, setOffers] = useState<Offer[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pendingRatings, setPendingRatings] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingOffer, setCancellingOffer] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'sold' | 'cancelled' | 'purchased' | 'ratings'>('active');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [ratingModal, setRatingModal] = useState<{
    isOpen: boolean;
    transaction: Transaction | null;
  }>({ isOpen: false, transaction: null });
  const [passengerDataModal, setPassengerDataModal] = useState<{
    isOpen: boolean;
    transaction: Transaction | null;
  }>({ isOpen: false, transaction: null });
  const [passengerDataList, setPassengerDataList] = useState<any[]>([]);
  const [loadingPassengerData, setLoadingPassengerData] = useState(false);
  const [editOfferModal, setEditOfferModal] = useState<{
    isOpen: boolean;
    offer: Offer | null;
  }>({ isOpen: false, offer: null });
  const [editPassengerModal, setEditPassengerModal] = useState<{
    isOpen: boolean;
    transaction: Transaction | null;
  }>({ isOpen: false, transaction: null });
  const [pendingApprovalsModal, setPendingApprovalsModal] = useState(false);
  const [showSalesNotification, setShowSalesNotification] = useState(true);
  const [showApprovalsNotification, setShowApprovalsNotification] = useState(true);
  const [newSalesCount, setNewSalesCount] = useState(0);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Atualizar dados do usuário no contexto (incluindo saldo)
      await refreshUser();

      // Carregar perfil do usuário
      const profileResponse = await api.get('/user/profile');
      if (profileResponse.data.success) {
        setProfile(profileResponse.data.data.user);
      }

      // Carregar ofertas do usuário (com timestamp para evitar cache)
      const timestamp = new Date().getTime();
      const offersResponse = await api.get(`/user/offers?t=${timestamp}`);
      if (offersResponse.data.success) {
        const userOffers = offersResponse.data.data.offers;
        console.log('📊 Ofertas do usuário carregadas:', userOffers);
        console.log('📊 Ofertas por status:', {
          active: userOffers.filter((o: any) => o.status === 'ACTIVE').length,
          sold: userOffers.filter((o: any) => o.status === 'SOLD').length,
          cancelled: userOffers.filter((o: any) => o.status === 'CANCELLED').length
        });
        setOffers(userOffers);
      }

      // Carregar transações do usuário
      const transactionsResponse = await api.get('/user/transactions');
      if (transactionsResponse.data.success) {
        console.log('🔍 Transações carregadas:', transactionsResponse.data.data.transactions);
        setTransactions(transactionsResponse.data.data.transactions);
      } else {
        console.log('❌ Erro ao carregar transações:', transactionsResponse.data);
      }

      // Carregar avaliações pendentes
      const pendingRatingsResponse = await api.get('/user/transactions/pending-ratings');
      if (pendingRatingsResponse.data.success) {
        const ratingsData = pendingRatingsResponse.data.data.transactions || [];
        // Filtrar transações com dados válidos
        const validRatings = ratingsData.filter(transaction =>
          transaction &&
          transaction.id &&
          transaction.buyer &&
          transaction.seller &&
          transaction.offer
        );
        console.log(`Carregadas ${validRatings.length} avaliações válidas de ${ratingsData.length} total`);
        setPendingRatings(validRatings);
      }

      // Verificar vendas novas desde a última visualização
      const lastViewedSales = localStorage.getItem('lastViewedSalesCount');
      const currentSalesCount = transactionsResponse.data.success ?
        transactionsResponse.data.data.transactions.filter((t: Transaction) =>
          t.seller.email === profileResponse.data.data.user.email && t.status === 'COMPLETED'
        ).length : 0;

      if (lastViewedSales) {
        const newSales = currentSalesCount - parseInt(lastViewedSales);
        const newSalesCount = Math.max(0, newSales);
        setNewSalesCount(newSalesCount);
      } else {
        // Primeira vez - não mostrar notificação de vendas antigas
        setNewSalesCount(0);
        localStorage.setItem('lastViewedSalesCount', currentSalesCount.toString());
      }

      // Carregar aprovações pendentes reais
      try {
        console.log('🔍 Carregando aprovações pendentes...');
        const approvalsResponse = await api.get('/user/pending-approvals');
        console.log('📋 Resposta de aprovações:', approvalsResponse.data);
        if (approvalsResponse.data.success) {
          setPendingApprovalsCount(approvalsResponse.data.data.pendingApprovals.length);
          console.log(`✅ ${approvalsResponse.data.data.pendingApprovals.length} aprovações pendentes encontradas`);
        } else {
          setPendingApprovalsCount(0);
          console.log('❌ Resposta não foi sucesso');
        }
      } catch (error) {
        console.error('❌ Erro ao carregar aprovações pendentes:', error);
        setPendingApprovalsCount(0);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
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

  const markSalesAsViewed = () => {
    const currentSalesCount = getSoldTransactions().length;
    localStorage.setItem('lastViewedSalesCount', currentSalesCount.toString());
    setNewSalesCount(0);
    setShowSalesNotification(false);
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

  const loadPassengerData = async (transactionId: string) => {
    setLoadingPassengerData(true);
    try {
      const response = await api.get(`/transactions/${transactionId}/passengers`);
      if (response.data.success) {
        setPassengerDataList(response.data.data.passengers);
      }
    } catch (error) {
      console.error('Erro ao carregar dados dos passageiros:', error);
      setPassengerDataList([]);
    } finally {
      setLoadingPassengerData(false);
    }
  };

  const handleCancelOffer = async (offerId: string) => {
    if (!confirm('Tem certeza que deseja cancelar esta oferta?')) {
      return;
    }

    console.log('🚫 Cancelando oferta:', offerId);
    setCancellingOffer(offerId);
    try {
      const response = await api.put(`/offers/${offerId}/cancel`);
      console.log('✅ Resposta do cancelamento:', response.data);

      if (response.data.success) {
        alert('Oferta cancelada com sucesso!');
        // Recarregar dados do dashboard
        console.log('🔄 Recarregando dados após cancelamento...');
        await loadDashboardData();
        console.log('✅ Dados recarregados. Ofertas atuais:', offers.length);
      }
    } catch (error: any) {
      console.error('Erro ao cancelar oferta:', error);

      if (error.response?.data?.message) {
        alert(`Erro: ${error.response.data.message}`);
      } else {
        alert('Erro ao cancelar oferta. Tente novamente.');
      }
    } finally {
      setCancellingOffer(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'SOLD':
        return 'bg-blue-100 text-blue-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Ativa';
      case 'SOLD':
        return 'Vendida';
      case 'CANCELLED':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const getFilteredOffers = () => {
    if (activeTab === 'purchased') {
      return []; // Não retorna ofertas para a aba de compras
    }

    return offers.filter(offer => {
      switch (activeTab) {
        case 'active':
          return offer.status === 'ACTIVE';
        case 'sold':
          return offer.status === 'SOLD';
        case 'cancelled':
          return offer.status === 'CANCELLED';
        default:
          return true;
      }
    });
  };

  // Função para obter transações onde o usuário é vendedor
  const getSoldTransactions = () => {
    return transactions.filter(transaction =>
      transaction.seller.email === profile?.email &&
      transaction.status === 'COMPLETED'
    );
  };

  const getPurchasedOffers = () => {
    return transactions.filter(transaction =>
      transaction.buyer.email === profile?.email &&
      transaction.status === 'COMPLETED'
    );
  };

  const getTabCount = (status: string) => {
    if (status === 'SOLD') {
      // Para vendidas, contar transações onde o usuário é vendedor
      return getSoldTransactions().length;
    }
    const count = offers.filter(offer => offer.status === status).length;
    console.log(`📊 Contando ofertas ${status}:`, count, 'de', offers.length, 'total');
    return count;
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'SALE':
        return 'Venda';
      case 'BUY':
        return 'Compra';
      case 'EXCHANGE':
        return 'Troca';
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'SALE':
        return 'bg-green-100 text-green-800';
      case 'BUY':
        return 'bg-blue-100 text-blue-800';
      case 'EXCHANGE':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-lg">Carregando dashboard...</div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-lg text-red-600">Erro ao carregar dados do usuário</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-600">Bem-vindo, {profile.name}!</p>
          </div>
          <button
            onClick={() => setShowSearchModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>Buscar Transação</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Saldo Atual</p>
                <p className="text-2xl font-bold text-green-600">{formatPrice(profile.credits)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Minhas Ofertas</p>
                <p className="text-2xl font-bold text-blue-600">{getTabCount('ACTIVE')}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Compras</p>
                <p className="text-2xl font-bold text-purple-600">{profile._count.buyerTransactions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-full">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Vendas</p>
                <p className="text-2xl font-bold text-orange-600">{profile._count.sellerTransactions}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Ações Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/profile"
              className="flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Meu Perfil</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Gerenciar conta e créditos</p>
              </div>
            </Link>

            <Link
              to="/marketplace"
              className="flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Buscar Milhas</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Explorar ofertas disponíveis</p>
              </div>
            </Link>

          </div>
        </div>

        {/* Activity Notifications - Only show when there are NEW notifications */}
        {((newSalesCount > 0 && showSalesNotification) || (pendingApprovalsCount > 0 && showApprovalsNotification)) && (
          <div className="space-y-4 mb-8">
            {/* Vendas Novas - Only show if there are NEW sales and notification is not dismissed */}
            {newSalesCount > 0 && showSalesNotification && (
              <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg mr-3">
                      <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-800 dark:text-green-200">
                        🎉 Parabéns! Você vendeu {newSalesCount} {newSalesCount === 1 ? 'nova oferta' : 'novas ofertas'}!
                      </h3>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        {newSalesCount === 1 ? 'Sua venda mais recente está' : 'Suas vendas mais recentes estão'} na aba "Vendidas"
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={markSalesAsViewed}
                    className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 transition-colors p-1"
                    title="Fechar notificação"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Pedidos de Aprovação - Only show if there are REAL pending approvals */}
            {pendingApprovalsCount > 0 && showApprovalsNotification && (
              <div className="bg-orange-50 dark:bg-orange-900 border border-orange-200 dark:border-orange-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-100 dark:bg-orange-800 rounded-lg mr-3">
                      <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-orange-800 dark:text-orange-200">
                        📋 {pendingApprovalsCount} {pendingApprovalsCount === 1 ? 'Aprovação Pendente' : 'Aprovações Pendentes'}
                      </h3>
                      <p className="text-sm text-orange-600 dark:text-orange-400">
                        {pendingApprovalsCount === 1 ? 'Há uma alteração' : `Há ${pendingApprovalsCount} alterações`} de dados aguardando sua aprovação
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setPendingApprovalsModal(true);
                        setShowApprovalsNotification(false); // Ocultar notificação ao abrir modal
                      }}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
                    >
                      Ver {pendingApprovalsCount === 1 ? 'Pendência' : 'Pendências'}
                    </button>
                    <button
                      onClick={() => setShowApprovalsNotification(false)}
                      className="text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-200 transition-colors p-1"
                      title="Fechar notificação"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Painel de Notificações */}
        <div className="mb-8">
          <NotificationsPanel />
        </div>

        {/* Offers with Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Minhas Ofertas</h2>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('active')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'active'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Ativas ({getTabCount('ACTIVE')})
              </button>
              <button
                onClick={() => {
                  setActiveTab('sold');
                  markSalesAsViewed(); // Ocultar notificação de vendas ao clicar na aba
                }}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'sold'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Vendidas ({getTabCount('SOLD')})
              </button>
              <button
                onClick={() => setActiveTab('cancelled')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'cancelled'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Canceladas ({getTabCount('CANCELLED')})
              </button>
              <button
                onClick={() => setActiveTab('purchased')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'purchased'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Compradas ({getPurchasedOffers().length})
              </button>
              <button
                onClick={() => setActiveTab('ratings')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'ratings'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Avaliações ({pendingRatings.length})
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'ratings' ? (
            // Conteúdo da aba de avaliações
            <div>
              {(() => {
                try {
                  if (pendingRatings.length === 0) {
                    return (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                        <p className="text-gray-500">Não há avaliações pendentes</p>
                        <p className="text-sm text-gray-400 mt-1">
                          Complete transações para poder avaliar outros usuários
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-4">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          <p className="text-sm text-yellow-800">
                            Você tem {pendingRatings.length} transação(ões) aguardando avaliação
                          </p>
                        </div>
                      </div>

                      {pendingRatings.map((transaction) => {
                        try {
                          // Verificações de segurança para evitar erros
                          if (!transaction || !transaction.buyer || !transaction.seller || !transaction.offer) {
                            console.warn('Transação com dados incompletos:', transaction);
                            return null;
                          }

                          const isCurrentUserBuyer = transaction.buyer.id === user?.id;
                          const otherUser = isCurrentUserBuyer ? transaction.seller : transaction.buyer;
                          const userRole = isCurrentUserBuyer ? 'comprador' : 'vendedor';

                          return (
                            <div key={transaction.id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <h3 className="font-medium text-gray-900">{transaction.offer?.title || 'Título não disponível'}</h3>
                                    <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(transaction.offer?.type || 'SALE')}`}>
                                      {getTypeText(transaction.offer?.type || 'SALE')}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600">
                                    {formatMiles(transaction.offer?.milesAmount || 0)} milhas • {transaction.offer?.airline?.name || 'Companhia não especificada'}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Você como {userRole} • Avaliar: <span className="font-medium">{otherUser?.name || 'Usuário'}</span>
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    Transação realizada em: {formatDateTime(transaction.createdAt)}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-1 font-mono">
                                    ID Transação: {transaction.transactionHash || 'N/A'}
                                  </p>
                                </div>
                                <button
                                  onClick={() => setRatingModal({ isOpen: true, transaction })}
                                  className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
                                >
                                  Avaliar
                                </button>
                              </div>
                            </div>
                          );
                        } catch (error) {
                          console.error('Erro ao renderizar transação:', error, transaction);
                          return (
                            <div key={transaction?.id || Math.random()} className="border border-red-200 rounded-lg p-4 bg-red-50">
                              <p className="text-red-600">Erro ao carregar transação</p>
                            </div>
                          );
                        }
                      }).filter(Boolean)}
                    </div>
                  );
                } catch (error) {
                  console.error('Erro na aba de avaliações:', error);
                  return (
                    <div className="text-center py-8">
                      <div className="text-red-600 text-6xl mb-4">⚠️</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar avaliações</h3>
                      <p className="text-gray-600 mb-4">Ocorreu um erro ao carregar as avaliações pendentes.</p>
                      <button
                        onClick={() => window.location.reload()}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Recarregar Página
                      </button>
                    </div>
                  );
                }
              })()}
            </div>
          ) : activeTab === 'purchased' ? (
            // Conteúdo da aba de compras
            getPurchasedOffers().length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Você ainda não comprou nenhuma oferta</p>
                <Link
                  to="/marketplace"
                  className="mt-2 inline-block text-primary-600 hover:text-primary-700"
                >
                  Explorar marketplace
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {getPurchasedOffers().map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium text-gray-900">{transaction.offer.title}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(transaction.offer.type)}`}>
                          {getTypeText(transaction.offer.type)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {formatMiles(transaction.offer.milesAmount)} milhas • {transaction.offer.airline?.name || 'Companhia não especificada'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Comprada de: <Link
                          to={`/user/${transaction.seller.id}`}
                          className="text-primary-600 hover:text-primary-700 hover:underline"
                        >
                          {transaction.seller.name}
                        </Link> • {formatDateTime(transaction.createdAt)}
                      </p>
                      <p className="text-xs text-gray-400 mt-1 font-mono">
                        ID Transação: {transaction.transactionHash}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatPrice(transaction.amount)}</p>
                      <span className="inline-block px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                        Comprada
                      </span>
                      <button
                        onClick={() => {
                          console.log('🔧 Abrindo modal de edição de passageiros para transação:', transaction);
                          setEditPassengerModal({ isOpen: true, transaction });
                        }}
                        className="mt-2 px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors block"
                      >
                        Editar Dados dos Passageiros
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (activeTab === 'sold' ? getSoldTransactions().length === 0 : getFilteredOffers().length === 0) ? (
            <div className="text-center py-8">
              {activeTab === 'active' ? (
                <>
                  <p className="text-gray-500">Você não tem ofertas ativas</p>
                  <Link
                    to="/marketplace"
                    className="mt-2 inline-block text-primary-600 hover:text-primary-700"
                  >
                    Criar primeira oferta
                  </Link>
                </>
              ) : activeTab === 'sold' ? (
                <p className="text-gray-500">Você ainda não vendeu nenhuma oferta</p>
              ) : (
                <p className="text-gray-500">Você não tem ofertas canceladas</p>
              )}
            </div>
          ) : activeTab === 'sold' ? (
            <div className="space-y-4">
              {getSoldTransactions().map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium text-gray-900">{transaction.offer.title}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(transaction.offer.type)}`}>
                        {getTypeText(transaction.offer.type)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {formatMiles(transaction.offer.milesAmount)} milhas • {transaction.offer.airline?.name || 'Companhia não especificada'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Vendida para: <Link
                        to={`/user/${transaction.buyer.id}`}
                        className="text-primary-600 hover:text-primary-700 hover:underline"
                      >
                        {transaction.buyer.name}
                      </Link> • {formatDateTime(transaction.createdAt)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 font-mono">
                      ID Transação: {transaction.transactionHash}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatPrice(transaction.amount)}</p>
                    <span className="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      Vendida
                    </span>
                    <button
                      onClick={() => {
                        setPassengerDataModal({ isOpen: true, transaction });
                        loadPassengerData(transaction.id);
                      }}
                      className="mt-2 px-3 py-1 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      Ver Dados dos Passageiros
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {getFilteredOffers().map((offer) => (
                <div key={offer.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium text-gray-900">{offer.title}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(offer.type)}`}>
                        {getTypeText(offer.type)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {formatMiles(offer.milesAmount)} milhas • {offer.airline?.name || 'Companhia não especificada'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Criada em: {formatDateTime(offer.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatPrice(offer.price)}</p>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(offer.status)}`}>
                        {getStatusText(offer.status)}
                      </span>
                    </div>

                    {/* Botões para ofertas ativas */}
                    {offer.status === 'ACTIVE' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditOfferModal({ isOpen: true, offer })}
                          className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleCancelOffer(offer.id)}
                          disabled={cancellingOffer === offer.id}
                          className="px-3 py-1 text-xs bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {cancellingOffer === offer.id ? 'Cancelando...' : 'Cancelar'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Avaliação */}
      <RatingModal
        isOpen={ratingModal.isOpen}
        onClose={() => setRatingModal({ isOpen: false, transaction: null })}
        transaction={ratingModal.transaction}
        currentUserId={user?.id || ''}
        onRatingSubmitted={() => {
          loadDashboardData(); // Recarregar dados após avaliação
        }}
      />

      {/* Modal de Busca de Transação */}
      <TransactionSearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
      />

      {/* Modal de Edição de Oferta */}
      <EditOfferModal
        isOpen={editOfferModal.isOpen}
        onClose={() => setEditOfferModal({ isOpen: false, offer: null })}
        offer={editOfferModal.offer}
        onOfferUpdated={() => {
          loadDashboardData(); // Recarregar dados após edição
          setEditOfferModal({ isOpen: false, offer: null });
        }}
      />

      {/* Modal de Edição de Dados dos Passageiros */}
      <EditPassengerDataModal
        isOpen={editPassengerModal.isOpen}
        onClose={() => setEditPassengerModal({ isOpen: false, transaction: null })}
        transaction={editPassengerModal.transaction}
        onDataUpdated={() => {
          loadDashboardData(); // Recarregar dados após edição
        }}
      />

      {/* Modal de Aprovações Pendentes */}
      <PendingApprovalsModal
        isOpen={pendingApprovalsModal}
        onClose={() => setPendingApprovalsModal(false)}
        onApprovalProcessed={() => {
          loadDashboardData(); // Recarregar dados após aprovação
        }}
      />



      {/* Modal de Dados dos Passageiros */}
      {passengerDataModal.isOpen && passengerDataModal.transaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-xl">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold">✈️ Dados dos Passageiros</h3>
                  <p className="text-green-100 text-sm mt-1">
                    Informações fornecidas pelo comprador: {passengerDataModal.transaction.buyer.name}
                  </p>
                </div>
                <button
                  onClick={() => setPassengerDataModal({ isOpen: false, transaction: null })}
                  className="text-green-100 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Informações da Venda */}
              <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">
                  📋 Informações da Venda
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-600 dark:text-blue-400 font-medium">Oferta:</span>
                    <p className="text-blue-800 dark:text-blue-200">{passengerDataModal.transaction.offer.title}</p>
                  </div>
                  <div>
                    <span className="text-blue-600 dark:text-blue-400 font-medium">Milhas:</span>
                    <p className="text-blue-800 dark:text-blue-200">{formatMiles(passengerDataModal.transaction.offer.milesAmount)} milhas</p>
                  </div>
                  <div>
                    <span className="text-blue-600 dark:text-blue-400 font-medium">Companhia:</span>
                    <p className="text-blue-800 dark:text-blue-200">{passengerDataModal.transaction.offer.airline?.name || 'Companhia não especificada'}</p>
                  </div>
                  <div>
                    <span className="text-blue-600 dark:text-blue-400 font-medium">Valor:</span>
                    <p className="text-blue-800 dark:text-blue-200">{formatPrice(passengerDataModal.transaction.amount)}</p>
                  </div>
                  <div>
                    <span className="text-blue-600 dark:text-blue-400 font-medium">Comprador:</span>
                    <p className="text-blue-800 dark:text-blue-200">{passengerDataModal.transaction.buyer.name}</p>
                  </div>
                  <div>
                    <span className="text-blue-600 dark:text-blue-400 font-medium">Data da Venda:</span>
                    <p className="text-blue-800 dark:text-blue-200">{formatDateTime(passengerDataModal.transaction.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* Dados dos Passageiros - Reais */}
              <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-green-800 dark:text-green-200 mb-3">
                  👥 Dados dos Passageiros
                </h4>

                {loadingPassengerData ? (
                  <div className="text-center py-8">
                    <div className="text-lg">Carregando dados dos passageiros...</div>
                  </div>
                ) : passengerDataList.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-green-700 dark:text-green-300">Nenhum dado de passageiro encontrado</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {passengerDataList.map((passenger, index) => (
                      <div key={passenger.id} className="bg-white dark:bg-gray-700 rounded-lg p-4">
                        <h5 className="font-medium text-gray-900 dark:text-white mb-3">Passageiro {index + 1}</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600 dark:text-gray-400 font-medium">Nome Completo:</span>
                            <p className="text-gray-900 dark:text-white">{passenger.fullName}</p>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400 font-medium">CPF:</span>
                            <p className="text-gray-900 dark:text-white">{passenger.cpf}</p>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400 font-medium">Data de Nascimento:</span>
                            <p className="text-gray-900 dark:text-white">{passenger.birthDate}</p>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400 font-medium">E-mail:</span>
                            <p className="text-gray-900 dark:text-white">{passenger.email}</p>
                          </div>
                          <div className="md:col-span-2">
                            <span className="text-gray-600 dark:text-gray-400 font-medium">Tipo de Tarifa:</span>
                            <p className="text-gray-900 dark:text-white">{passenger.fareType}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Próximos Passos */}
              <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-green-800 dark:text-green-200 mb-3">
                  📞 Próximos Passos
                </h4>
                <ul className="text-sm text-green-700 dark:text-green-300 space-y-2">
                  <li>• Entre em contato com o comprador: {passengerDataModal.transaction.buyer.name}</li>
                  <li>• Use os dados dos passageiros para emitir as passagens</li>
                  <li>• Envie as informações de voo por e-mail</li>
                  <li>• Confirme a emissão das passagens com o comprador</li>
                </ul>
              </div>

              {/* Botão Fechar */}
              <div className="flex justify-end">
                <button
                  onClick={() => setPassengerDataModal({ isOpen: false, transaction: null })}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};