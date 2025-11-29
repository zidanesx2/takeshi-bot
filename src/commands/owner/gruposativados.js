/**
 * Comando: /gruposativos
 * Descrição: Lista todos os grupos onde o bot está ativado
 * Categoria: owner (só os números autorizados podem usar)
 * 
 * Como usar: /gruposativos
 */

const { PREFIX } = require(`${BASE_DIR}/config`);
const { listAllowedGroups } = require(`${BASE_DIR}/utils/manageAllowedGroups`);

module.exports = {
  name: "gruposativos",
  description: "Lista todos os grupos onde o bot está ativado",
  commands: ["gruposativos"],
  usage: `${PREFIX}gruposativos`,
  handle: async ({ remoteJid, socket, sendReply, userJid }) => {
    try {
      const allowedGroups = listAllowedGroups();

      if (allowedGroups.length === 0) {
        await sendReply("📭 Nenhum grupo ativado ainda!");
        return;
      }

      let message = "📋 **GRUPOS ATIVOS**\n\n";
      
      for (let i = 0; i < allowedGroups.length; i++) {
        const groupId = allowedGroups[i];
        try {
          const groupMetadata = await socket.groupMetadata(groupId);
          message += `${i + 1}. ${groupMetadata.subject}\n`;
          message += `   ID: ${groupId}\n\n`;
        } catch (error) {
          message += `${i + 1}. Grupo desconhecido\n`;
          message += `   ID: ${groupId}\n\n`;
        }
      }

      message += `\n✅ Total: ${allowedGroups.length} grupo(s)`;

      await sendReply(message);

      // Log no terminal
      console.log("\n");
      console.log("╔════════════════════════════════════╗");
      console.log("║       GRUPOS ATIVOS DO BOT         ║");
      console.log("╠════════════════════════════════════╣");
      allowedGroups.forEach((groupId, i) => {
        console.log(`║ ${(i + 1)}. ${groupId}`);
      });
      console.log("╚════════════════════════════════════╝");
      console.log("\n");

    } catch (error) {
      console.error("Erro ao listar grupos:", error);
      await sendReply("❌ Erro ao listar grupos!");
    }
  },
};