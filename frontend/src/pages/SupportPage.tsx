import React, { useState, useEffect } from 'react';
import { Layout } from '../components/common/Layout';
import { api } from '../services/api';
import { SupportTicket } from '../types';
import { useAuth } from '../hooks/useAuthSimple';

export const SupportPage: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const response = await api.get('/support/tickets');
      if (response.data.success) {
        setTickets(response.data.tickets);
      }
    } catch (error) {
      console.error('Erro ao carregar tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
      case 'RESOLVED': return 'bg-green-100 text-green-800';
      case 'CLOSED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'OPEN': return 'Aberto';
      case 'IN_PROGRESS': return 'Em Andamento';
      case 'RESOLVED': return 'Resolvido';
      case 'CLOSED': return 'Fechado';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW': return 'bg-gray-100 text-gray-800';
      case 'MEDIUM': return 'bg-blue-100 text-blue-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'URGENT': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'LOW': return 'Baixa';
      case 'MEDIUM': return 'Média';
      case 'HIGH': return 'Alta';
      case 'URGENT': return 'Urgente';
      default: return priority;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Suporte</h1>
            <p className="text-gray-600 mt-2">Gerencie seus tickets de suporte</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Novo Ticket
          </button>
        </div>

        {tickets.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🎫</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Nenhum ticket encontrado</h3>
            <p className="text-gray-600 mb-6">Você ainda não criou nenhum ticket de suporte.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Criar Primeiro Ticket
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedTicket(ticket)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{ticket.subject}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(ticket.status)}`}>
                        {getStatusText(ticket.status)}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(ticket.priority)}`}>
                        {getPriorityText(ticket.priority)}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3 line-clamp-2">{ticket.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Categoria: {ticket.category}</span>
                      <span>•</span>
                      <span>Criado em: {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}</span>
                      {ticket.responses.length > 0 && (
                        <>
                          <span>•</span>
                          <span>{ticket.responses.length} resposta(s)</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">
                      {ticket.assignedTo ? (
                        <span>Atribuído a: {ticket.assignedTo.name}</span>
                      ) : (
                        <span>Não atribuído</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de Criar Ticket */}
        {showCreateModal && (
          <CreateTicketModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false);
              loadTickets();
            }}
          />
        )}

        {/* Modal de Visualizar Ticket */}
        {selectedTicket && (
          <TicketDetailModal
            ticket={selectedTicket}
            onClose={() => setSelectedTicket(null)}
            onUpdate={loadTickets}
          />
        )}
      </div>
    </Layout>
  );
};

// Modal para criar novo ticket
const CreateTicketModal: React.FC<{
  onClose: () => void;
  onSuccess: () => void;
}> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    category: 'TECHNICAL',
    priority: 'MEDIUM'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/support/tickets', formData);
      if (response.data.success) {
        onSuccess();
      }
    } catch (error) {
      console.error('Erro ao criar ticket:', error);
      alert('Erro ao criar ticket. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Novo Ticket de Suporte</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assunto
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoria
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="TECHNICAL">Técnico</option>
              <option value="BILLING">Cobrança</option>
              <option value="ACCOUNT">Conta</option>
              <option value="TRANSACTION">Transação</option>
              <option value="OTHER">Outro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prioridade
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="LOW">Baixa</option>
              <option value="MEDIUM">Média</option>
              <option value="HIGH">Alta</option>
              <option value="URGENT">Urgente</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 h-32"
              required
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Criando...' : 'Criar Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal para visualizar detalhes do ticket
const TicketDetailModal: React.FC<{
  ticket: SupportTicket;
  onClose: () => void;
  onUpdate: () => void;
}> = ({ ticket, onClose, onUpdate }) => {
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      const response = await api.post(`/support/tickets/${ticket.id}/responses`, {
        message: newMessage
      });
      if (response.data.success) {
        setNewMessage('');
        onUpdate();
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      alert('Erro ao enviar mensagem. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold">{ticket.subject}</h2>
            <div className="flex items-center space-x-2 mt-2">
              <span className={`px-2 py-1 text-xs rounded-full ${ticket.status === 'OPEN' ? 'bg-blue-100 text-blue-800' : ticket.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' : ticket.status === 'RESOLVED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {ticket.status === 'OPEN' ? 'Aberto' : ticket.status === 'IN_PROGRESS' ? 'Em Andamento' : ticket.status === 'RESOLVED' ? 'Resolvido' : 'Fechado'}
              </span>
              <span className="text-sm text-gray-500">
                Criado em: {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-700">{ticket.description}</p>
        </div>

        {/* Conversação */}
        <div className="space-y-4 mb-6">
          {ticket.responses.map((response) => (
            <div
              key={response.id}
              className={`p-4 rounded-lg ${
                response.isFromAdmin
                  ? 'bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-500'
                  : 'bg-gray-50 dark:bg-gray-700 border-l-4 border-gray-300 dark:border-gray-500'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium text-sm text-gray-900 dark:text-white">
                  {response.user.name} {response.isFromAdmin && '(Suporte)'}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(response.createdAt).toLocaleString('pt-BR')}
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-200">{response.message}</p>
            </div>
          ))}
        </div>

        {/* Formulário de resposta */}
        {ticket.status !== 'CLOSED' && ticket.status !== 'RESOLVED' ? (
          <form onSubmit={handleSendMessage} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sua resposta
              </label>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 h-24"
                placeholder="Digite sua mensagem..."
                required
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Fechar
              </button>
              <button
                type="submit"
                disabled={loading || !newMessage.trim()}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Enviando...' : 'Enviar Resposta'}
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 text-center">
            <p className="text-gray-700 dark:text-gray-300">
              {ticket.status === 'RESOLVED' ? (
                <>
                  ✅ Este ticket foi marcado como <strong>Resolvido</strong>.
                  <br />
                  Não é possível adicionar mais respostas.
                </>
              ) : (
                <>
                  🔒 Este ticket está <strong>Fechado</strong>.
                  <br />
                  Não é possível adicionar mais respostas.
                </>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};