const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "infometadinhas",
  description: "Mostra informações sobre os tipos de metadinhas disponíveis",
  commands: ["infometadinhascasal", "metainfo", "tiposmetadinhascasal", "infometadinhacasal"],
  usage: `${PREFIX}infometadinhas`,
  handle: async ({ sendReply }) => {
    const info = `
╭━━━〔 💕 *INFORMAÇÕES DAS METADINHAS DE CASAL* 💕 〕━━━╮
┃
┃ 💖 *Escolha a numeração da metadinha!:*
┃ 
┃ 💕 ${PREFIX}*metadinhacasal*
┃ 💕 ${PREFIX}*metadinhacasal2* 
┃ 💕 ${PREFIX}*metadinhacasal3*
┃ 💕 ${PREFIX}*metadinhacasal4*
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
