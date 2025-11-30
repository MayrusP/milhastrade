import { Offer } from '@/types';
import { VerifiedBadge } from '../verification/VerifiedBadge';

interface OfferCardProps {
  offer: Offer;
  onViewDetails?: (offer: Offer) => void;
  onStartTransaction?: (offer: Offer) => void;
  showActions?: boolean;
}

export const OfferCard = ({ 
  offer, 
  onViewDetails, 
  onStartTransaction, 
  showActions = true 
}: OfferCardProps) => {
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

  const getTypeLabel = (type: string) => {
    return type === 'SALE' ? 'Venda' : 'Troca';
  };

  const getTypeColor = (type: string) => {
    return type === 'SALE' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-blue-100 text-blue-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
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
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(offer.type)}`}>
          {getTypeLabel(offer.type)}
        </span>
      </div>

      {offer.description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {offer.description}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 mb-4">
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

      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <div className="flex items-center space-x-2">
          <span>Por: {offer.user.name}</span>
          <VerifiedBadge isVerified={offer.user.isVerified || false} size="sm" />
        </div>
        <span>{formatDateTime(offer.createdAt)}</span>
      </div>

      {showActions && (
        <div className="flex space-x-2">
          {onViewDetails && (
            <button
              onClick={() => onViewDetails(offer)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              Ver detalhes
            </button>
          )}
          {onStartTransaction && (
            <button
              onClick={() => onStartTransaction(offer)}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              Iniciar transação
            </button>
          )}
        </div>
      )}
    </div>
  );
};