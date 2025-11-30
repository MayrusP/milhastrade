import { useState } from 'react';

interface AddCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (amount: number) => void;
}

type PaymentMethod = 'pix' | 'credit_card';

export const AddCreditsModal = ({ isOpen, onClose, onSuccess }: AddCreditsModalProps) => {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');



  if (!isOpen) return null;

  const handleAmountChange = (value: string) => {
    // Permitir apenas números e ponto decimal
    const cleanValue = value.replace(/[^0-9.]/g, '');
    setAmount(cleanValue);
    if (error) setError('');
  };

  const formatCurrency = (value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numValue);
  };



  const validateForm = () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Digite um valor válido');
      return false;
    }

    if (parseFloat(amount) < 10) {
      setError('Valor mínimo é R$ 10,00');
      return false;
    }

    if (parseFloat(amount) > 10000) {
      setError('Valor máximo é R$ 10.000,00');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsProcessing(true);
    setError('');

    try {
      // Simular processamento do pagamento
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Por enquanto, simular sucesso
      onSuccess(parseFloat(amount));
      
      // Reset form
      setAmount('');
      onClose();

    } catch (error) {
      setError('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      setAmount('');
      setError('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Adicionar Créditos
            </h2>
            <button
              onClick={handleClose}
              disabled={isProcessing}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Valor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Valor a adicionar
              </label>
              
              {/* Valores Sugeridos */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                {[50, 100, 200, 500].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setAmount(value.toString());
                      if (error) setError('');
                    }}
                    disabled={isProcessing}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 transition-colors"
                  >
                    R$ {value}
                  </button>
                ))}
              </div>

              {/* Campo Customizado */}
              <div className="relative">
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="Ou digite um valor customizado"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  disabled={isProcessing}
                />
                {amount && (
                  <div className="absolute right-3 top-2 text-gray-500 dark:text-gray-400 text-sm">
                    {formatCurrency(amount)}
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Mínimo: R$ 10,00 | Máximo: R$ 10.000,00
              </p>
            </div>

            {/* Método de Pagamento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Método de Pagamento
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('pix')}
                  disabled={isProcessing}
                  className="p-4 border-2 border-primary-500 bg-primary-50 dark:bg-primary-900/30 rounded-lg transition-all"
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">🏦</div>
                    <p className="font-medium text-primary-700 dark:text-primary-300">PIX</p>
                    <p className="text-xs text-primary-600 dark:text-primary-400">Instantâneo</p>
                  </div>
                </button>

                <button
                  type="button"
                  disabled={true}
                  className="p-4 border-2 rounded-lg transition-all border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 cursor-not-allowed opacity-60"
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">💳</div>
                    <p className="font-medium text-gray-900 dark:text-white">Cartão</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Em breve</p>
                  </div>
                </button>
              </div>
            </div>



            {/* Informações do PIX */}
            {paymentMethod === 'pix' && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="text-blue-600 dark:text-blue-400">🏦</div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">Pagamento via PIX</h4>
                </div>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Após confirmar, você receberá um QR Code para pagamento instantâneo.
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md">
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            {/* Resumo */}
            {amount && parseFloat(amount) > 0 && (
              <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-800 dark:text-green-200">Valor a adicionar:</span>
                  <span className="font-semibold text-green-900 dark:text-green-100">
                    {formatCurrency(amount)}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm text-green-800 dark:text-green-200">Método:</span>
                  <span className="font-medium text-green-900 dark:text-green-100">
                    🏦 PIX
                  </span>
                </div>
              </div>
            )}

            {/* Botões */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isProcessing || !amount || parseFloat(amount) <= 0}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processando...</span>
                  </div>
                ) : (
                  `Adicionar ${amount ? formatCurrency(amount) : 'Créditos'}`
                )}
              </button>
            </div>
          </form>

          {/* Informações de Segurança */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Transação segura e criptografada</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};