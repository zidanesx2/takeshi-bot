const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "testebotao",
  description: "Testa se os botões interativos funcionam",
  commands: ["testebotao", "tb"],
  usage: `${PREFIX}testebotao`,
  handle: async ({ socket, remoteJid, sendReply, sendErrorReply }) => {
    console.log("🔘 Testando diferentes formatos de botão...");

    // TESTE 1: Interactive Message (Novo formato)
    try {
      const interactiveMessage = {
        interactiveMessage: {
          body: { text: "🔘 *TESTE 1 - INTERACTIVE MESSAGE*\n\nVocê vê botões abaixo?" },
          footer: { text: "Powered by Baileys" },
          nativeFlowMessage: {
            buttons: [
              {
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                  display_text: "✅ Funcionou!",
                  id: "test_interactive_1"
                })
              },
              {
                name: "quick_reply", 
                buttonParamsJson: JSON.stringify({
                  display_text: "❌ Não funcionou",
                  id: "test_interactive_2"
                })
              }
            ]
          }
        }
      };

      await socket.sendMessage(remoteJid, interactiveMessage);
      console.log("✅ TESTE 1 enviado!");

    } catch (error1) {
      console.error("[ERRO TESTE 1]", error1.message);
    }

    // TESTE 2: Template Buttons (Formato antigo)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Aguarda 2s

      const templateMessage = {
        text: "🔘 *TESTE 2 - TEMPLATE BUTTONS*\n\nVocê vê botões abaixo?",
        templateButtons: [
          {
            index: 1,
            quickReplyButton: {
              displayText: '✅ Opção 1',
              id: 'test_template_1'
            }
          },
          {
            index: 2,
            quickReplyButton: {
              displayText: '❌ Opção 2',
              id: 'test_template_2'
            }
          }
        ]
      };

      await socket.sendMessage(remoteJid, templateMessage);
      console.log("✅ TESTE 2 enviado!");

    } catch (error2) {
      console.error("[ERRO TESTE 2]", error2.message);
    }

    // TESTE 3: Buttons (Formato muito antigo)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Aguarda 2s

      const buttonMessage = {
        text: "🔘 *TESTE 3 - BUTTONS CLÁSSICO*\n\nVocê vê botões abaixo?",
        buttons: [
          {
            buttonId: 'test_classic_1',
            buttonText: { displayText: '✅ Teste 1' },
            type: 1
          },
          {
            buttonId: 'test_classic_2',
            buttonText: { displayText: '❌ Teste 2' },
            type: 1
          }
        ],
        headerType: 1
      };

      await socket.sendMessage(remoteJid, buttonMessage);
      console.log("✅ TESTE 3 enviado!");

    } catch (error3) {
      console.error("[ERRO TESTE 3]", error3.message);
    }

    // TESTE 4: Lista (Alternativa)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Aguarda 2s

      const listMessage = {
        text: "🔘 *TESTE 4 - LISTA INTERATIVA*",
        buttonText: "Clique aqui",
        sections: [
          {
            title: "Opções de Teste",
            rows: [
              {
                title: "✅ Opção 1",
                description: "Primeira opção",
                rowId: "test_list_1"
              },
              {
                title: "❌ Opção 2", 
                description: "Segunda opção",
                rowId: "test_list_2"
              }
            ]
          }
        ]
      };

      await socket.sendMessage(remoteJid, listMessage);
      console.log("✅ TESTE 4 enviado!");

    } catch (error4) {
      console.error("[ERRO TESTE 4]", error4.message);
    }

    await sendReply("🔘 *Testes enviados!*\n\nVerifique qual formato apareceu como botões no WhatsApp e me informe!");
  }
};