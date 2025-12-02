import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: string;
  read: boolean;
  createdAt: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    console.log('🔵 fetchNotifications CHAMADO!', new Date().toISOString());
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await api.get('/notifications');
      if (response.data.success) {
        const notifs = response.data.data.notifications;
        setNotifications(notifs);
        setUnreadCount(notifs.filter((n: Notification) => !n.read).length);
      }
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erro ao marcar notificação:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    console.log('🔴 markAllAsRead CHAMADO! FUNÇÃO DESABILITADA');
    // FUNÇÃO COMPLETAMENTE DESABILITADA PARA DEBUG
    // NÃO FAZ NADA - APENAS RETORNA
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  // Polling DESABILITADO temporariamente para debug
  useEffect(() => {
    console.log('🟢 useEffect de notificações EXECUTADO!', new Date().toISOString());
    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.log('⚠️ Sem token, não vai buscar notificações');
      return;
    }

    // Carregar notificações apenas UMA VEZ ao montar
    fetchNotifications();
    
    // POLLING DESABILITADO - Descomentar depois de corrigir o loop
    // const interval = setInterval(fetchNotifications, 60000);
    // return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead
  };
};
