// src/utils/checkBlockedGroups.js
/**
 * Utilitário para verificar se um grupo está bloqueado
 */

const blockedGroups = require("../config/blockedGroups");

/**
 * Verifica se um grupo está na lista de bloqueados
 * @param {string} groupId - ID do grupo
 * @returns {boolean} - true se bloqueado, false se permitido
 */
function isGroupBlocked(groupId) {
  return blockedGroups.includes(groupId);
}

module.exports = { isGroupBlocked };