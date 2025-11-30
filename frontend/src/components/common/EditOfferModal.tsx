import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

interface Airline {
  id: string;
  name: string;
  code: string;
}

interface OfferForEdit {
  id: string;
  title: string;
  description?: string;
  milesAmount: number;
  price: number;
  airline: {
    id: string;
    name: string;
    code?: string;
  };
}

interface EditOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  offer: OfferForEdit | null;
  onOfferUpdated: () => void;
}

export const EditOfferModal: React.FC<EditOfferModalProps> = ({
  isOpen,
  onClose,
  offer,
  onOfferUpdated
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    milesAmount: '',
    price: '',
    airlineId: ''
  });
  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Carregar dados da oferta quando o modal abrir
  useEffect(() => {
    if (isOpen && offer) {
      setFormData({
        title: offer.title,
        description: offer.description || '',
        milesAmount: offer.milesAmount.toString(),
        price: offer.price.toString(),
        airlineId: offer.airline.id
      });
      setErrors({});
    }
  }, [isOpen, offer]);

  // Carregar companhias aéreas
  useEffect(() => {
    if (isOpen) {
      loadAirlines();
    }
  }, [isOpen]);

  const loadAirlines = async () => {
    try {
      const response = await api.get('/airlines');
      if (response.data.success) {
        setAirlines(response.data.data.airlines);
      }
    } catch (error) {
      console.error('Erro ao carregar companhias aéreas:', error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    }

    if (!formData.milesAmount || parseInt(formData.milesAmount) <= 0) {
      newErrors.milesAmount = 'Quantidade de milhas deve ser maior que zero';
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Preço deve ser maior que zero';
    }

    if (!formData.airlineId) {
      newErrors.airlineId = 'Companhia aérea é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !offer) {
      return;
    }

    setLoading(true);
    try {
      const response = await api.put(`/offers/${offer.id}/edit`, {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        milesAmount: parseInt(formData.milesAmount),
        price: parseFloat(formData.price),
        airlineId: formData.airlineId
      });

      if (response.data.success) {
        alert('Oferta atualizada com sucesso!');
        onOfferUpdated();
        onClose();
      }
    } catch (error: any) {
      console.error('Erro ao atualizar oferta:', error);
      
      if (error.response?.data?.message) {
        alert(`Erro: ${error.response.data.message}`);
      } else {
        alert('Erro ao atualizar oferta. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const formatPrice = (value: string) => {
    // Remove tudo que não é número ou vírgula/ponto
    const numbers = value.replace(/[^\d.,]/g, '');
    // Substitui vírgula por ponto para padronizar
    return numbers.replace(',', '.');
  };

  if (!isOpen || !offer) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold">✏️ Editar Oferta</h3>
              <p className="text-blue-100 text-sm mt-1">
                Modifique os dados da sua oferta de milhas
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-blue-100 hover:text-white transition-colors"
              disabled={loading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Título */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Título da Oferta *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ex: Milhas TAM - Promoção"
                disabled={loading}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descrição (Opcional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Descreva detalhes sobre suas milhas..."
                disabled={loading}
              />
            </div>

            {/* Companhia Aérea */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Companhia Aérea *
              </label>
              <select
                value={formData.airlineId}
                onChange={(e) => handleInputChange('airlineId', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.airlineId ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              >
                <option value="">Selecione uma companhia aérea</option>
                {airlines.map((airline) => (
                  <option key={airline.id} value={airline.id}>
                    {airline.name}
                  </option>
                ))}
              </select>
              {errors.airlineId && (
                <p className="text-red-500 text-sm mt-1">{errors.airlineId}</p>
              )}
            </div>

            {/* Quantidade de Milhas e Preço */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quantidade de Milhas *
                </label>
                <input
                  type="number"
                  value={formData.milesAmount}
                  onChange={(e) => handleInputChange('milesAmount', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.milesAmount ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ex: 50000"
                  min="1"
                  disabled={loading}
                />
                {errors.milesAmount && (
                  <p className="text-red-500 text-sm mt-1">{errors.milesAmount}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Preço (R$) *
                </label>
                <input
                  type="text"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', formatPrice(e.target.value))}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.price ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ex: 1500.00"
                  disabled={loading}
                />
                {errors.price && (
                  <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                )}
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};