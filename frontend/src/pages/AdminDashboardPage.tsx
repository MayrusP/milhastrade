import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuthSimple';
import { Navigate, Link } from 'react-router-dom';
import { SimpleLineChart } from '../components/charts/SimpleLineChart';
import { AdminVerificationPanel } from '../components/verification/AdminVerificationPanel';

interface DashboardData {
  overview: {
    totalUsers: number;
    totalOffers: number;
    totalTransactions: number;
    totalCredits: number;
    activeOffers: number;
    completedTransactions: number;
    pendingTransactions: number;
    avgTransactionValue: number;
    avgRating: number;
    totalRatings: number;
  };
  usersByRole: Record<string, number>;
  dailyTransactions: Array<{
    date: string;
    count: number;
    totalAmount: number;
    avgAmount: number;
  }>;
  dailyCredits: Array<{
    date: string;
    totalCredits: number;
  }>;
  topUsers: Array<{
    id: string;
    name: string;
    email: string;
    totalTransactions: number;
  }>;
  offersByAirline: Array<{
    airlineId: string;
    _count: { id: number };
    _sum: { milesAmount: number; price: number };
  }>;
  userGrowth: Array<{
    createdAt: string;
    _count: { id: number };
  }>;
}

interface RecentActivities {
  recentTransactions: Array<{
    id: string;
    transactionHash: string;
    amount: number;
    status: string;
    createdAt: string;
    buyer: { name: string; email: string };
    seller: { name: string; email: string };
    offer: { title: string; milesAmount: number };
  }>;
  recentOffers: Array<{
    id: string;
    title: string;
    milesAmount: number;
    price: number;
    status: string;
    createdAt: string;
    user: { name: string; email: string };
    airline: { name: string };
  }>;
  recentUsers: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  }>;
  recentRatings: Array<{
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    reviewer: { name: string };
    reviewed: { name: string };
    transaction: { offer: { title: string } };
  }>;
}

export const AdminDashboardPage = () => {
  const { isAdmin, isAuthenticated } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [activities, setActivities] = useState<RecentActivities | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Redirect se não for admin
  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    fetchDashboardData();
    fetchActivities();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:5000/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setDashboardData(data.data.dashboard);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Erro ao carregar dados do dashboard');
    }
  };

  const fetchActivities = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:5000/api/admin/activities', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setActivities(data.data);
      }
    } catch (err) {
      console.error('Erro ao carregar atividades:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
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

  const getRoleIcon = (role: string) => {
    const icons = {
      'ADMIN': '🟣',
      'MODERATOR': '🔵',
      'VIP': '🟠',
      'PARTNER': '🟢',
      'ANALYST': '🔷',
      'PREMIUM': '🟡',
      'USER': '⚪',
      'SUSPENDED': '🔴'
    };
    return icons[role as keyof typeof icons] || '⚪';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'ACTIVE': 'text-green-600 bg-green-100',
      'COMPLETED': 'text-blue-600 bg-blue-100',
      'PENDING': 'text-yellow-600 bg-yellow-100',
      'CANCELLED': 'text-red-600 bg-red-100',
      'SOLD': 'text-gray-600 bg-gray-100'
    };
    return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Erro</h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          {/* Botão de Retorno */}
          <div className="mb-4">
            <Link
              to="/dashboard"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Voltar ao Dashboard
            </Link>
          </div>
          
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Painel Administrativo
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Métricas e estatísticas da plataforma MilhasTrade
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', name: 'Visão Geral', icon: '📊' },
                { id: 'users', name: 'Usuários', icon: '👥' },
                { id: 'transactions', name: 'Transações', icon: '💰' },
                { id: 'verifications', name: 'Verificações', icon: '✅' },
                { id: 'support', name: 'Suporte', icon: '🎫' },
                { id: 'activities', name: 'Atividades', icon: '📈' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'overview' && dashboardData && (
          <div className="space-y-8">
            {/* Métricas Principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Usuários</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">{dashboardData.overview.totalUsers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total em Créditos</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">{formatCurrency(dashboardData.overview.totalCredits)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ofertas Ativas</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">{dashboardData.overview.activeOffers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Transações Completas</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">{dashboardData.overview.completedTransactions}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Métricas Secundárias */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Valor Médio das Transações</h3>
                <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                  {formatCurrency(dashboardData.overview.avgTransactionValue)}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Avaliação Média</h3>
                <div className="flex items-center space-x-2">
                  <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                    {dashboardData.overview.avgRating.toFixed(1)}
                  </p>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-5 h-5 ${
                          star <= Math.round(dashboardData.overview.avgRating)
                            ? 'text-yellow-400'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {dashboardData.overview.totalRatings} avaliações
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Transações Pendentes</h3>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  {dashboardData.overview.pendingTransactions}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && dashboardData && (
          <div className="space-y-6">
            {/* Usuários por Role */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Usuários por Role</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(dashboardData.usersByRole).map(([role, count]) => (
                  <div key={role} className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl mb-2">{getRoleIcon(role)}</div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{count}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{role}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Usuários */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Top Usuários por Transações</h3>
              <div className="space-y-3">
                {dashboardData.topUsers.map((user, index) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 dark:text-primary-400 font-medium">
                          #{index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900 dark:text-white">{user.totalTransactions}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">transações</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && dashboardData && (
          <div className="space-y-6">
            {/* Gráficos de Transações */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico de Valor Médio das Transações */}
              <SimpleLineChart
                data={dashboardData.dailyTransactions.map(d => ({
                  date: d.date,
                  value: d.avgAmount || 0
                }))}
                title="Valor Médio das Transações (Últimos 30 dias)"
                color="#8B5CF6"
                formatValue={(value) => new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(value)}
              />

              {/* Gráfico de Volume de Transações */}
              <SimpleLineChart
                data={dashboardData.dailyTransactions.map(d => ({
                  date: d.date,
                  value: d.count || 0
                }))}
                title="Volume de Transações Diárias"
                color="#10B981"
                formatValue={(value) => `${value} transações`}
              />
            </div>

            {/* Gráfico de Créditos Totais */}
            <SimpleLineChart
              data={dashboardData.dailyCredits.map(d => ({
                date: d.date,
                value: d.totalCredits || 0
              }))}
              title="Evolução dos Créditos Totais na Plataforma"
              color="#F59E0B"
              formatValue={(value) => new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(value)}
              height={250}
            />

            {/* Métricas Resumidas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Volume Total</h4>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {dashboardData.dailyTransactions.reduce((sum, d) => sum + (d.count || 0), 0)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">transações nos últimos 30 dias</p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Valor Total</h4>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(dashboardData.dailyTransactions.reduce((sum, d) => sum + (d.totalAmount || 0), 0))}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">movimentados nos últimos 30 dias</p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Crescimento</h4>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {dashboardData.dailyTransactions.length > 1 ? (
                    ((dashboardData.dailyTransactions[dashboardData.dailyTransactions.length - 1]?.count || 0) - 
                     (dashboardData.dailyTransactions[0]?.count || 0)) > 0 ? '+' : ''
                  ) : ''}
                  {dashboardData.dailyTransactions.length > 1 ? 
                    Math.round(((dashboardData.dailyTransactions[dashboardData.dailyTransactions.length - 1]?.count || 0) - 
                               (dashboardData.dailyTransactions[0]?.count || 0)) / (dashboardData.dailyTransactions[0]?.count || 1) * 100) : 0}%
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">comparado ao início do período</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'verifications' && (
          <AdminVerificationPanel />
        )}

        {activeTab === 'support' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Sistema de Suporte
              </h2>
              <Link
                to="/admin/support"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Gerenciar Tickets
              </Link>
            </div>
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🎫</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Sistema de Suporte Ativo
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Gerencie tickets de suporte dos usuários da plataforma
              </p>
              <Link
                to="/admin/support"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Acessar Painel de Suporte
              </Link>
            </div>
          </div>
        )}

        {activeTab === 'activities' && activities && (
          <div className="space-y-6">
            {/* Últimas Transações */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Últimas Transações</h3>
              <div className="space-y-3">
                {activities.recentTransactions.slice(0, 10).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="font-medium text-gray-900 dark:text-white">{transaction.offer.title}</p>
                        <span className="inline-flex px-2 py-1 text-xs font-mono bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded">
                          ID: {transaction.transactionHash}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {transaction.buyer.name} ← {transaction.seller.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {formatDateTime(transaction.createdAt)}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(transaction.amount)}</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Últimos Usuários */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Novos Usuários</h3>
              <div className="space-y-3">
                {activities.recentUsers.slice(0, 10).map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-lg">{getRoleIcon(user.role)}</div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 dark:text-gray-400">{formatDateTime(user.createdAt)}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">{user.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};