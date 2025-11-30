import React, { useState } from 'react';

interface PassengerData {
  fullName: string;
  cpf: string;
  birthDate: string;
  email: string;
  fareType: string;
}

interface Offer {
  id: string;
  title: string;
  milesAmount: number;
  price: number;
  airline: {
    name: string;
  };
}

interface PassengerDataCollectionModalProps {
  offer: Offer | null;
  isOpen: boolean;
  isProcessing: boolean;
  onConfirm: (passengersData: PassengerData[]) => void;
  onCancel: () => void;
}

export const PassengerDataCollectionModal: React.FC<PassengerDataCollectionModalProps> = ({
  offer,
  isOpen,
  isProcessing,
  onConfirm,
  onCancel
}) => {
  const [passengers, setPassengers] = useState<PassengerData[]>([
    {
      fullName: '',
      cpf: '',
      birthDate: '',
      email: '',
      fareType: 'Econômica'
    }
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const formatMiles = (miles: number) => {
    return new Intl.NumberFormat('pt-BR').format(miles);
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatDate = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3');
  };

  const addPassenger = () => {
    setPassengers([...passengers, {
      fullName: '',
      cpf: '',
      birthDate: '',
      email: '',
      fareType: 'Econômica'
    }]);
  };

  const removePassenger = (index: number) => {
    if (passengers.length > 1) {
      setPassengers(passengers.filter((_, i) => i !== index));
    }
  };

  const updatePassenger = (index: number, field: keyof PassengerData, value: string) => {
    const updated = [...passengers];
    updated[index] = { ...updated[index], [field]: value };
    setPassengers(updated);
    
    // Limpar erro do campo
    const errorKey = `${index}.${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    passengers.forEach((passenger, index) => {
      if (!passenger.fullName.trim()) {
        newErrors[`${index}.fullName`] = 'Nome completo é obrigatório';
      }

      if (!passenger.cpf.trim()) {
        newErrors[`${index}.cpf`] = 'CPF é obrigatório';
      } else if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(passenger.cpf)) {
        newErrors[`${index}.cpf`] = 'CPF deve estar no formato 000.000.000-00';
      }

      if (!passenger.birthDate.trim()) {
        newErrors[`${index}.birthDate`] = 'Data de nascimento é obrigatória';
      } else if (!/^\d{2}\/\d{2}\/\d{4}$/.test(passenger.birthDate)) {
        newErrors[`${index}.birthDate`] = 'Data deve estar no formato DD/MM/AAAA';
      }

      if (!passenger.email.trim()) {
        newErrors[`${index}.email`] = 'E-mail é obrigatório';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(passenger.email)) {
        newErrors[`${index}.email`] = 'E-mail inválido';
      }

      if (!passenger.fareType) {
        newErrors[`${index}.fareType`] = 'Tipo de tarifa é obrigatório';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onConfirm(passengers);
  };

  if (!isOpen || !offer) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold">✈️ Dados dos Passageiros</h3>
              <p className="text-blue-100 text-sm mt-1">
                {offer.title} • {offer.airline?.name || 'Companhia não especificada'}
              </p>
              <p className="text-blue-100 text-sm">
                {formatMiles(offer.milesAmount)} milhas • {formatPrice(offer.price)}
              </p>
            </div>
            <button
              onClick={onCancel}
              className="text-blue-100 hover:text-white transition-colors"
              disabled={isProcessing}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Aviso */}
          <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                  Informações Importantes
                </h4>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                  <li>• Você pode editar estes dados <strong>gratuitamente por 15 minutos</strong> após a compra</li>
                  <li>• Alterações em <strong>CPF e data de nascimento</strong> sempre requerem aprovação do vendedor</li>
                  <li>• Após 15 minutos, todas as edições precisam de aprovação</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Passageiros */}
          <div className="space-y-6">
            {passengers.map((passenger, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    Passageiro {index + 1}
                  </h4>
                  {passengers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePassenger(index)}
                      className="text-red-600 hover:text-red-700 transition-colors"
                      disabled={isProcessing}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      value={passenger.fullName}
                      onChange={(e) => updatePassenger(index, 'fullName', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                        errors[`${index}.fullName`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Nome completo do passageiro"
                      disabled={isProcessing}
                    />
                    {errors[`${index}.fullName`] && (
                      <p className="text-red-500 text-sm mt-1">{errors[`${index}.fullName`]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      CPF *
                    </label>
                    <input
                      type="text"
                      value={passenger.cpf}
                      onChange={(e) => updatePassenger(index, 'cpf', formatCPF(e.target.value))}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                        errors[`${index}.cpf`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="000.000.000-00"
                      maxLength={14}
                      disabled={isProcessing}
                    />
                    {errors[`${index}.cpf`] && (
                      <p className="text-red-500 text-sm mt-1">{errors[`${index}.cpf`]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Data de Nascimento *
                    </label>
                    <input
                      type="text"
                      value={passenger.birthDate}
                      onChange={(e) => updatePassenger(index, 'birthDate', formatDate(e.target.value))}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                        errors[`${index}.birthDate`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="DD/MM/AAAA"
                      maxLength={10}
                      disabled={isProcessing}
                    />
                    {errors[`${index}.birthDate`] && (
                      <p className="text-red-500 text-sm mt-1">{errors[`${index}.birthDate`]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      E-mail *
                    </label>
                    <input
                      type="email"
                      value={passenger.email}
                      onChange={(e) => updatePassenger(index, 'email', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                        errors[`${index}.email`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="email@exemplo.com"
                      disabled={isProcessing}
                    />
                    {errors[`${index}.email`] && (
                      <p className="text-red-500 text-sm mt-1">{errors[`${index}.email`]}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tipo de Tarifa *
                    </label>
                    <select
                      value={passenger.fareType}
                      onChange={(e) => updatePassenger(index, 'fareType', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                        errors[`${index}.fareType`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      disabled={isProcessing}
                    >
                      <option value="">Selecione o tipo de tarifa</option>
                      <option value="Econômica">Econômica</option>
                      <option value="Executiva">Executiva</option>
                      <option value="Primeira Classe">Primeira Classe</option>
                    </select>
                    {errors[`${index}.fareType`] && (
                      <p className="text-red-500 text-sm mt-1">{errors[`${index}.fareType`]}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Botão Adicionar Passageiro */}
          <div className="mt-4">
            <button
              type="button"
              onClick={addPassenger}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              disabled={isProcessing}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Adicionar Passageiro</span>
            </button>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-4 mt-8">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
              disabled={isProcessing}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 flex items-center space-x-2"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Processando Compra...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Finalizar Compra</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};