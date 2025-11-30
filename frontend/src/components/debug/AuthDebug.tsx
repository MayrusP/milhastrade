import React from 'react';
import { useAuth } from '../../hooks/useAuthSimple.tsx';

export const AuthDebug: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded-lg text-sm z-50">
      <h3 className="font-bold mb-2">Auth Debug:</h3>
      <p>isAuthenticated: {isAuthenticated ? 'true' : 'false'}</p>
      <p>isLoading: {isLoading ? 'true' : 'false'}</p>
      <p>user: {user ? user.name : 'null'}</p>
      <p>token: {localStorage.getItem('auth_token') ? 'exists' : 'null'}</p>
    </div>
  );
};