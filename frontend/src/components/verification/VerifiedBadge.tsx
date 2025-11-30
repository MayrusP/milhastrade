import React from 'react';

interface VerifiedBadgeProps {
  isVerified: boolean;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({ 
  isVerified, 
  size = 'md', 
  showText = false,
  className = '' 
}) => {
  // Debug: log do valor recebido
  console.log('🔍 VerifiedBadge - isVerified:', isVerified, typeof isVerified);
  
  if (!isVerified) return null;

  const sizeClasses = {
    sm: 'w-4 h-4 text-xs',
    md: 'w-5 h-5 text-sm',
    lg: 'w-6 h-6 text-base'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className={`inline-flex items-center ${className}`}>
      <div 
        className={`${sizeClasses[size]} bg-blue-500 text-white rounded-full flex items-center justify-center`}
        title="Usuário verificado"
      >
        <svg 
          className="w-3/4 h-3/4" 
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path 
            fillRule="evenodd" 
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
            clipRule="evenodd" 
          />
        </svg>
      </div>
      {showText && (
        <span className={`ml-1 font-medium text-blue-600 ${textSizeClasses[size]}`}>
          Verificado
        </span>
      )}
    </div>
  );
};