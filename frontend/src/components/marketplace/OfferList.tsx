import { Offer } from '@/types';
import { OfferCard } from './OfferCard';

interface OfferListProps {
  offers: Offer[];
  isLoading: boolean;
  error: string | null;
  onViewDetails?: (offer: Offer) => void;
  onStartTransaction?: (offer: Offer) => void;
  showActions?: boolean;
  emptyMessage?: string;
}

export const OfferList = ({
  offers,
  isLoading,
  error,
  onViewDetails,
  onStartTransaction,
  showActions = true,
  emptyMessage = 'Nenhuma oferta encontrada',
}: OfferListProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-4"></div>
            <div className="h-3 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded mb-4"></div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
            <div className="flex space-x-2">
              <div className="flex-1 h-8 bg-gray-200 rounded"></div>
              <div className="flex-1 h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md inline-block">
          {error}
        </div>
      </div>
    );
  }

  if (offers.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">
          {emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {offers.map((offer) => (
        <OfferCard
          key={offer.id}
          offer={offer}
          onViewDetails={onViewDetails}
          onStartTransaction={onStartTransaction}
          showActions={showActions}
        />
      ))}
    </div>
  );
};