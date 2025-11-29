const { getCoins } = require("../../../coins");
const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "coins",
  description: "Mostra quantas moedas você tem 💰",
  commands: ["coins", "moedas", "saldo", "coin"],
  usage: `${PREFIX}coins`,

  handle: async ({ userJid, sendReply }) => {
    const saldo = getCoins(userJid);

    await sendReply(
      `┏━━━━━━━━━━━━━━━┓\n` +
      `  💰 *Seu Saldo Atual* 💰\n` +
      `┣━━━━━━━━━━━━━━━┫\n` +
      `🪙 Moedas: *${saldo}*\n` +
      `┣━━━━━━━━━━━━━━━┫\n` +
      `✨ Use suas moedas em comandos VIP ou recompensas!\n` +
      `┗━━━━━━━━━━━━━━━┛`
    );
  },
};
