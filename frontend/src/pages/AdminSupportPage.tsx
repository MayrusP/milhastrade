import React, { useState, useEffect } from 'react';
import { Layout } from '../components/common/Layout';
import { api } from '../services/api';
import { SupportTicket, User } from '../types';
import { useAuth } from '../hooks/useAuthSimple';

export const AdminSupportPage: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    assignedTo: ''
  });
  const [admins, setAdmins] = useState<User[]>([]);

  useEffect(() => {
    loadTickets();
    loadAdmins();
  }, [filters]);

  const loadTickets = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.assignedTo) params.append('assignedTo', filters.assignedTo);

      const response = await api.get(`/admin/support/tickets?${params}`);
      if (response.data.success) {
        setTickets(response.data.tickets);
      }
    } catch (error) {
      console.error('Erro ao carregar tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAdmins = async () => {
    try {
      const response = await api.get('/admin/users');
      if (response.data.success) {
        const adminUsers = response.data.users.filter((u: User) => 
          ['ADMIN', 'MODERATOR'].includes(u.role)
        );
        setAdmins(adminUsers);
      }
    } catch (error) {
      console.error('Erro ao carregar admins:', error);
    }
  };

  const assignTicket = async (ticketId: string, assignedToId: string | null) => {
    try {
      const response = await api.put(`/support/tickets/${ticketId}/status`, {
        assignedToId
      });
      if (response.data.success) {
        loadTickets();
      }
    } catch (error) {
      console.error('Erro ao atribuir ticket:', error);
    }
  };

  const updateStatus = async (ticketId: string, status: string) => {
    try {
      const response = await api.put(`/support/tickets/${ticketId}/status`, {
        status
      });
      if (response.data.success) {
        loadTickets();
        if (selectedTicket?.id === ticketId) {
          setSelectedTicket({ ...selectedTicket, status: status as any });
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Administração de Suporte</h1>
          <p className="text-gray-600 mt-2">Gerencie todos os tickets de suporte</p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">Todos</option>
                <option value="OPEN">Aberto</option>
                <option value="IN_PROGRESS">Em Andamento</option>
                <option value="RESOLVED">Resolvido</option>
                <option value="CLOSED">Fechado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prioridade
              </label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">Todas</option>
                <option value="LOW">Baixa</option>
                <option value="MEDIUM">Média</option>
                <option value="HIGH">Alta</option>
                <option value="URGENT">Urgente</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Atribuído a
              </label>
              <select
                value={filters.assignedTo}
                onChange={(e) => setFilters({ ...filters, assignedTo: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">Todos</option>
                <option value="unassigned">Não atribuído</option>
                {admins.map((admin) => (
                  <option key={admin.id} value={admin.id}>
                    {admin.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-blue-600">
              {tickets.filter(t => t.status === 'OPEN').length}
            </div>
            <div className="text-sm text-gray-600">Abertos</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {tickets.filter(t => t.status === 'IN_PROGRESS').length}
            </div>
            <div className="text-sm text-gray-600">Em Andamento</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-green-600">
              {tickets.filter(t => t.status === 'RESOLVED').length}
            </div>
            <div className="text-sm text-gray-600">Resolvidos</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-red-600">
              {tickets.filter(t => t.priority === 'URGENT').length}
            </div>
            <div className="text-sm text-gray-600">Urgentes</div>
          </div>
        </div>

        {/* Lista de Tickets */}
        {tickets.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🎫</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Nenhum ticket encontrado</h3>
            <p className="text-gray-600">Não há tickets que correspondam aos filtros selecionados.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ticket
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuário
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prioridade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Atribuído a
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Criado em
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {ticket.subject}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {ticket.description}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{ticket.user.name}</div>
                        <div className="text-sm text-gray-500">{ticket.user.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(ticket.status)}`}>
                          {getStatusText(ticket.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(ticket.priority)}`}>
                          {getPriorityText(ticket.priority)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={ticket.assignedTo?.id || ''}
                          onChange={(e) => assignTicket(ticket.id, e.target.value || null)}
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="">Não atribuído</option>
                          {admins.map((admin) => (
                            <option key={admin.id} value={admin.id}>
                              {admin.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedTicket(ticket)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Ver
                          </button>
                          <select
                            value={ticket.status}
                            onChange={(e) => updateStatus(ticket.id, e.target.value)}
                            className="text-xs border border-gray-300 rounded px-1 py-1"
                          >
                            <option value="OPEN">Aberto</option>
                            <option value="IN_PROGRESS">Em Andamento</option>
                            <option value="RESOLVED">Resolvido</option>
                            <option value="CLOSED">Fechado</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal de Detalhes do Ticket */}
        {selectedTicket && (
          <AdminTicketDetailModal
            ticket={selectedTicket}
            onClose={() => setSelectedTicket(null)}
            onUpdate={loadTickets}
          />
        )}
      </div>
    </Layout>
  );
};

// Modal para visualizar e responder ticket (Admin)
const AdminTicketDetailModal: React.FC<{
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
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold">{ticket.subject}</h2>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
              <span>Usuário: {ticket.user.name} ({ticket.user.email})</span>
              <span>•</span>
              <span>Categoria: {ticket.category}</span>
              <span>•</span>
              <span>Criado em: {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}</span>
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
          <h3 className="font-medium mb-2">Descrição:</h3>
          <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{ticket.description}</p>
        </div>

        {/* Conversação */}
        <div className="space-y-4 mb-6">
          <h3 className="font-medium">Conversação:</h3>
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
                Resposta do Suporte
              </label>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 h-24"
                placeholder="Digite sua resposta..."
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
                  Para reabrir, altere o status acima.
                </>
              ) : (
                <>
                  🔒 Este ticket está <strong>Fechado</strong>.
                  <br />
                  Para reabrir, altere o status acima.
                </>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};