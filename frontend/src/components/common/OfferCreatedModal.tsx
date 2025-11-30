interface OfferCreatedModalProps {
  isOpen: boolean;
  onClose: () => void;
  offerTitle?: string;
}

export const OfferCreatedModal = ({ isOpen, onClose, offerTitle }: OfferCreatedModalProps) => {

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
        {/* Ícone de Sucesso */}
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900 rounded-full">
          <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Título */}
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white text-center mb-2">
          Oferta Criada com Sucesso!
        </h3>

        {/* Descrição */}
        <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
          {offerTitle ? (
            <>Sua oferta "<span className="font-medium">{offerTitle}</span>" foi publicada no marketplace e já está disponível para outros usuários.</>
          ) : (
            'Sua oferta foi publicada no marketplace e já está disponível para outros usuários.'
          )}
        </p>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
          O que você gostaria de fazer agora?
        </p>

        {/* Botões */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Fechar
          </button>
          <button
            onClick={() => {
              onClose();
              window.location.href = '/marketplace';
            }}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Ver no Marketplace
          </button>
        </div>
      </div>
    </div>
  );
};