import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuthSimple.tsx';

export const AuthTestPage: React.FC = () => {
  const { user, isAuthenticated, login, logout } = useAuth();
  const [email, setEmail] = useState('teste@milhas.com');
  const [password, setPassword] = useState('333333');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await login({ email, password });
      alert('Login realizado com sucesso!');
    } catch (error: any) {
      alert(`Erro no login: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    alert('Logout realizado!');
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Teste de Autenticação</h1>
      
      <div className="mb-4 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold mb-2">Estado Atual:</h3>
        <p>Autenticado: {isAuthenticated ? 'Sim' : 'Não'}</p>
        <p>Usuário: {user ? user.name : 'Nenhum'}</p>
        <p>Email: {user ? user.email : 'Nenhum'}</p>
        <p>Token: {localStorage.getItem('auth_token') ? 'Presente' : 'Ausente'}</p>
      </div>

      {!isAuthenticated ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Fazendo login...' : 'Login'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-green-600">Você está logado como {user?.name}</p>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};