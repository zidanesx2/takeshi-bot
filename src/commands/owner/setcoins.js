const { setCoins } = require("../../../coins");
const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "setcoin",
  description: "Define manualmente a quantidade de moedas de um usuário 💰",
  commands: ["setcoin", "definircoin", "coinset"],
  usage: `${PREFIX}setcoin @usuario 50`,

  handle: async ({ args, sendReply, replyJid, webMessageInfo }) => {
    let userJid = null;

    // 🔍 1 - Resposta à mensagem
    if (replyJid) {
      userJid = replyJid;
    }

    // 🔍 2 - Menção direta
    const contextInfo =
      webMessageInfo?.message?.extendedTextMessage?.contextInfo ||
      webMessageInfo?.message?.imageMessage?.contextInfo ||
      webMessageInfo?.message?.videoMessage?.contextInfo ||
      webMessageInfo?.message?.conversation?.contextInfo ||
      webMessageInfo?.contextInfo;

    const mentionedJids = contextInfo?.mentionedJid;
    if (!userJid && Array.isArray(mentionedJids) && mentionedJids.length > 0) {
      userJid = mentionedJids[0];
    }

    // 🚫 Nenhum usuário encontrado
    if (!userJid) {
      return sendReply(`❗ Você precisa mencionar um usuário ou responder à mensagem dele.\nExemplo: *${PREFIX}setcoin @usuario 50*`);
    }

    // 🔢 Extrai a quantidade
    const quantidadeStr = args.find(arg => /^\d+$/.test(arg));
    const quantidade = parseInt(quantidadeStr, 10);

    if (isNaN(quantidade) || quantidade < 0) {
      return sendReply("❌ Quantidade inválida. Use um número maior ou igual a 0.");
    }

    // 💰 Define as moedas
    setCoins(userJid, quantidade);

    const numeroSemArroba = userJid.split("@")[0];

    // ✅ Envia mensagem com menção real (nome verdinho)
    await sendReply(
      `✅ Moedas de @${numeroSemArroba} definidas para *${quantidade}*!`,
      [userJid] // ← Isso ativa a marcação real
    );
  },
};
