const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "infometadinhas",
  description: "Mostra informações sobre os tipos de metadinhas disponíveis",
  commands: ["metadinha", "metadinhas"],
  usage: `${PREFIX}infometadinhas`,
  handle: async ({ sendReply }) => {
    const info = `
╭━━━〔 ⚠️ *USO CORRETO DO COMANDO METADINHA!* ⚠️  〕━━━╮
┃
┃  ⚠️*Para escolher as metadinhas digite:*
┃ 
┃ ⚠️ ${PREFIX}*metadinhaanimes* - Metadinhas de anime
┃ ⚠️ ${PREFIX}*metadinhamemes* - Metadinhas de meme
┃ ⚠️ ${PREFIX}*metadinhacasal* - Metadinhas de casal
┃ ⚠️ ${PREFIX}*metadinha+18* - Metadinhas +18
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