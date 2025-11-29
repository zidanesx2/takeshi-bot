/**
 * Comando: /ativarbot
 * Descrição: Ativa o bot no grupo (adiciona o grupo à lista de permitidos)
 * Categoria: owner (só os números autorizados podem usar)
 * 
 * Como usar: /ativarbot
 */

const { PREFIX } = require(`${BASE_DIR}/config`);
const { addAllowedGroup, isGroupAllowed } = require(`${BASE_DIR}/utils/manageAllowedGroups`);

module.exports = {
  name: "ativarbot",
  description: "Ativa o bot no grupo",
  commands: ["ativarbot"],
  usage: `${PREFIX}ativarbot`,
  handle: async ({ remoteJid, socket, sendReply, userJid }) => {
    try {
      // Verificar se já está ativado
      if (isGroupAllowed(remoteJid)) {
        await sendReply("⚠️ Este grupo já está ativado!");
        return;
      }

      // Pegar informações do grupo
      const groupMetadata = await socket.groupMetadata(remoteJid);
      const groupName = groupMetadata.subject;

      // Adicionar grupo à lista de permitidos
      const result = addAllowedGroup(remoteJid);

      if (result.success) {
        await sendReply(`✅ Bot ativado com sucesso em "${groupName}"! 🎉\n\nAgora eu posso responder a comandos e mensagens neste grupo.`);
        
        // Log no terminal
        console.log("\n");
        console.log("╔════════════════════════════════════╗");
        console.log("║      BOT ATIVADO EM UM GRUPO       ║");
        console.log("╠════════════════════════════════════╣");
        console.log(`║ Grupo: ${groupName.padEnd(25)} ║`);
        console.log(`║ ID: ${remoteJid.padEnd(29)} ║`);
        console.log("╚════════════════════════════════════╝");
        console.log("\n");
      } else {
        await sendReply(`❌ Erro: ${result.message}`);
      }

    } catch (error) {
      console.error("Erro ao ativar bot:", error);
      await sendReply("❌ Erro ao ativar o bot no grupo!");
    }
  },
};