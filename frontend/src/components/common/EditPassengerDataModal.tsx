import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

interface PassengerData {
  id: string;
  fullName: string;
  cpf: string;
  birthDate: string;
  email: string;
  fareType: string;
  canEdit: boolean;
  editTimeRemaining: number | null;
}

interface Transaction {
  id: string;
  transactionHash: string;
  createdAt: string;
  offer: {
    title: string;
    airline: {
      name: string;
    };
  };
}

interface EditPassengerDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onDataUpdated: () => void;
}

export const EditPassengerDataModal: React.FC<EditPassengerDataModalProps> = ({
  isOpen,
  onClose,
  transaction,
  onDataUpdated
}) => {
  const [passengers, setPassengers] = useState<PassengerData[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingPassenger, setEditingPassenger] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    cpf: '',
    birthDate: '',
    email: '',
    fareType: '',
    reason: ''
  });
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Estados para adicionar novos passageiros
  const [newPassengers, setNewPassengers] = useState<Omit<PassengerData, 'id' | 'canEdit' | 'editTimeRemaining'>[]>([]);
  const [isAddingMode, setIsAddingMode] = useState(false);

  // Carregar dados dos passageiros
  useEffect(() => {
    if (isOpen && transaction) {
      // Reset timer quando uma nova transação é selecionada
      setTimeRemaining(0);
      loadPassengerData();
    } else if (!isOpen) {
      // Reset timer quando modal é fechado
      setTimeRemaining(0);
    }
  }, [isOpen, transaction]);

  // Timer para atualizar tempo restante
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeRemaining]);



  const loadPassengerData = async () => {
    if (!transaction) return;
    
    setLoading(true);
    try {
      // Usar apenas o endpoint principal
      const response = await api.get(`/transactions/${transaction.id}/passengers`);
      
      if (response.data.success) {
        setPassengers(response.data.data.passengers);
        
        // Definir tempo restante baseado no primeiro passageiro
        if (response.data.data.passengers[0]?.editTimeRemaining) {
          const newTimeRemaining = response.data.data.passengers[0].editTimeRemaining;
          console.log(`⏱️ Timer carregado para transação ${transaction.id}:`, {
            editTimeRemaining: newTimeRemaining,
            transactionId: transaction.id,
            createdAt: transaction.createdAt
          });
          setTimeRemaining(newTimeRemaining);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados dos passageiros:', error);
      // Mostrar erro em vez de usar dados de teste
      setPassengers([]);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (passenger: PassengerData) => {
    setEditingPassenger(passenger.id);
    setFormData({
      fullName: passenger.fullName,
      cpf: passenger.cpf,
      birthDate: passenger.birthDate,
      email: passenger.email,
      fareType: passenger.fareType,
      reason: ''
    });
    setErrors({});
  };

  const cancelEditing = () => {
    setEditingPassenger(null);
    setFormData({
      fullName: '',
      cpf: '',
      birthDate: '',
      email: '',
      fareType: '',
      reason: ''
    });
    setErrors({});
    setIsAddingMode(false);
    setNewPassengers([]);
  };

  const startAddingPassengers = () => {
    setIsAddingMode(true);
    setEditingPassenger('new');
    setNewPassengers([{
      fullName: '',
      cpf: '',
      birthDate: '',
      email: '',
      fareType: 'Econômica'
    }]);
    setErrors({});
  };

  const addNewPassenger = () => {
    setNewPassengers([...newPassengers, {
      fullName: '',
      cpf: '',
      birthDate: '',
      email: '',
      fareType: 'Econômica'
    }]);
  };

  const removeNewPassenger = (index: number) => {
    if (newPassengers.length > 1) {
      setNewPassengers(newPassengers.filter((_, i) => i !== index));
    }
  };

  const updateNewPassenger = (index: number, field: string, value: string) => {
    const updated = [...newPassengers];
    updated[index] = { ...updated[index], [field]: value };
    setNewPassengers(updated);
    
    // Limpar erro do campo
    const errorKey = `${index}.${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (isAddingMode) {
      // Validação para novos passageiros
      newPassengers.forEach((passenger, index) => {
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
    } else {
      // Validação para edição de passageiro existente
      if (!formData.fullName.trim()) {
        newErrors.fullName = 'Nome completo é obrigatório';
      }

      if (!formData.cpf.trim()) {
        newErrors.cpf = 'CPF é obrigatório';
      } else if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(formData.cpf)) {
        newErrors.cpf = 'CPF deve estar no formato 000.000.000-00';
      }

      if (!formData.birthDate.trim()) {
        newErrors.birthDate = 'Data de nascimento é obrigatória';
      } else if (!/^\d{2}\/\d{2}\/\d{4}$/.test(formData.birthDate)) {
        newErrors.birthDate = 'Data deve estar no formato DD/MM/AAAA';
      }

      if (!formData.email.trim()) {
        newErrors.email = 'E-mail é obrigatório';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'E-mail inválido';
      }

      if (!formData.fareType) {
        newErrors.fareType = 'Tipo de tarifa é obrigatório';
      }

      // Se não está no período de edição livre, motivo é obrigatório
      if (timeRemaining <= 0 && !formData.reason.trim()) {
        newErrors.reason = 'Motivo da alteração é obrigatório após o período de edição livre';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !transaction) {
      return;
    }

    setLoading(true);
    try {
      if (isAddingMode) {
        // Adicionar novos passageiros
        const response = await api.post(`/transactions/${transaction.id}/passengers`, {
          passengers: newPassengers
        });

        if (response.data.success) {
          const { applied, requiresApproval } = response.data.data;
          
          if (applied) {
            alert(`${newPassengers.length} passageiro(s) adicionado(s) com sucesso!`);
          } else {
            alert(`${newPassengers.length} passageiro(s) enviado(s) para aprovação do vendedor.\nMotivo: ${requiresApproval}`);
          }
          
          onDataUpdated();
          cancelEditing();
          loadPassengerData();
        }
      } else {
        // Editar passageiro existente
        const response = await api.put(`/transactions/${transaction.id}/passengers/${editingPassenger}`, formData);

        if (response.data.success) {
          const { applied, requiresApproval } = response.data.data;
          
          if (applied) {
            alert('Dados atualizados com sucesso!');
          } else {
            alert(`Alterações enviadas para aprovação do vendedor.\nMotivo: ${requiresApproval}`);
          }
          
          onDataUpdated();
          cancelEditing();
          loadPassengerData();
        }
      }
    } catch (error: any) {
      console.error('Erro ao processar dados:', error);
      
      if (error.response?.data?.message) {
        alert(`Erro: ${error.response.data.message}`);
      } else {
        alert('Erro ao atualizar dados. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatDate = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3');
  };

  if (!isOpen || !transaction) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold">✈️ Editar Dados dos Passageiros</h3>
              <p className="text-green-100 text-sm mt-1">
                {transaction.offer.title} • {transaction.offer.airline?.name || 'Companhia não especificada'}
              </p>
              {timeRemaining > 0 && (
                <div className="mt-2 bg-green-500 bg-opacity-30 rounded-lg px-3 py-1 inline-block">
                  <span className="text-sm font-medium">
                    ⏱️ Edição livre: {formatTime(timeRemaining)}
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-green-100 hover:text-white transition-colors"
              disabled={loading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Aviso sobre edição */}
          <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
              📋 Regras de Edição
            </h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• <strong>Primeiros 15 minutos:</strong> Edição livre de dados básicos (nome, email)</li>
              <li>• <strong>Dados críticos:</strong> CPF e data de nascimento sempre requerem aprovação</li>
              <li>• <strong>Após 15 minutos:</strong> Todas as edições requerem aprovação do vendedor</li>
            </ul>
          </div>

          {loading && !editingPassenger ? (
            <div className="text-center py-8">
              <div className="text-lg">Carregando dados dos passageiros...</div>
            </div>
          ) : passengers.length === 0 ? (
            <div className="text-center py-8">
              <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6">
                <div className="text-yellow-800 dark:text-yellow-200 mb-4">
                  <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <h3 className="text-lg font-semibold mb-2">Nenhum passageiro cadastrado</h3>
                  <p className="text-sm mb-4">
                    Esta compra foi realizada sem adicionar dados de passageiros. 
                    Você pode adicionar os dados agora para facilitar a emissão das passagens.
                  </p>
                  <button
                    onClick={startAddingPassengers}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  >
                    ✈️ Adicionar Dados dos Passageiros
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {passengers.map((passenger, index) => (
                <div key={passenger.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      Passageiro {index + 1}
                    </h4>
                    {passenger.canEdit && editingPassenger !== passenger.id && (
                      <button
                        onClick={() => startEditing(passenger)}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Editar
                      </button>
                    )}
                  </div>

                  {editingPassenger === passenger.id ? (
                    // Formulário de edição
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Nome Completo *
                          </label>
                          <input
                            type="text"
                            value={formData.fullName}
                            onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                              errors.fullName ? 'border-red-500' : 'border-gray-300'
                            }`}
                            disabled={loading}
                          />
                          {errors.fullName && (
                            <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            CPF * <span className="text-red-500 text-xs">(Requer aprovação)</span>
                          </label>
                          <input
                            type="text"
                            value={formData.cpf}
                            onChange={(e) => setFormData(prev => ({ ...prev, cpf: formatCPF(e.target.value) }))}
                            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                              errors.cpf ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="000.000.000-00"
                            maxLength={14}
                            disabled={loading}
                          />
                          {errors.cpf && (
                            <p className="text-red-500 text-sm mt-1">{errors.cpf}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Data de Nascimento * <span className="text-red-500 text-xs">(Requer aprovação)</span>
                          </label>
                          <input
                            type="text"
                            value={formData.birthDate}
                            onChange={(e) => setFormData(prev => ({ ...prev, birthDate: formatDate(e.target.value) }))}
                            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                              errors.birthDate ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="DD/MM/AAAA"
                            maxLength={10}
                            disabled={loading}
                          />
                          {errors.birthDate && (
                            <p className="text-red-500 text-sm mt-1">{errors.birthDate}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            E-mail *
                          </label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                              errors.email ? 'border-red-500' : 'border-gray-300'
                            }`}
                            disabled={loading}
                          />
                          {errors.email && (
                            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                          )}
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Tipo de Tarifa *
                          </label>
                          <select
                            value={formData.fareType}
                            onChange={(e) => setFormData(prev => ({ ...prev, fareType: e.target.value }))}
                            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                              errors.fareType ? 'border-red-500' : 'border-gray-300'
                            }`}
                            disabled={loading}
                          >
                            <option value="">Selecione o tipo de tarifa</option>
                            <option value="Econômica">Econômica</option>
                            <option value="Executiva">Executiva</option>
                            <option value="Primeira Classe">Primeira Classe</option>
                          </select>
                          {errors.fareType && (
                            <p className="text-red-500 text-sm mt-1">{errors.fareType}</p>
                          )}
                        </div>

                        {timeRemaining <= 0 && (
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Motivo da Alteração *
                            </label>
                            <textarea
                              value={formData.reason}
                              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                              rows={3}
                              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                                errors.reason ? 'border-red-500' : 'border-gray-300'
                              }`}
                              placeholder="Explique o motivo da alteração..."
                              disabled={loading}
                            />
                            {errors.reason && (
                              <p className="text-red-500 text-sm mt-1">{errors.reason}</p>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end space-x-3 pt-4">
                        <button
                          type="button"
                          onClick={cancelEditing}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                          disabled={loading}
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                          disabled={loading}
                        >
                          {loading ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    // Visualização dos dados
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400 font-medium">Nome:</span>
                        <p className="text-gray-900 dark:text-white">{passenger.fullName}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400 font-medium">CPF:</span>
                        <p className="text-gray-900 dark:text-white">{passenger.cpf}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400 font-medium">Data de Nascimento:</span>
                        <p className="text-gray-900 dark:text-white">{passenger.birthDate}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400 font-medium">E-mail:</span>
                        <p className="text-gray-900 dark:text-white">{passenger.email}</p>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-gray-600 dark:text-gray-400 font-medium">Tipo de Tarifa:</span>
                        <p className="text-gray-900 dark:text-white">{passenger.fareType}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Botão para adicionar mais passageiros */}
              {!isAddingMode && !editingPassenger && (
                <div className="border-2 border-dashed border-green-300 dark:border-green-600 rounded-lg p-4 bg-green-50 dark:bg-green-900 text-center">
                  <div className="text-green-800 dark:text-green-200">
                    <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <h4 className="font-semibold mb-2">Adicionar Mais Passageiros</h4>
                    <p className="text-sm mb-3">
                      {timeRemaining > 0 
                        ? `Você ainda tem ${formatTime(timeRemaining)} para adicionar passageiros gratuitamente.`
                        : 'Adicionar mais passageiros requer aprovação do vendedor.'
                      }
                    </p>
                    <button
                      onClick={startAddingPassengers}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                    >
                      + Adicionar Passageiros
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Formulário para adicionar novos passageiros - MOVIDO PARA FORA */}
          {isAddingMode && (
            <div className="border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-lg p-6 bg-blue-50 dark:bg-blue-900 mt-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200">
                  ✈️ Adicionar Novos Passageiros
                  {passengers.length > 0 && (
                    <span className="text-sm font-normal ml-2">
                      (Já cadastrados: {passengers.length})
                    </span>
                  )}
                </h4>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={addNewPassenger}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                    disabled={loading || (passengers.length + newPassengers.length) >= 6}
                    title={
                      (passengers.length + newPassengers.length) >= 6 
                        ? 'Máximo de 6 passageiros por compra' 
                        : 'Adicionar mais um passageiro'
                    }
                  >
                    + Adicionar Passageiro
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="px-3 py-1 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                </div>
                
                {(passengers.length + newPassengers.length) >= 6 && (
                  <div className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                    ⚠️ Limite máximo de 6 passageiros por compra atingido
                  </div>
                )}
              </div>

              {passengers.length > 0 && (
                <div className="bg-blue-100 dark:bg-blue-800 border border-blue-200 dark:border-blue-700 rounded-lg p-3 mb-4">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>ℹ️ Informação:</strong> Você já tem {passengers.length} passageiro(s) cadastrado(s). 
                    Os novos passageiros serão adicionados à mesma compra.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {newPassengers.map((passenger, index) => (
                  <div key={index} className="border border-blue-200 dark:border-blue-700 rounded-lg p-4 bg-white dark:bg-gray-800">
                    <div className="flex justify-between items-center mb-4">
                      <h5 className="font-medium text-gray-900 dark:text-white">
                        Passageiro {passengers.length + index + 1}
                      </h5>
                      {newPassengers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeNewPassenger(index)}
                          className="text-red-600 hover:text-red-700 text-sm"
                          disabled={loading}
                        >
                          Remover
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
                          onChange={(e) => updateNewPassenger(index, 'fullName', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                            errors[`${index}.fullName`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          disabled={loading}
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
                          onChange={(e) => updateNewPassenger(index, 'cpf', formatCPF(e.target.value))}
                          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                            errors[`${index}.cpf`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="000.000.000-00"
                          maxLength={14}
                          disabled={loading}
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
                          onChange={(e) => updateNewPassenger(index, 'birthDate', formatDate(e.target.value))}
                          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                            errors[`${index}.birthDate`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="DD/MM/AAAA"
                          maxLength={10}
                          disabled={loading}
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
                          onChange={(e) => updateNewPassenger(index, 'email', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                            errors[`${index}.email`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          disabled={loading}
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
                          onChange={(e) => updateNewPassenger(index, 'fareType', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                            errors[`${index}.fareType`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          disabled={loading}
                        >
                          <option value="Econômica">Econômica</option>
                          <option value="Premium Economy">Premium Economy</option>
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

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading ? 'Salvando...' : `Salvar ${newPassengers.length} Novo(s) Passageiro(s)`}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Botão Fechar */}
          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              disabled={loading}
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};