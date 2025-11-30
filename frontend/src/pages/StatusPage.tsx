import React, { useState, useEffect } from 'react';
import { Layout } from '../components/common/Layout';
import { useAuth } from '../hooks/useAuthSimple';

export const StatusPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [apiStatus, setApiStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [apiData, setApiData] = useState<any>(null);

  useEffect(() => {
    testApiConnection();
  }, []);

  const testApiConnection = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/health');
      const data = await response.json();
      setApiData(data);
      setApiStatus('success');
    } catch (error) {
      console.error('Erro ao conectar com a API:', error);
      setApiStatus('error');
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Status do Sistema</h1>

        {/* Status da Autenticação */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Autenticação</h2>
          <div className="space-y-2">
            <p>
              <span className="font-medium">Status:</span>{' '}
              <span className={isAuthenticated ? 'text-green-600' : 'text-red-600'}>
                {isAuthenticated ? '✅ Autenticado' : '❌ Não autenticado'}
              </span>
            </p>
            {user && (
              <>
                <p><span className="font-medium">Nome:</span> {user.name}</p>
                <p><span className="font-medium">Email:</span> {user.email}</p>
                <p><span className="font-medium">Role:</span> {user.role}</p>
                <p><span className="font-medium">Créditos:</span> R$ {user.credits?.toFixed(2)}</p>
              </>
            )}
          </div>
        </div>

        {/* Status da API */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">API Backend</h2>
          <div className="space-y-2">
            <p>
              <span className="font-medium">Status:</span>{' '}
              <span className={
                apiStatus === 'success' ? 'text-green-600' : 
                apiStatus === 'error' ? 'text-red-600' : 'text-yellow-600'
              }>
                {apiStatus === 'success' ? '✅ Conectado' : 
                 apiStatus === 'error' ? '❌ Erro de conexão' : '⏳ Carregando...'}
              </span>
            </p>
            {apiData && (
              <>
                <p><span className="font-medium">Mensagem:</span> {apiData.message}</p>
                <p><span className="font-medium">Timestamp:</span> {apiData.timestamp}</p>
              </>
            )}
          </div>
        </div>

        {/* Testes de Endpoints */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Testes de Endpoints</h2>
          <div className="space-y-4">
            <TestEndpoint 
              name="Health Check" 
              url="/api/health" 
              method="GET"
            />
            <TestEndpoint 
              name="User Profile" 
              url="/api/user/profile" 
              method="GET"
              requiresAuth={true}
            />
            <TestEndpoint 
              name="Verification Status" 
              url="/api/verification/status" 
              method="GET"
              requiresAuth={true}
            />
            <TestEndpoint 
              name="User Ratings" 
              url="/api/user/1/ratings" 
              method="GET"
              requiresAuth={true}
            />
            <TestEndpoint 
              name="User Offers" 
              url="/api/user/offers" 
              method="GET"
              requiresAuth={true}
            />
            <TestEndpoint 
              name="Offers List" 
              url="/api/offers" 
              method="GET"
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

interface TestEndpointProps {
  name: string;
  url: string;
  method: string;
  requiresAuth?: boolean;
}

const TestEndpoint: React.FC<TestEndpointProps> = ({ name, url, method, requiresAuth }) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [response, setResponse] = useState<any>(null);

  const testEndpoint = async () => {
    setStatus('loading');
    try {
      const headers: any = {
        'Content-Type': 'application/json',
      };

      if (requiresAuth) {
        const token = localStorage.getItem('auth_token');
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
      }

      const res = await fetch(`http://localhost:5000${url}`, {
        method,
        headers,
      });

      const data = await res.json();
      setResponse(data);
      setStatus(res.ok ? 'success' : 'error');
    } catch (error) {
      setResponse({ error: error.message });
      setStatus('error');
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="font-medium text-gray-900">{name}</h3>
          <p className="text-sm text-gray-600">{method} {url}</p>
          {requiresAuth && (
            <span className="inline-block px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded mt-1">
              Requer autenticação
            </span>
          )}
        </div>
        <button
          onClick={testEndpoint}
          disabled={status === 'loading'}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {status === 'loading' ? 'Testando...' : 'Testar'}
        </button>
      </div>
      
      {status !== 'idle' && (
        <div className="mt-3">
          <div className={`text-sm font-medium mb-2 ${
            status === 'success' ? 'text-green-600' : 
            status === 'error' ? 'text-red-600' : 'text-yellow-600'
          }`}>
            {status === 'success' ? '✅ Sucesso' : 
             status === 'error' ? '❌ Erro' : '⏳ Carregando...'}
          </div>
          {response && (
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
              {JSON.stringify(response, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};