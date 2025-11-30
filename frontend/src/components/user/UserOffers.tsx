import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { OfferService } from '@/services/offerService';
import { Offer, OfferListResponse } from '@/types';

export const UserOffers = () => {
  const [data, setData] = useState<OfferListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserOffers();
  }, []);

  const fetchUserOffers = async () => {
    try {
      setIsLoading(true);
      const response = await OfferService.getUserOffers();
      setData(response);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar suas ofertas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteOffer = async (offerId: string) => {
    if (!window.confirm('Tem certeza que deseja remover esta oferta?')) {
      return;
    }

    try {
      await OfferService.deleteOffer(offerId);
      await fetchUserOffers(); // Refresh the list
    } catch (err: any) {
      alert(err.message || 'Erro ao remover oferta');
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'SOLD':
        return 'bg-gray-100 text-gray-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-md animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-4 w-3/4"></div>
              <div className="grid grid-cols-3 gap-4">
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Minhas Ofertas</h1>
        <Link
          to="/offers/create"
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          Nova Oferta
        </Link>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Offers List */}
      {data && data.offers.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">
            Você ainda não criou nenhuma oferta
          </div>
          <Link
            to="/offers/create"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Criar primeira oferta
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {data?.offers.map((offer) => (
            <div key={offer.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {offer.title}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>{offer.airline?.name || 'Companhia não especificada'}</span>
                    <span>•</span>
                    <span>{offer.type === 'SALE' ? 'Venda' : 'Troca'}</span>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(offer.status)}`}>
                  {getStatusLabel(offer.status)}
                </span>
              </div>

              {offer.description && (
                <p className="text-gray-600 text-sm mb-4">
                  {offer.description}
                </p>
              )}

              <div className="grid grid-cols-3 gap-4 mb-4">
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
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Transações</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {(offer as any).transactions?.length || 0}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>Criada em {formatDateTime(offer.createdAt)}</span>
                <span>Atualizada em {formatDateTime(offer.updatedAt)}</span>
              </div>

              {offer.status === 'ACTIVE' && (
                <div className="flex space-x-2">
                  <Link
                    to={`/offers/${offer.id}/edit`}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-center"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => handleDeleteOffer(offer.id)}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    Remover
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <div className="text-sm text-gray-600">
            Página {data.pagination.page} de {data.pagination.totalPages} 
            ({data.pagination.total} ofertas no total)
          </div>
        </div>
      )}
    </div>
  );
};