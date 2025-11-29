/**
 * Comando: /id
 * Descrição: Exibe o ID do grupo no terminal quando executado
 * Categoria: member (qualquer membro pode usar)
 * 
 * Como usar: /id
 */

const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "id",
  description: "Exibe o ID do grupo no terminal",
  commands: ["id"],
  usage: `${PREFIX}id`,
  handle: async ({ remoteJid, socket, sendReply, sendErrorReply }) => {
    try {
      // 🎯 Pegar informações do grupo
      const groupMetadata = await socket.groupMetadata(remoteJid);
      const groupName = groupMetadata.subject;
      
      // 📋 Exibir no terminal
      console.log("\n");
      console.log("╔════════════════════════════════════╗");
      console.log("║         ID DO GRUPO CAPTURADO      ║");
      console.log("╠════════════════════════════════════╣");
      console.log(`║ Nome: ${groupName.padEnd(27)} ║`);
      console.log(`║ ID: ${remoteJid.padEnd(29)} ║`);
      console.log("╚════════════════════════════════════╝");
      console.log("\n");
      
      // ✅ Enviar resposta no grupo (opcional)
      
    } catch (error) {
      console.log("Erro ao capturar ID do grupo:", error);
      await sendErrorReply("❌ Erro ao capturar o ID do grupo!");
    }
  },
};