const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "casamento",
  description: "Comando para realizar um casamento fictício entre dois membros do grupo.",
  commands: ["casar"],
  usage: `${PREFIX}casar @usuário`,
  handle: async ({ args, userJid, remoteJid, sendReply, sendText }) => {
    if (args.length < 1) {
      return sendReply("Por favor, mencione um usuário para casar!");
    }

    const membro1 = userJid;
    const membro2 = args[0]; // O ID do usuário mencionado no comando

    if (membro1 === membro2) {
      return sendReply("Você não pode se casar consigo mesmo! 😅");
    }

    // Mensagem de casamento
    const casamentoMensagem = `🎉 Parabéns a @${membro1.split('@')[0]} e @${membro2.split('@')[0]}! Vocês são agora oficialmente um casal! 💍✨\nViva esse momento especial!`;

    // Envia a mensagem de casamento
    sendText(casamentoMensagem, [membro1, membro2]);

    // Você pode adicionar mais funcionalidades, como emojis ou até uma história fictícia
    setTimeout(() => {
      sendText("E agora, o que será da vida de vocês? 💕👰🤵", [membro1, membro2]);
    }, 3000); // Mensagem após 3 segundos
  },
};
