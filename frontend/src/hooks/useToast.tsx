import { useState, useCallback } from 'react';
import { ToastType } from '../components/common/Toast';

interface ToastState {
  id: string;
  message: string;
  type: ToastType;
  isVisible: boolean;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastState = {
      id,
      message,
      type,
      isVisible: true
    };

    setToasts(prev => [...prev, newToast]);

    // Auto-remove após 4 segundos
    setTimeout(() => {
      removeToast(id);
    }, 4000);

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showSuccess = useCallback((message: string) => showToast(message, 'success'), [showToast]);
  const showError = useCallback((message: string) => showToast(message, 'error'), [showToast]);
  const showWarning = useCallback((message: string) => showToast(message, 'warning'), [showToast]);
  const showInfo = useCallback((message: string) => showToast(message, 'info'), [showToast]);

  return {
    toasts,
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeToast
  };
};