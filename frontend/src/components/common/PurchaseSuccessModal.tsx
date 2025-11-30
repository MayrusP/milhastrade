import React from 'react';

interface PurchaseSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPassengerData?: () => void; // Nova função para abrir modal externo
  passengersDataSent?: boolean; // Nova prop para controlar se dados foram enviados
  transactionData: {
    transactionHash: string;
    milesAmount: number;
    airlineName: string;
    price: number;
  } | null;
}

export const PurchaseSuccessModal: React.FC<PurchaseSuccessModalProps> = ({
  isOpen,
  onClose,
  onAddPassengerData,
  passengersDataSent = false,
  transactionData
}) => {

  if (!isOpen || !transactionData) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const formatMiles = (miles: number) => {
    return new Intl.NumberFormat('pt-BR').format(miles);
  };

  const copyTransactionId = () => {
    navigator.clipboard.writeText(transactionData.transactionHash);
    // Você pode adicionar um toast aqui se quiser
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header com animação de sucesso */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center animate-pulse">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">🎉 Compra Realizada!</h2>
            <p className="text-green-100">Sua transação foi processada com sucesso</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Resumo da Compra */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-center">
              Resumo da Compra
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Milhas adquiridas:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatMiles(transactionData.milesAmount)} milhas
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Companhia aérea:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {transactionData.airlineName}
                </span>
              </div>

              <div className="flex justify-between items-center border-t border-gray-200 dark:border-gray-600 pt-3">
                <span className="text-gray-600 dark:text-gray-300">Valor pago:</span>
                <span className="font-bold text-green-600 dark:text-green-400 text-lg">
                  {formatPrice(transactionData.price)}
                </span>
              </div>
            </div>
          </div>

          {/* ID da Transação */}
          <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                  ID da Transação:
                </p>
                <p className="text-blue-800 dark:text-blue-200 font-mono text-lg font-bold">
                  {transactionData.transactionHash}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  Guarde este código para consultas futuras
                </p>
              </div>
              <button
                onClick={copyTransactionId}
                className="ml-3 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                title="Copiar ID"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Próximos Passos */}
          <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                  Próximos Passos
                </h4>
                <ul className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
                  <li>• As milhas foram creditadas em sua conta</li>
                  <li>• Você pode visualizar a transação no seu dashboard</li>
                  <li>• Avalie o vendedor para ajudar outros usuários</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Seção de Dados dos Passageiros */}
          {!passengersDataSent ? (
            <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-3 mb-3">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h4 className="font-medium text-blue-800 dark:text-blue-200">
                  Dados dos Passageiros
                </h4>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                Para finalizar o processo, adicione os dados dos passageiros que utilizarão as milhas.
                Essas informações serão enviadas ao vendedor.
              </p>
              <button
                onClick={onAddPassengerData}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center justify-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Adicionar Dados dos Passageiros</span>
              </button>
            </div>
          ) : (
            <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-3 mb-3">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h4 className="font-medium text-green-800 dark:text-green-200">
                  Informações Enviadas
                </h4>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300 mb-2">
                Os dados dos passageiros foram enviados com sucesso ao vendedor.
              </p>
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                ✅ Aguarde o vendedor entrar em contato
              </p>
              <div className="mt-3 text-xs text-green-600 dark:text-green-400">
                📧 Você receberá as instruções por e-mail em breve
              </div>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
            >
              Fechar
            </button>
            <button
              onClick={() => {
                onClose();
                window.location.href = '/dashboard';
              }}
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors flex items-center justify-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Ver Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};