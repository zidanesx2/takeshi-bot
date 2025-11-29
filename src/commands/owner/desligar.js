const { PREFIX, OWNER_NUMBER } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "desligar",
  description: "Desliga o bot (apenas para o dono)",
  commands: ["desligar", "shutdown"],
  usage: `${PREFIX}desligar`,
  handle: async ({ sendReply, userJid }) => {
    try {
      if (!OWNER_NUMBER.includes(userJid.split("@")[0])) {
        return sendReply("❌ Apenas o dono do bot pode usar este comando.");
      }

      await sendReply("🛑 O bot está desligando... Até mais!");

      // Dá um tempo para a mensagem ser enviada
      setTimeout(() => {
        process.exit(0); // Encerra o processo Node.js
      }, 1000);

    } catch (e) {
      console.error(e);
      await sendReply("❌ Ocorreu um erro ao tentar desligar o bot.");
    }
  },
};
