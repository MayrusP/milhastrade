import React from 'react';
import { Layout } from '../components/common/Layout';
import { PurchaseConfirmationModal } from '../components/common/PurchaseConfirmationModal';
import { PassengerDataCollectionModal } from '../components/common/PassengerDataCollectionModal';
import { PurchaseSuccessModal } from '../components/common/PurchaseSuccessModal';
import { OfferCreatedModal } from '../components/common/OfferCreatedModal';
import { Toast } from '../components/common/Toast';
import { useAuth } from '../hooks/useAuthSimple';
import { useToast } from '../hooks/useToast';
import { api } from '../services/api';

interface Offer {
  id: string;
  title: string;
  description?: string;
  milesAmount: number;
  price: number;
  type: string;
  status: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  airline: {
    id: string;
    name: string;
    code: string;
  };
}

interface Airline {
  id: string;
  name: string;
  code: string;
}

export const MarketplacePage = () => {
  const { refreshUser } = useAuth();
  const { toasts, showError, removeToast } = useToast();
  const [offers, setOffers] = React.useState<Offer[]>([]);
  const [filteredOffers, setFilteredOffers] = React.useState<Offer[]>([]);
  const [airlines, setAirlines] = React.useState<Airline[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  
  // Estados do modal de confirmação de compra
  const [showPurchaseModal, setShowPurchaseModal] = React.useState(false);
  const [showPassengerDataModal, setShowPassengerDataModal] = React.useState(false);
  const [selectedOffer, setSelectedOffer] = React.useState<Offer | null>(null);
  const [isProcessingPurchase, setIsProcessingPurchase] = React.useState(false);
  
  // Estados do modal de sucesso
  const [showSuccessModal, setShowSuccessModal] = React.useState(false);
  const [isSuccessModalTemporarilyHidden, setIsSuccessModalTemporarilyHidden] = React.useState(false);
  const [passengersDataSent, setPassengersDataSent] = React.useState(false);
  const [successData, setSuccessData] = React.useState<{
    transactionHash: string;
    milesAmount: number;
    airlineName: string;
    price: number;
  } | null>(null);
  
  // Estados dos filtros
  const [filters, setFilters] = React.useState({
    airline: '',
    type: '',
    minPrice: '',
    maxPrice: '',
    sortBy: ''
  });

  // Estado do modal de criação de oferta
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [isCreatingOffer, setIsCreatingOffer] = React.useState(false);
  
  // Estado do modal de sucesso da criação
  const [showOfferCreatedModal, setShowOfferCreatedModal] = React.useState(false);
  const [createdOfferTitle, setCreatedOfferTitle] = React.useState('');
  const [createOfferData, setCreateOfferData] = React.useState({
    title: '',
    description: '',
    milesAmount: '',
    price: '',
    type: 'SALE',
    airlineId: ''
  });

  React.useEffect(() => {
    fetchOffers();
    fetchAirlines();
  }, []);

  const fetchOffers = async () => {
    try {
      const response = await api.get('/offers');
      if (response.data.success) {
        setOffers(response.data.data.offers);
        setFilteredOffers(response.data.data.offers);
      }
    } catch (error) {
      console.error('Erro ao buscar ofertas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAirlines = async () => {
    try {
      const response = await api.get('/offers/airlines');
      if (response.data.success) {
        setAirlines(response.data.data.airlines);
      }
    } catch (error) {
      console.error('Erro ao buscar companhias:', error);
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

  // Função para aplicar filtros
  const applyFilters = React.useCallback(() => {
    let filtered = [...offers];

    // Filtro por companhia aérea
    if (filters.airline) {
      filtered = filtered.filter(offer => offer.airline.id === filters.airline);
    }

    // Filtro por tipo
    if (filters.type) {
      filtered = filtered.filter(offer => offer.type === filters.type);
    }

    // Filtro por preço mínimo
    if (filters.minPrice) {
      const minPrice = parseFloat(filters.minPrice);
      filtered = filtered.filter(offer => offer.price >= minPrice);
    }

    // Filtro por preço máximo
    if (filters.maxPrice) {
      const maxPrice = parseFloat(filters.maxPrice);
      filtered = filtered.filter(offer => offer.price <= maxPrice);
    }

    // Ordenação por preço por 1000 milhas
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        const pricePerThousandA = (a.price / a.milesAmount) * 1000;
        const pricePerThousandB = (b.price / b.milesAmount) * 1000;
        
        if (filters.sortBy === 'price_asc') {
          return pricePerThousandA - pricePerThousandB; // Menor para maior
        } else if (filters.sortBy === 'price_desc') {
          return pricePerThousandB - pricePerThousandA; // Maior para menor
        }
        return 0;
      });
    }

    setFilteredOffers(filtered);
  }, [offers, filters]);

  // Aplicar filtros quando offers ou filters mudarem
  React.useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Handlers para mudança de filtros
  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Função para limpar filtros
  const clearFilters = () => {
    setFilters({
      airline: '',
      type: '',
      minPrice: '',
      maxPrice: '',
      sortBy: ''
    });
  };

  // Funções do modal de criação
  const openCreateModal = () => {
    setShowCreateModal(true);
    setCreateOfferData({
      title: '',
      description: '',
      milesAmount: '',
      price: '',
      type: 'SALE',
      airlineId: ''
    });
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setCreateOfferData({
      title: '',
      description: '',
      milesAmount: '',
      price: '',
      type: 'SALE',
      airlineId: ''
    });
  };

  const handleCreateOfferChange = (field: string, value: string) => {
    setCreateOfferData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    if (!createOfferData.title.trim()) {
      showError('Título é obrigatório');
      return;
    }
    if (!createOfferData.airlineId) {
      showError('Companhia aérea é obrigatória');
      return;
    }
    if (!createOfferData.milesAmount || parseFloat(createOfferData.milesAmount) <= 0) {
      showError('Quantidade de milhas deve ser maior que zero');
      return;
    }
    if (!createOfferData.price || parseFloat(createOfferData.price) <= 0) {
      showError('Preço deve ser maior que zero');
      return;
    }

    const token = localStorage.getItem('auth_token');
    if (!token) {
      showError('Você precisa estar logado para criar uma oferta');
      return;
    }

    setIsCreatingOffer(true);
    try {
      const response = await api.post('/offers', {
        title: createOfferData.title,
        description: createOfferData.description,
        milesAmount: parseFloat(createOfferData.milesAmount),
        price: parseFloat(createOfferData.price),
        type: createOfferData.type,
        airlineId: createOfferData.airlineId
      });

      if (response.data.success) {
        setCreatedOfferTitle(createOfferData.title);
        setShowOfferCreatedModal(true);
        closeCreateModal();
        fetchOffers(); // Recarregar ofertas
      }
    } catch (error: any) {
      console.error('Erro ao criar oferta:', error);
      
      if (error.response?.data?.message) {
        showError(`Erro: ${error.response.data.message}`);
      } else {
        showError('Erro ao criar oferta. Tente novamente.');
      }
    } finally {
      setIsCreatingOffer(false);
    }
  };

  const handleBuyOffer = (offer: Offer) => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      showError('Você precisa estar logado para comprar uma oferta');
      return;
    }

    setSelectedOffer(offer);
    setShowPurchaseModal(true);
  };

  const handleConfirmPurchase = async () => {
    if (!selectedOffer) return;

    setIsProcessingPurchase(true);
    try {
      // Primeiro, processar a compra sem dados de passageiros
      const response = await api.post(`/offers/${selectedOffer.id}/buy`, {
        passengersData: [] // Compra sem dados iniciais
      });
      
      if (response.data.success) {
        const transaction = response.data.data.transaction;
        
        // Atualizar saldo do usuário no contexto
        await refreshUser();
        
        // Recarregar ofertas para atualizar a lista
        fetchOffers();
        
        // Preparar dados para o modal de sucesso
        setSuccessData({
          transactionHash: transaction.transactionHash,
          milesAmount: selectedOffer.milesAmount,
          airlineName: selectedOffer.airline?.name || 'Companhia não especificada',
          price: selectedOffer.price
        });
        
        // Fechar modal de confirmação e abrir modal de sucesso
        setShowPurchaseModal(false);
        setSelectedOffer(null);
        setPassengersDataSent(false); // ✅ Resetar estado para nova compra
        setShowSuccessModal(true);
      }
    } catch (error: any) {
      console.error('Erro ao processar compra:', error);
      
      if (error.response?.data?.message) {
        showError(`Erro: ${error.response.data.message}`);
      } else {
        showError('Erro ao processar a compra. Tente novamente.');
      }
      
      // Em caso de erro, fechar modal e resetar estado
      setShowPurchaseModal(false);
      setSelectedOffer(null);
    } finally {
      setIsProcessingPurchase(false);
    }
  };

  const handlePassengerDataSubmit = async (passengersData: any[]) => {
    if (!successData) return;

    setIsProcessingPurchase(true);
    try {
      // Adicionar dados de passageiros à transação já criada
      const response = await api.post(`/transactions/${successData.transactionHash}/passenger-data`, {
        passengersData
      });
      
      if (response.data.success) {
        // Fechar modal de dados dos passageiros e voltar ao modal de sucesso
        setShowPassengerDataModal(false);
        setIsSuccessModalTemporarilyHidden(false); // Mostrar novamente o modal de sucesso
        setPassengersDataSent(true); // ✅ Marcar que os dados foram enviados
      }
    } catch (error: any) {
      
      if (error.response?.status === 404) {
        showError('Erro: Endpoint não encontrado. Verifique se o servidor está funcionando.');
      } else if (error.response?.data?.message) {
        showError(`Erro: ${error.response.data.message}`);
      } else {
        showError(`Erro ao adicionar dados de passageiros: ${error.message}`);
      }
    } finally {
      setIsProcessingPurchase(false);
    }
  };

  const handleCancelPurchase = () => {
    setShowPurchaseModal(false);
    setSelectedOffer(null);
    setIsProcessingPurchase(false);
  };

  const handleCancelPassengerData = () => {
    setShowPassengerDataModal(false);
    setIsSuccessModalTemporarilyHidden(false); // Mostrar novamente o modal de sucesso
    setIsProcessingPurchase(false);
  };

  const handleAddPassengerData = () => {
    // Verificar se temos os dados necessários
    if (!successData) {
      showError('Erro: Dados da transação não encontrados');
      return;
    }
    
    // Criar uma oferta temporária baseada nos dados de sucesso
    if (!selectedOffer && successData) {
      const tempOffer = {
        id: 'temp-offer',
        title: `Milhas ${successData.airlineName}`,
        milesAmount: successData.milesAmount,
        price: successData.price,
        airline: {
          name: successData.airlineName
        }
      };
      setSelectedOffer(tempOffer as any);
    }
    
    // Ocultar temporariamente o modal de sucesso e abrir modal de passageiros
    setIsSuccessModalTemporarilyHidden(true);
    setShowPassengerDataModal(true);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Marketplace de Milhas</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Encontre as melhores ofertas de milhas aéreas disponíveis
            </p>
          </div>
          <button 
            onClick={openCreateModal}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
          >
            + Nova Oferta
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filtros</h3>
            <button 
              onClick={clearFilters}
              className="text-sm text-primary-600 hover:text-primary-700 focus:outline-none"
            >
              Limpar filtros
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <select 
              value={filters.airline}
              onChange={(e) => handleFilterChange('airline', e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Todas as companhias</option>
              {airlines.map((airline) => (
                <option key={airline.id} value={airline.id}>
                  {airline.name}
                </option>
              ))}
            </select>
            <select 
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Todos os tipos</option>
              <option value="SALE">Venda</option>
              <option value="BUY">Compra</option>
            </select>
            <input 
              type="number" 
              placeholder="Preço mínimo" 
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            />
            <input 
              type="number" 
              placeholder="Preço máximo" 
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            />
            <select 
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Ordenar por</option>
              <option value="price_asc">Menor preço/Milheiro</option>
              <option value="price_desc">Maior preço/Milheiro</option>
            </select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {isLoading ? 'Carregando...' : `Mostrando ${filteredOffers.length} de ${offers.length} ofertas disponíveis`}
          </p>
        </div>

        {/* Offers Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : filteredOffers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {offers.length === 0 ? 'Nenhuma oferta disponível no momento' : 'Nenhuma oferta encontrada com os filtros aplicados'}
            </p>
            <p className="text-gray-400 text-sm mt-2">
              {offers.length === 0 ? 'Seja o primeiro a criar uma oferta!' : 'Tente ajustar os filtros para ver mais resultados'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOffers.map((offer) => (
            <div key={offer.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {offer.title}
                  </h3>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm font-medium text-gray-600">
                      {offer.airline?.name || 'Companhia não especificada'}
                    </span>
                    <span className="text-xs text-gray-400">({offer.airline.code})</span>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  offer.type === 'SALE' 
                    ? 'bg-green-100 text-green-800' 
                    : offer.type === 'BUY'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-purple-100 text-purple-800'
                }`}>
                  {offer.type === 'SALE' ? 'Venda' : offer.type === 'BUY' ? 'Compra' : 'Troca'}
                </span>
              </div>

              {offer.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {offer.description}
                </p>
              )}

              <div className="grid grid-cols-2 gap-4 mb-3">
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

              {/* Preço por milheiro */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Preço por 1.000 milhas:</span>
                  <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                    {formatPrice((offer.price / offer.milesAmount) * 1000)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>Por: {offer.user.name}</span>
                <span>{formatDateTime(offer.createdAt)}</span>
              </div>

              <div className="flex justify-center">
                <button 
                  onClick={() => handleBuyOffer(offer)}
                  disabled={offer.status !== 'ACTIVE'}
                  className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {offer.status === 'SOLD' ? 'Vendido' : 'Comprar'}
                </button>
              </div>
            </div>
          ))}
          </div>
        )}
      </div>

      {/* Modal de Confirmação de Compra */}
      <PurchaseConfirmationModal
        offer={selectedOffer}
        isOpen={showPurchaseModal}
        isProcessing={isProcessingPurchase}
        onConfirm={handleConfirmPurchase}
        onCancel={handleCancelPurchase}
      />

      {/* Modal de Coleta de Dados dos Passageiros */}
      <PassengerDataCollectionModal
        offer={selectedOffer}
        isOpen={showPassengerDataModal}
        isProcessing={isProcessingPurchase}
        onConfirm={handlePassengerDataSubmit}
        onCancel={handleCancelPassengerData}
      />

      {/* Modal de Sucesso da Compra */}
      <PurchaseSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        transactionData={successData}
      />

      {/* Modal de Sucesso da Criação de Oferta */}
      <OfferCreatedModal
        isOpen={showOfferCreatedModal}
        onClose={() => setShowOfferCreatedModal(false)}
        offerTitle={createdOfferTitle}
      />

      {/* Modal de Criação de Oferta */}
      {showCreateModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={closeCreateModal}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Nova Oferta</h2>
                <button
                  onClick={closeCreateModal}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCreateOffer} className="space-y-6">
                {/* Título */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Título da Oferta *
                  </label>
                  <input
                    type="text"
                    id="title"
                    required
                    value={createOfferData.title}
                    onChange={(e) => handleCreateOfferChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Ex: Milhas TAM - Ótimo preço!"
                  />
                </div>

                {/* Descrição */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Descrição (opcional)
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    value={createOfferData.description}
                    onChange={(e) => handleCreateOfferChange('description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Descreva detalhes sobre suas milhas..."
                  />
                </div>

                {/* Companhia Aérea e Tipo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="airlineId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Companhia Aérea *
                    </label>
                    <select
                      id="airlineId"
                      required
                      value={createOfferData.airlineId}
                      onChange={(e) => handleCreateOfferChange('airlineId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Selecione uma companhia</option>
                      {airlines.map((airline) => (
                        <option key={airline.id} value={airline.id}>
                          {airline.name} ({airline.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tipo de Oferta *
                    </label>
                    <select
                      id="type"
                      required
                      value={createOfferData.type}
                      onChange={(e) => handleCreateOfferChange('type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="SALE">Venda</option>
                      <option value="BUY">Compra</option>
                    </select>
                  </div>
                </div>

                {/* Quantidade de Milhas e Preço */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="milesAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Quantidade de Milhas *
                    </label>
                    <input
                      type="number"
                      id="milesAmount"
                      required
                      min="1"
                      value={createOfferData.milesAmount}
                      onChange={(e) => handleCreateOfferChange('milesAmount', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Ex: 50000"
                    />
                  </div>

                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Preço (R$) *
                    </label>
                    <input
                      type="number"
                      id="price"
                      required
                      min="0.01"
                      step="0.01"
                      value={createOfferData.price}
                      onChange={(e) => handleCreateOfferChange('price', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Ex: 1500.00"
                    />
                  </div>
                </div>

                {/* Preço por Milha e Milheiro */}
                {createOfferData.milesAmount && createOfferData.price && 
                 parseFloat(createOfferData.milesAmount) > 0 && parseFloat(createOfferData.price) > 0 && (
                  <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-md p-3">
                    <div className="space-y-1">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        <strong>Preço por milha:</strong> {formatPrice(parseFloat(createOfferData.price) / parseFloat(createOfferData.milesAmount))}
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        <strong>Preço por 1.000 milhas:</strong> {formatPrice((parseFloat(createOfferData.price) / parseFloat(createOfferData.milesAmount)) * 1000)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Botões de Ação */}
                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={closeCreateModal}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingOffer}
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreatingOffer ? 'Criando...' : 'Criar Oferta'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Compra */}
      <PurchaseConfirmationModal
        offer={selectedOffer}
        isOpen={showPurchaseModal}
        isProcessing={isProcessingPurchase}
        onConfirm={handleConfirmPurchase}
        onCancel={handleCancelPurchase}
      />

      {/* Modal de Coleta de Dados dos Passageiros */}
      <PassengerDataCollectionModal
        offer={selectedOffer}
        isOpen={showPassengerDataModal}
        isProcessing={isProcessingPurchase}
        onConfirm={handlePassengerDataSubmit}
        onCancel={handleCancelPassengerData}
      />

      {/* Modal de Sucesso da Compra */}
      <PurchaseSuccessModal
        isOpen={showSuccessModal && !isSuccessModalTemporarilyHidden}
        onClose={() => {
          setShowSuccessModal(false);
          setIsSuccessModalTemporarilyHidden(false);
          setPassengersDataSent(false); // Reset ao fechar
        }}
        onAddPassengerData={handleAddPassengerData}
        passengersDataSent={passengersDataSent}
        transactionData={successData}
      />

      {/* Modal de Sucesso da Criação de Oferta */}
      <OfferCreatedModal
        isOpen={showOfferCreatedModal}
        onClose={() => setShowOfferCreatedModal(false)}
        offerTitle={createdOfferTitle}
      />

      {/* Toasts */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </Layout>
  );
};