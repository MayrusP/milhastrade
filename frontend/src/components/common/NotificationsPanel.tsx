import React, { useState } from 'react';
import { useNotifications } from '../../hooks/useNotifications';

export const NotificationsPanel: React.FC = () => {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const [expandedNotifications, setExpandedNotifications] = useState<Set<string>>(new Set());

  const toggleExpanded = (notificationId: string) => {
    setExpandedNotifications(prev => {
      const newSet = new Set(prev);
      if (newSet.has(notificationId)) {
        newSet.delete(notificationId);
      } else {
        newSet.add(notificationId);
      }
      return newSet;
    });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'SALE':
        return '🎉';
      case 'PURCHASE':
        return '✅';
      case 'APPROVAL_PENDING':
        return '⏳';
      case 'PASSENGER_DATA_EDIT':
        return '✏️';
      default:
        return '🔔';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins}min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  if (notifications.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Notificações
        </h2>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400">Nenhuma notificação</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Notificações
        </h2>
        {notifications.some(n => !n.read) && (
          <button
            onClick={markAllAsRead}
            className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
          >
            Marcar todas como lidas
          </button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.map(notification => {
          const isExpanded = expandedNotifications.has(notification.id);
          const isApprovalNotification = notification.type === 'APPROVAL_PENDING' || notification.type === 'PASSENGER_DATA_EDIT';
          
          // Tentar parsear os dados da notificação
          let notificationData = null;
          try {
            if (notification.data) {
              notificationData = JSON.parse(notification.data);
            }
          } catch (e) {
            // Ignorar erro de parse
          }

          return (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border transition-colors ${
                notification.read
                  ? 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                  : 'bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700'
              }`}
            >
              <div className="flex items-start">
                <span className="text-2xl mr-3">{getIcon(notification.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {notification.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {notification.message}
                      </p>
                      
                      {/* Botão para expandir detalhes se for notificação de aprovação */}
                      {isApprovalNotification && notificationData && (
                        <button
                          onClick={() => toggleExpanded(notification.id)}
                          className="mt-2 text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 flex items-center space-x-1"
                        >
                          <span>{isExpanded ? 'Ocultar detalhes' : 'Ver detalhes'}</span>
                          <svg 
                            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      )}

                      {/* Detalhes expandidos */}
                      {isExpanded && notificationData && (
                        <div className="mt-3 p-3 bg-white dark:bg-gray-600 rounded-md border border-gray-200 dark:border-gray-500">
                          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            📋 Informações da Solicitação:
                          </p>
                          <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                            {notificationData.transactionId && (
                              <p>
                                <span className="font-medium">ID da Transação:</span> {notificationData.transactionId}
                              </p>
                            )}
                            {notificationData.passengerId && (
                              <p>
                                <span className="font-medium">ID do Passageiro:</span> {notificationData.passengerId}
                              </p>
                            )}
                            {notificationData.changesCount && (
                              <p>
                                <span className="font-medium">Alterações:</span> {notificationData.changesCount} campo(s)
                              </p>
                            )}
                            {notificationData.passengersCount && (
                              <p>
                                <span className="font-medium">Passageiros:</span> {notificationData.passengersCount} novo(s)
                              </p>
                            )}
                          </div>
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-500">
                            <a
                              href="/dashboard"
                              className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                            >
                              → Ir para Aprovações Pendentes
                            </a>
                          </div>
                        </div>
                      )}

                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="ml-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm whitespace-nowrap"
                      >
                        Marcar como lida
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
