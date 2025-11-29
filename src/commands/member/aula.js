const { PREFIX, BOT_NAME } = require(`${BASE_DIR}/config`);

module.exports = {
    name: "botoes",
    description: "Envia uma mensagem com botões interativos.",
    commands: ["botoes"],
    usage: `${PREFIX}botoes`,

    handle: async ({ sendReact, remoteJid, socket }) => {
        try {
            if (!socket) throw new Error("Conexão do WhatsApp não disponível (socket undefined)");

            // Reage ao comando
            await sendReact("📋");

            // Definição dos botões
            const buttons = [
                { buttonId: 'btn1', buttonText: { displayText: 'Comando 1' }, type: 1 },
                { buttonId: 'btn2', buttonText: { displayText: 'Comando 2' }, type: 1 },
                { buttonId: 'btn3', buttonText: { displayText: 'Comando 3' }, type: 1 }
            ];

            // Mensagem com os botões
            const buttonMessage = {
                text: 'Escolha uma opção:',
                footer: BOT_NAME,
                buttons: buttons,
                headerType: 1
            };

            // Envia a mensagem
            await socket.sendMessage(remoteJid, buttonMessage);

        } catch (err) {
            console.error("Erro ao enviar menu:", err);
            await sendReact("❌");
        }
    }
};
