const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "abrirgrupo",
  description: "Abre o grupo (todos podem enviar mensagens)",
  commands: ["abrirgrupo", "agrupo"],
  usage: `${PREFIX}abrirgrupo`,
  handle: async ({ remoteJid, socket, sendReply, userJid }) => {
    try {
      if (!remoteJid.endsWith("@g.us")) {
        return sendReply("⚠️ Este comando só pode ser usado em grupos.");
      }

      const metadata = await socket.groupMetadata(remoteJid);
      const botNumber = socket.user.id.split(":")[0];
      const isBotAdmin = metadata.participants.find(p => p.id.includes(botNumber))?.admin;
      const isUserAdmin = metadata.participants.find(p => p.id.includes(userJid))?.admin;

      if (!isBotAdmin) return sendReply("❌ Eu preciso ser administrador para abrir o grupo.");
      if (!isUserAdmin) return sendReply("❌ Você precisa ser administrador para usar este comando.");

      await socket.groupSettingUpdate(remoteJid, 'not_announcement');
      await sendReply("✅ Grupo aberto! Todos podem enviar mensagens.");
    } catch (e) {
      console.error(e);
      await sendReply("❌ Ocorreu um erro ao tentar abrir o grupo.");
    }
  },
};
