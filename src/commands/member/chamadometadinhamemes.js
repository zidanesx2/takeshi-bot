const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "infometadinhas",
  description: "Mostra informações sobre os tipos de metadinhas disponíveis",
  commands: ["infometadinhamemes", "metainfo", "tiposmetadinhas", "infometadinhameme"],
  usage: `${PREFIX}infometadinhas`,
  handle: async ({ sendReply }) => {
    const info = `
╭━━━〔 😂 *METADINHA DE MEMES* 😂 〕━━━╮
┃
┃ 🤪 *Tipos de Metadinhas Disponíveis:*
┃ 
┃ 🤪 ${PREFIX}*metadinhamemes*
┃ 🤪 ${PREFIX}*metadinhamemes2*
┃ 🤪 ${PREFIX}*metadinhamemes3*
┃ 🤪 ${PREFIX}*metadinhamemes4*
┃ 🤪 ${PREFIX}*metadinhamemes5*
┃
┃ ✨ *Quer buscar uma metadinha?*
┃ Digite: *${PREFIX}metadinha* e escolha o tipo!
┃
┃ 💡 *Dica:* Utilize *${PREFIX}menu* para ver todos comandos!
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
    `;

    await sendReply(info);
  },
};
