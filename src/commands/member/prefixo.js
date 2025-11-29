const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "link",
  description: "Descrição do comando",
  commands: ["daddafa", ""],
  usage: `${PREFIX}link`,
  handle: async ({ sendReply, sendReact }) => {
    await sendReact("💘");

    // Corrigindo a interpolação dentro da string
    await sendReply(`╭━━━〔 ✨ *Meu Prefixo* ✨ 〕━━━╮
┃
┃ 🚀 *Este é o meu prefixo:* ${PREFIX}
┃
┃ 💡 Use-o antes de qualquer comando, por exemplo:
┃  ${PREFIX}menu para ver os comandos disponíveis!
┃
┃ 🎉 *Aproveite ao máximo meus recursos!* 😄
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`);
  },
};
