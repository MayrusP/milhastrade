import React from 'react';
import { getPasswordRequirements } from '../../utils/formatters';

interface PasswordRequirementsProps {
  password: string;
  show: boolean;
}

export const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({ password, show }) => {
  if (!show) return null;

  const requirements = getPasswordRequirements(password);
  const allMet = requirements.minLength && requirements.hasUppercase && requirements.hasSpecialChar;

  const RequirementItem = ({ met, text }: { met: boolean; text: string }) => (
    <div className={`flex items-center space-x-2 transition-all duration-300 ${
      met ? 'transform scale-105' : ''
    }`}>
      <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 ${
        met ? 'bg-green-500 shadow-lg' : 'bg-red-500'
      }`}>
        {met ? (
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </div>
      <span className={`text-sm font-medium transition-colors duration-300 ${
        met ? 'text-green-700' : 'text-red-600'
      }`}>
        {text}
      </span>
    </div>
  );

  return (
    <div className={`mt-2 p-4 rounded-lg border-2 transition-all duration-300 ${
      allMet 
        ? 'bg-green-50 border-green-200 shadow-sm' 
        : 'bg-gray-50 border-gray-200'
    }`}>
      <div className="flex items-center mb-3">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 transition-all duration-300 ${
          allMet ? 'bg-green-500' : 'bg-gray-400'
        }`}>
          {allMet ? (
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m2-6V9" />
            </svg>
          )}
        </div>
        <p className={`text-sm font-semibold transition-colors duration-300 ${
          allMet ? 'text-green-700' : 'text-gray-700'
        }`}>
          {allMet ? '✅ Senha forte!' : 'Requisitos da senha:'}
        </p>
      </div>
      
      <div className="space-y-2">
        <RequirementItem 
          met={requirements.minLength} 
          text="Pelo menos 6 caracteres" 
        />
        <RequirementItem 
          met={requirements.hasUppercase} 
          text="1 letra maiúscula (A-Z)" 
        />
        <RequirementItem 
          met={requirements.hasSpecialChar} 
          text="1 caractere especial (!@#$%...)" 
        />
      </div>
      
      {allMet && (
        <div className="mt-3 p-2 bg-green-100 rounded-md">
          <p className="text-xs text-green-800 font-medium text-center">
            🎉 Perfeito! Sua senha atende a todos os requisitos de segurança.
          </p>
        </div>
      )}
    </div>
  );
};