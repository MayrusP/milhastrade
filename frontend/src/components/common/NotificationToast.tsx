import React, { useEffect, useState } from 'react';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface NotificationToastProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notifications,
  onMarkAsRead
}) => {
  const [visibleNotifications, setVisibleNotifications] = useState<string[]>([]);
  const [shownNotifications, setShownNotifications] = useState<Set<string>>(() => {
    // Carregar notificações já mostradas do localStorage
    const stored = localStorage.getItem('shownNotifications');
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });

  useEffect(() => {
    // Detectar novas notificações não lidas que ainda não foram mostradas
    const newNotifications = notifications.filter(
      n => !n.read && !shownNotifications.has(n.id)
    );

    if (newNotifications.length > 0) {
      newNotifications.forEach(notif => {
        setVisibleNotifications(prev => [...prev, notif.id]);
        
        // Marcar como mostrada
        setShownNotifications(prev => {
          const updated = new Set(prev);
          updated.add(notif.id);
          localStorage.setItem('shownNotifications', JSON.stringify([...updated]));
          return updated;
        });
        
        // Auto-hide após 5 segundos
        setTimeout(() => {
          setVisibleNotifications(prev => prev.filter(id => id !== notif.id));
        }, 5000);
      });
    }
  }, [notifications, shownNotifications]);

  const handleClose = (id: string) => {
    setVisibleNotifications(prev => prev.filter(nId => nId !== id));
    onMarkAsRead(id);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'SALE':
        return '🎉';
      case 'PURCHASE':
        return '✅';
      case 'PASSENGER_DATA_EDIT':
        return '✏️';
      case 'APPROVAL_REQUEST':
        return '⏳';
      default:
        return '🔔';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications
        .filter(n => visibleNotifications.includes(n.id))
        .map(notification => (
          <div
            key={notification.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-sm animate-slide-in-right border-l-4 border-primary-500"
          >
            <div className="flex items-start">
              <span className="text-2xl mr-3">{getIcon(notification.type)}</span>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {notification.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {notification.message}
                </p>
              </div>
              <button
                onClick={() => handleClose(notification.id)}
                className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ))}
    </div>
  );
};
