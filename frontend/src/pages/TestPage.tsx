import React, { useState } from 'react';
import { api } from '../services/api';

export const TestPage: React.FC = () => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testProfileEndpoint = async () => {
    setLoading(true);
    try {
      console.log('Token no localStorage:', localStorage.getItem('auth_token'));
      const response = await api.get('/user/profile');
      console.log('Resposta da API:', response.data);
      setResult(response.data);
    } catch (error: any) {
      console.error('Erro na API:', error);
      setResult({ error: error.message, response: error.response?.data });
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', {
        email: 'teste@milhas.com',
        password: '333333'
      });
      console.log('Login response:', response.data);
      
      if (response.data.success) {
        localStorage.setItem('auth_token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        setResult({ message: 'Login realizado com sucesso!', data: response.data });
      }
    } catch (error: any) {
      console.error('Erro no login:', error);
      setResult({ error: error.message, response: error.response?.data });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Teste de API</h1>
      
      <div className="space-y-4">
        <button
          onClick={testLogin}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Testando...' : 'Testar Login'}
        </button>
        
        <button
          onClick={testProfileEndpoint}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Testando...' : 'Testar Profile'}
        </button>
      </div>

      {result && (
        <div className="mt-6 p-4 bg-gray-100 rounded-md">
          <h3 className="font-semibold mb-2">Resultado:</h3>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-6 p-4 bg-yellow-50 rounded-md">
        <h3 className="font-semibold mb-2">Info do localStorage:</h3>
        <p><strong>Token:</strong> {localStorage.getItem('auth_token') ? 'Presente' : 'Ausente'}</p>
        <p><strong>User:</strong> {localStorage.getItem('user') ? 'Presente' : 'Ausente'}</p>
      </div>
    </div>
  );
};