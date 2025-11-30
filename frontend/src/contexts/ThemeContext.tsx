import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

// Função utilitária para aplicar tema
const applyTheme = (theme: Theme) => {
  // Limpar todas as classes primeiro (tanto html quanto body)
  document.documentElement.classList.remove('dark', 'light');
  document.body.classList.remove('dark', 'light');
  
  // Aplicar a classe correta em ambos
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark');
  }
  
  // Salvar no localStorage
  try {
    localStorage.setItem('theme', theme);
  } catch (error) {
    console.log('❌ Erro ao salvar tema:', error);
  }
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Inicializar com tema salvo ou padrão
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const savedTheme = localStorage.getItem('theme') as Theme;
      return savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : 'light';
    } catch {
      return 'light';
    }
  });

  // Aplicar tema na inicialização
  useEffect(() => {
    applyTheme(theme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    
    // Aplicar tema imediatamente (síncrono)
    applyTheme(newTheme);
    
    // Atualizar estado (assíncrono)
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};