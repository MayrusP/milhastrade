import React, { useState, useEffect } from 'react';
import { formatPhone, unformatPhone, isValidPhone } from '../../utils/formatters';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  placeholder = "(11) 99999-9999",
  className = "",
  required = false,
  disabled = false
}) => {
  const [displayValue, setDisplayValue] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setDisplayValue(formatPhone(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const cleanValue = unformatPhone(inputValue);
    
    // Limita a 11 dígitos
    if (cleanValue.length <= 11) {
      const formatted = formatPhone(cleanValue);
      setDisplayValue(formatted);
      
      // Valida o telefone (deve ter exatamente 11 dígitos quando completo)
      const valid = cleanValue.length === 0 || cleanValue.length === 11;
      setIsValid(valid);
      
      // Chama onChange com o valor limpo (apenas números)
      onChange(cleanValue);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    // Se o campo estiver vazio, inicia com a formatação
    if (!displayValue) {
      setDisplayValue('(');
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Se só tem o parêntese, limpa o campo
    if (displayValue === '(') {
      setDisplayValue('');
      onChange('');
    }
  };

  const baseClasses = `
    w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 
    dark:bg-gray-700 dark:text-white dark:border-gray-600
  `;
  
  const validationClasses = isValid 
    ? 'border-gray-300 dark:border-gray-600' 
    : 'border-red-300 dark:border-red-600';

  return (
    <div>
      <input
        type="tel"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`${baseClasses} ${validationClasses} ${className}`}
        required={required}
        disabled={disabled}
      />
      {!isValid && displayValue && displayValue !== '(' && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          Celular deve ter 11 dígitos
        </p>
      )}
    </div>
  );
};