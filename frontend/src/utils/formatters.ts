// Utilitários para formatação de dados

/**
 * Formata um número de celular brasileiro no formato (DDD) 99999-9999
 * @param phone - Número de telefone (apenas números ou com formatação)
 * @returns Telefone formatado progressivamente
 */
export const formatPhone = (phone: string | null | undefined): string => {
  if (!phone) return '';
  
  // Remove todos os caracteres não numéricos
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Formatação progressiva para celular (11 dígitos)
  if (cleanPhone.length === 0) {
    return '';
  } else if (cleanPhone.length <= 2) {
    return `(${cleanPhone}`;
  } else if (cleanPhone.length <= 7) {
    return `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(2)}`;
  } else if (cleanPhone.length <= 11) {
    return `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(2, 7)}-${cleanPhone.slice(7)}`;
  }
  
  // Limita a 11 dígitos
  const limitedPhone = cleanPhone.slice(0, 11);
  return `(${limitedPhone.slice(0, 2)}) ${limitedPhone.slice(2, 7)}-${limitedPhone.slice(7)}`;
};

/**
 * Remove formatação do telefone, deixando apenas números
 * @param phone - Telefone formatado
 * @returns Apenas números
 */
export const unformatPhone = (phone: string): string => {
  return phone.replace(/\D/g, '');
};

/**
 * Valida se um celular brasileiro é válido (apenas 11 dígitos)
 * @param phone - Número de telefone
 * @returns true se válido, false caso contrário
 */
export const isValidPhone = (phone: string): boolean => {
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length === 11;
};

/**
 * Valida se uma senha atende aos critérios de segurança
 * @param password - Senha a ser validada
 * @returns Objeto com status de validação e mensagens de erro
 */
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 6) {
    errors.push('Deve ter pelo menos 6 caracteres');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Deve conter pelo menos 1 letra maiúscula');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Deve conter pelo menos 1 caractere especial');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Verifica requisitos individuais da senha para feedback visual
 * @param password - Senha a ser validada
 * @returns Objeto com status de cada requisito
 */
export const getPasswordRequirements = (password: string) => {
  return {
    minLength: password.length >= 6,
    hasUppercase: /[A-Z]/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  };
};