

const { PREFIX } = require(`${BASE_DIR}/config`);  // Carrega o prefixo configurado

module.exports = {
  name: "prefixo",  // Nome do comando
  description: "Revela o prefixo do bot",  // Descrição do comando
  commands: ["prefixo"],  // Comando que o bot vai responder quando o usuário digitar 'prefixo'
  handle: async ({ sendReply }) => {
    const info = `O meu prefixo é: \`${PREFIX}\``;  // Responde com o prefixo configurado
    await sendReply(info);  // Envia a resposta para o usuário
  },
};
