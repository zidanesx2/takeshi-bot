module.exports = function extractDataFromMessage(webMessage) {
  const message = webMessage.message || {};
  const msgType = Object.keys(message)[0];

  let fullMessage = "";
  let commandName = "";
  let args = [];
  const prefix = "!"; // ou importe do config

  if (msgType === "conversation") {
    fullMessage = message.conversation;
  } else if (msgType === "extendedTextMessage") {
    fullMessage = message.extendedTextMessage.text;
  } else if (msgType === "buttonsResponseMessage") {
    fullMessage = message.buttonsResponseMessage.selectedButtonId;
  }

  if (fullMessage?.startsWith(prefix)) {
    const withoutPrefix = fullMessage.slice(prefix.length);
    [commandName, ...args] = withoutPrefix.split(" ");
  } else {
    commandName = fullMessage?.trim();
  }

  return {
    fullMessage,
    commandName,
    args,
    fullArgs: args.join(" "),
    isReply: !!webMessage.message?.extendedTextMessage?.contextInfo,
    prefix,
    remoteJid: webMessage.key.remoteJid,
    replyJid: webMessage.key.participant || webMessage.key.remoteJid,
    userJid: webMessage.key.participant || webMessage.key.remoteJid,
  };
};
