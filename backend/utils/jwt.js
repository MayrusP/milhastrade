const jwt = require('jsonwebtoken');

/**
 * Gera um token JWT para o usuário
 * @param {string} userId - ID do usuário
 * @param {object} additionalData - Dados adicionais para incluir no token
 * @returns {string} Token JWT
 */
const generateToken = (userId, additionalData = {}) => {
  const payload = {
    userId,
    ...additionalData,
    iat: Math.floor(Date.now() / 1000)
  };

  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * Verifica e decodifica um token JWT
 * @param {string} token - Token JWT para verificar
 * @returns {object|null} Payload decodificado ou null se inválido
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.error('❌ Erro ao verificar token:', error.message);
    return null;
  }
};

/**
 * Decodifica um token sem verificar (útil para debug)
 * @param {string} token - Token JWT
 * @returns {object|null} Payload decodificado
 */
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    console.error('❌ Erro ao decodificar token:', error.message);
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken,
  decodeToken
};
