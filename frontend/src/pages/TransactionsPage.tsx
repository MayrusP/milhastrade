import { Layout } from '@/components/common/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { TransactionHistory } from '@/components/user/TransactionHistory';

export const TransactionsPage = () => {
  return (
    <ProtectedRoute>
      <Layout>
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <TransactionHistory />
        </div>
      </Layout>
    </ProtectedRoute>
  );
};