// src/utils/checkPermissions.js
/**
 * Utilitário para verificar permissões de usuários
 * Define quem pode usar comandos de gerenciamento do bot
 */

// 👑 NÚMEROS COM PERMISSÃO TOTAL
const ALLOWED_NUMBERS = [
  "558299288351", // Número 1
  "558299042818", // Número 2
];

/**
 * Verifica se um usuário tem permissão para usar comandos de gerenciamento
 * @param {string} userJid - ID do usuário (formato: 55XXXXXXXXXXX@s.whatsapp.net)
 * @returns {boolean} - true se tem permissão, false caso contrário
 */
function hasPermission(userJid) {
  // Extrair apenas os números do userJid
  const userNumber = userJid.replace(/[^\d]/g, "");
  
  console.log(`🔍 Verificando número: ${userNumber}`);
  console.log(`📋 Números permitidos: ${ALLOWED_NUMBERS.join(", ")}`);
  
  return ALLOWED_NUMBERS.includes(userNumber);
}

/**
 * Obter lista de números autorizados (para debug)
 */
function getAllowedNumbers() {
  return ALLOWED_NUMBERS;
}

module.exports = {
  hasPermission,
  getAllowedNumbers,
};