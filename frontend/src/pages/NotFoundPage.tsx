import { Link } from 'react-router-dom';
import { Layout } from '@/components/common/Layout';

export const NotFoundPage = () => {
  return (
    <Layout>
      <div className="min-h-96 flex items-center justify-center py-12">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Página não encontrada
          </h2>
          <p className="text-gray-600 mb-8 max-w-md">
            A página que você está procurando não existe ou foi movida.
          </p>
          <div className="space-x-4">
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              Voltar ao início
            </Link>
            <Link
              to="/marketplace"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              Ver ofertas
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};