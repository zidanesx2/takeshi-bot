const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "infometadinhas",
  description: "Mostra informações sobre os tipos de metadinhas disponíveis",
  commands: ["infometadinhaanimes", "metainfo", "tiposmetadinhas", "infometadinhaanime"],
  usage: `${PREFIX}infometadinhas`,
  handle: async ({ sendReply }) => {
    const info = `
╭━━━〔 💕 *METADINHA DE ANIMES* 💕 〕━━━╮
┃
┃ 💖 *Tipos de Metadinhas Disponíveis:*
┃ 
┃ 💖 ${PREFIX}*metadinhaanimes*
┃ 💖 ${PREFIX}*metadinhaanimes2*
┃ 💖 ${PREFIX}*metadinhaanimes3*
┃ 💖 ${PREFIX}*metadinhaanimes4*
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
