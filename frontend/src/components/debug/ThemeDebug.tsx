import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export const ThemeDebug: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [, forceUpdate] = React.useReducer(x => x + 1, 0);
  
  // Forçar atualização a cada 100ms para mostrar mudanças em tempo real
  React.useEffect(() => {
    const interval = setInterval(forceUpdate, 100);
    return () => clearInterval(interval);
  }, []);
  
  const htmlClass = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  const storage = localStorage.getItem('theme') || 'null';
  const isConsistent = theme === htmlClass && theme === storage;

  return (
    <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg z-50 text-white ${isConsistent ? 'bg-green-500' : 'bg-red-500'}`}>
      <div className="text-sm">
        <p><strong>Status:</strong> {isConsistent ? '✅ Consistente' : '❌ Inconsistente'}</p>
        <p><strong>React State:</strong> {theme}</p>
        <p><strong>HTML Class:</strong> {htmlClass}</p>
        <p><strong>localStorage:</strong> {storage}</p>
        <p><strong>Ícone esperado:</strong> {theme === 'light' ? '🌙 lua' : '☀️ sol'}</p>
        
        {/* Teste visual das classes dark */}
        <div className="mt-2 p-2 bg-white dark:bg-gray-800 text-black dark:text-white rounded">
          <p className="text-xs">Teste: {theme === 'dark' ? 'Modo Escuro Ativo' : 'Modo Claro Ativo'}</p>
        </div>
        
        <button 
          onClick={toggleTheme}
          className="mt-2 px-2 py-1 bg-white text-black rounded text-xs"
        >
          Toggle Debug
        </button>
      </div>
    </div>
  );
};