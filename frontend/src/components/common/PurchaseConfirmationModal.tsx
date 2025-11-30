import React from 'react';

interface Offer {
  id: string;
  title: string;
  description?: string;
  milesAmount: number;
  price: number;
  type: string;
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

interface PurchaseConfirmationModalProps {
  offer: Offer | null;
  isOpen: boolean;
  isProcessing: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const PurchaseConfirmationModal: React.FC<PurchaseConfirmationModalProps> = ({
  offer,
  isOpen,
  isProcessing,
  onConfirm,
  onCancel
}) => {
  if (!isOpen || !offer) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const formatMiles = (miles: number) => {
    return new Intl.NumberFormat('pt-BR').format(miles);
  };

  const pricePerThousand = (offer.price / offer.milesAmount) * 1000;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onCancel}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold">Confirmar Compra</h2>
                <p className="text-primary-100 text-sm">Revise os detalhes da sua compra</p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="text-white hover:text-primary-100 focus:outline-none transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Offer Details */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                  {offer.title}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    {offer.airline?.name || 'Companhia não especificada'}
                  </span>
                  <span className="text-xs text-gray-400">({offer.airline.code})</span>
                </div>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                Venda
              </span>
            </div>

            {offer.description && (
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                {offer.description}
              </p>
            )}

            {/* Purchase Summary */}
            <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Milhas</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatMiles(offer.milesAmount)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Preço Total</p>
                  <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    {formatPrice(offer.price)}
                  </p>
                </div>
              </div>
              
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900 rounded-md">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-700 dark:text-blue-300">Preço por 1.000 milhas:</span>
                  <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                    {formatPrice(pricePerThousand)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Seller Info */}
          <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-200 dark:bg-yellow-700 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-700 dark:text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Vendedor</p>
                <p className="text-yellow-700 dark:text-yellow-300 font-semibold">{offer.user.name}</p>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-amber-50 dark:bg-amber-900 border border-amber-200 dark:border-amber-700 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
                  Importante
                </h4>
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  Ao confirmar esta compra, você concorda em adquirir as milhas pelo valor especificado. 
                  A transação será processada imediatamente e não poderá ser cancelada.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isProcessing}
              className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isProcessing}
              className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Processando...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Confirmar Compra</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};