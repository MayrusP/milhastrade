import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Header } from './Header';
import { NotificationToast } from './NotificationToast';
import { useNotifications } from '../../hooks/useNotifications';
import { usePageTitle } from '../../hooks/usePageTitle';

interface LayoutProps {
  children: ReactNode;
  showFooter?: boolean;
}

// Header simplificado para MVP
const SimpleHeader = () => (
  <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">MilhasTrade</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex items-center space-x-8">
          <Link
            to="/marketplace"
            className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
          >
            Marketplace
          </Link>
          <Link
            to="/support"
            className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
          >
            Suporte
          </Link>
          
          {/* Check if user is logged in */}
          {localStorage.getItem('auth_token') ? (
            <>
              <button
                onClick={() => {
                  localStorage.removeItem('auth_token');
                  localStorage.removeItem('user');
                  window.location.href = '/';
                }}
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Entrar
              </Link>
              <Link
                to="/register"
                className="bg-primary-600 text-white hover:bg-primary-700 px-4 py-2 rounded-md text-sm font-medium"
              >
                Cadastrar
              </Link>
            </>
          )}
        </nav>
      </div>
    </div>
  </header>
);

// Footer simplificado para MVP
const SimpleFooter = () => (
  <footer className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center mr-3">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">MilhasTrade</span>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          © {new Date().getFullYear()} MilhasTrade. A plataforma mais segura para negociar milhas aéreas.
        </p>
      </div>
    </div>
  </footer>
);

export const Layout = ({ children, showFooter = true }: LayoutProps) => {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  
  // Atualizar título da aba com contador de notificações
  usePageTitle('MilhasTrade', unreadCount);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Notificações Toast */}
      <NotificationToast notifications={notifications} onMarkAsRead={markAsRead} />
      
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        {children}
      </main>
      {showFooter && <SimpleFooter />}
    </div>
  );
};