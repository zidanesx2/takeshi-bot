// src/utils/manageAllowedGroups.js
/**
 * Utilitário para gerenciar grupos permitidos
 * Salva e carrega grupos permitidos de um arquivo
 */

const fs = require("fs");
const path = require("path");

const ALLOWED_GROUPS_FILE = path.join(__dirname, "..", "..", "allowedGroups.json");

/**
 * Carregar grupos permitidos do arquivo
 */
function loadAllowedGroups() {
  try {
    if (fs.existsSync(ALLOWED_GROUPS_FILE)) {
      const data = fs.readFileSync(ALLOWED_GROUPS_FILE, "utf-8");
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error("❌ Erro ao carregar grupos permitidos:", error);
    return [];
  }
}

/**
 * Salvar grupos permitidos no arquivo
 */
function saveAllowedGroups(groups) {
  try {
    fs.writeFileSync(ALLOWED_GROUPS_FILE, JSON.stringify(groups, null, 2), "utf-8");
    console.log("✅ Grupos permitidos salvos!");
    return true;
  } catch (error) {
    console.error("❌ Erro ao salvar grupos permitidos:", error);
    return false;
  }
}

/**
 * Verificar se um grupo está permitido
 */
function isGroupAllowed(groupId) {
  const allowedGroups = loadAllowedGroups();
  return allowedGroups.includes(groupId);
}

/**
 * Adicionar um grupo à lista de permitidos
 */
function addAllowedGroup(groupId) {
  const allowedGroups = loadAllowedGroups();
  
  if (allowedGroups.includes(groupId)) {
    return { success: false, message: "Grupo já está permitido!" };
  }
  
  allowedGroups.push(groupId);
  saveAllowedGroups(allowedGroups);
  
  return { success: true, message: `Grupo ${groupId} adicionado!` };
}

/**
 * Remover um grupo da lista de permitidos
 */
function removeAllowedGroup(groupId) {
  const allowedGroups = loadAllowedGroups();
  const index = allowedGroups.indexOf(groupId);
  
  if (index === -1) {
    return { success: false, message: "Grupo não encontrado!" };
  }
  
  allowedGroups.splice(index, 1);
  saveAllowedGroups(allowedGroups);
  
  return { success: true, message: `Grupo ${groupId} removido!` };
}

/**
 * Listar todos os grupos permitidos
 */
function listAllowedGroups() {
  return loadAllowedGroups();
}

module.exports = {
  loadAllowedGroups,
  saveAllowedGroups,
  isGroupAllowed,
  addAllowedGroup,
  removeAllowedGroup,
  listAllowedGroups,
};