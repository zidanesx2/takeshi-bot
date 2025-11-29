const { getUserLevel } = require("../../../level");
const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "level",
  description: "Mostra seu nível e XP atual",
  commands: ["level", "xp", "meunivel", "nivel"],
  usage: `${PREFIX}level`,

  handle: async ({ userJid, sendReply }) => {
    const user = getUserLevel(userJid);
    const xpParaProximo = user.level * 100;

    await sendReply(
      `┏━━━━━━━━━━━━━━━━━┓\n` +
      `  📈 *Seu Progresso* 📈\n` +
      `┣━━━━━━━━━━━━━━━━━┫\n` +
      `🏅 Nível: *${user.level}*\n` +
      `⚡ XP: *${user.xp}/${xpParaProximo}*\n` +
      `┣━━━━━━━━━━━━━━━━━┫\n` +
      `🔓 Falta *${xpParaProximo - user.xp}* XP para o próximo nível!\n` +
      `┗━━━━━━━━━━━━━━━━━┛`
    );
  },
};
