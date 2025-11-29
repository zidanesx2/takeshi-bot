/**
 * Comando: /desativarbot
 * Descrição: Desativa o bot no grupo (remove da lista de permitidos)
 * Categoria: owner (só os números autorizados podem usar)
 * 
 * Como usar: /desativarbot
 */

const { PREFIX } = require(`${BASE_DIR}/config`);
const { removeAllowedGroup, isGroupAllowed } = require(`${BASE_DIR}/utils/manageAllowedGroups`);

module.exports = {
  name: "desativarbot",
  description: "Desativa o bot no grupo",
  commands: ["desativarbot"],
  usage: `${PREFIX}desativarbot`,
  handle: async ({ remoteJid, socket, sendReply, userJid }) => {
    try {
      // Verificar se está desativado
      if (!isGroupAllowed(remoteJid)) {
        await sendReply("⚠️ Este grupo já está desativado!");
        return;
      }

      // Pegar informações do grupo
      const groupMetadata = await socket.groupMetadata(remoteJid);
      const groupName = groupMetadata.subject;

      // Remover grupo da lista de permitidos
      const result = removeAllowedGroup(remoteJid);

      if (result.success) {
        await sendReply(`✅ Bot desativado com sucesso em "${groupName}"! 👋\n\nNão vou mais responder neste grupo.`);
        
        // Log no terminal
        console.log("\n");
        console.log("╔════════════════════════════════════╗");
        console.log("║    BOT DESATIVADO EM UM GRUPO      ║");
        console.log("╠════════════════════════════════════╣");
        console.log(`║ Grupo: ${groupName.padEnd(25)} ║`);
        console.log(`║ ID: ${remoteJid.padEnd(29)} ║`);
        console.log("╚════════════════════════════════════╝");
        console.log("\n");
      } else {
        await sendReply(`❌ Erro: ${result.message}`);
      }

    } catch (error) {
      console.error("Erro ao desativar bot:", error);
      await sendReply("❌ Erro ao desativar o bot no grupo!");
    }
  },
};