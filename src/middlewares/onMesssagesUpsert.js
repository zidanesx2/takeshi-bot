/**
 * Middleware unificado para processar mensagens recebidas
 * 🤖 Combina funcionalidades: comandos dinâmicos, IA Genos, XP/Level system, botões interativos
 * @author Anthony Dev + IA Integration
 * 🚫 Modificado para incluir filtro de grupos bloqueados e permitidos
 */

// 🔧 Funcionalidades do sistema original
const { dynamicCommand } = require("../utils/dynamicCommand");
const { loadCommonFunctions } = require("../utils/loadCommonFunctions");
const { addXP, getUserLevel } = require("../../level");
const { addCoins } = require("../../coins");
const { isGroupAllowed } = require("../utils/manageAllowedGroups");

// 🔧 Imports condicionais - só importa se existir
let hasTypeOrCommand, checkPrefix, waitMessage, PREFIX;

try {
  const utils = require("../utils/hasTypeOrCommand");
  hasTypeOrCommand = utils.hasTypeOrCommand;
} catch (e) {
  hasTypeOrCommand = null;
}

try {
  const prefixUtils = require("../utils/checkPrefix");
  checkPrefix = prefixUtils.checkPrefix;
} catch (e) {
  checkPrefix = null;
}

try {
  const waitUtils = require("../utils/waitMessage");
  waitMessage = waitUtils.waitMessage;
} catch (e) {
  waitMessage = async () => {}; // função vazia se não existir
}

try {
  const config = require("../config");
  PREFIX = config.PREFIX || "!";
} catch (e) {
  PREFIX = "!"; // prefix padrão
}

exports.onMessagesUpsert = async ({ socket, messages, genosIA = null }) => {
  try {
    if (!messages.length) return;

    // 🔄 Processar cada mensagem
    for (const webMessage of messages) {
      
      const remoteJid = webMessage.key?.remoteJid;

      // 🚫 BLOQUEAR MENSAGENS PRIVADAS - Bot só responde em grupos
      if (!remoteJid.includes("@g.us")) {
        console.log(`🚫 Mensagem privada de ${remoteJid} ignorada. Bot só responde em grupos!`);
        continue; // Pular para próxima mensagem
      }

      // 📝 Extrair o comando para verificação
      let messageBody = "";
      if (webMessage.message?.conversation) {
        messageBody = webMessage.message.conversation;
      } else if (webMessage.message?.extendedTextMessage) {
        messageBody = webMessage.message.extendedTextMessage.text;
      }

      // ✅ VERIFICAR SE O GRUPO ESTÁ PERMITIDO (WHITELIST)
      // EXCEÇÃO: /ativarbot pode ser usado mesmo que o grupo não esteja ativado
      const isAtivarbotCommand = messageBody.toLowerCase().includes("/ativarbot");
      
      if (remoteJid.includes("@g.us") && !isGroupAllowed(remoteJid) && !isAtivarbotCommand) {
        console.log(`🚫 Grupo ${remoteJid} não está ativado. Ignorando mensagem.`);
        continue; // Pular para próxima mensagem
      }
      
      // 🔘 HANDLER PARA BOTÕES INTERATIVOS (do sistema antigo)
      if (webMessage.message?.buttonsResponseMessage) {
        await handleButtonInteraction(socket, webMessage);
        continue; // Pular processamento normal
      }

      // 🔧 Carregar funções comuns (compatibilidade com sistema antigo)
      const commonFunctions = loadCommonFunctions({ socket, webMessage });
      if (!commonFunctions) continue;

      const { userJid, body, remoteJid: remoteJidCheck } = commonFunctions;

      // 🎯 Sistema de XP e Level (do sistema antigo)
      await handleXPSystem(socket, userJid, remoteJidCheck);

      // 🎵 Handler para menu do comando play (do sistema antigo)
      if (await handlePlayMenuResponse(socket, body, remoteJidCheck, userJid)) {
        continue; // Pular processamento normal
      }

      // 📊 Comando !level (do sistema antigo)
      if (await handleLevelCommand(socket, body, userJid, remoteJidCheck)) {
        continue; // Pular processamento normal
      }

      // 🔍 Processar mensagem (integração com IA se disponível)
      await processMessage(socket, webMessage, genosIA, commonFunctions);
    }

  } catch (error) {
    console.error("❌ Erro no middleware onMessagesUpsert:", error);
  }
};

// 🔘 Processar botões interativos
async function handleButtonInteraction(socket, webMessage) {
  try {
    const buttonId = webMessage.message.buttonsResponseMessage.selectedButtonId;
    const from = webMessage.key.remoteJid;
    const userJid = webMessage.key.participant || webMessage.key.remoteJid;
    
    console.log('🔘 Botão clicado:', buttonId);

    // Se for um botão do comando play
    if (buttonId.startsWith('play_')) {
      const playCommand = require('../commands/member/play');
      
      await playCommand.handleButtonClick(buttonId, {
        from,
        userJid,
        socket,
        sendReply: async (text) => {
          await socket.sendMessage(from, { text });
        },
        sendErrorReply: async (text) => {
          await socket.sendMessage(from, { text: `❌ ${text}` });
        }
      });
    }
  } catch (error) {
    console.error('❌ Erro ao processar botão:', error);
    await socket.sendMessage(webMessage.key.remoteJid, { 
      text: '❌ Erro ao processar sua solicitação.' 
    });
  }
}

// 🎯 Sistema de XP e Level
async function handleXPSystem(socket, userJid, remoteJid) {
  try {
    const resultado = addXP(userJid);

    if (resultado.levelUp) {
      // 🪙 Dá 5 coins ao subir de nível
      addCoins(userJid, 5);

      await socket.sendMessage(remoteJid, {
        text: `🎉 @${userJid.split("@")[0]} subiu para o nível ${resultado.level} e ganhou +5 moedas! 💰`,
        mentions: [userJid],
      });
    }
  } catch (error) {
    console.error("❌ Erro no sistema de XP:", error);
  }
}

// 🎵 Handler para menu do comando play
async function handlePlayMenuResponse(socket, body, remoteJid, userJid) {
  if (body && ['1', '2'].includes(body.trim())) {
    const key = `${remoteJid}_${userJid}`;
    if (global.playMenus && global.playMenus.has(key)) {
      try {
        const playCommand = require('../commands/member/play');
        await playCommand.handleMenuResponse(body.trim(), {
          remoteJid,
          userJid,
          sendReply: async (text) => {
            await socket.sendMessage(remoteJid, { text });
          },
          sendErrorReply: async (text) => {
            await socket.sendMessage(remoteJid, { text: `❌ ${text}` });
          }
        });
        return true; // Indica que foi processado
      } catch (error) {
        console.error('❌ Erro ao processar menu do play:', error);
      }
    }
  }
  return false;
}

// 📊 Comando !level
async function handleLevelCommand(socket, body, userJid, remoteJid) {
  if (body?.toLowerCase() === "!level") {
    try {
      const user = getUserLevel(userJid);
      await socket.sendMessage(remoteJid, {
        text: `📈 Você está no nível ${user.level} com ${user.xp}/${user.level * 100} XP!`,
        mentions: [userJid],
      });
      return true; // Indica que foi processado
    } catch (error) {
      console.error("❌ Erro ao processar comando !level:", error);
    }
  }
  return false;
}

// 🔄 Processar mensagem (sistema antigo + integração IA)
async function processMessage(socket, webMessage, genosIA, commonFunctions) {
  try {
    // Se não tiver as funções do novo sistema, só processa o antigo
    if (!hasTypeOrCommand || !checkPrefix) {
      console.log(`💬 Processando apenas com sistema antigo`);
      // ⛓️ Comandos dinâmicos (sistema antigo)
      await dynamicCommand(commonFunctions);
      return;
    }

    const { remoteJid } = webMessage.key;
    const { userJid } = commonFunctions;
    
    // 📝 Extrair dados da mensagem
    const messageType = hasTypeOrCommand(webMessage.message);
    let fullMessage = "";
    
    // Extrair texto baseado no tipo de mensagem
    if (messageType === "conversation") {
      fullMessage = webMessage.message.conversation;
    } else if (messageType === "extendedTextMessage") {
      fullMessage = webMessage.message.extendedTextMessage.text;
    }

    // Não processar se não houver texto
    if (!fullMessage) {
      // ⛓️ Comandos dinâmicos (sistema antigo)
      await dynamicCommand(commonFunctions);
      return;
    }

    console.log(`📨 Mensagem recebida: "${fullMessage}"`);

    // 🔍 Verificar se é um comando com prefix
    const hasPrefix = checkPrefix(fullMessage);
    
    if (hasPrefix && genosIA) {
      // 🤖 Se tem prefix e IA disponível, pode processar comandos IA
      console.log(`🤖 Comando IA detectado: ${fullMessage}`);
      
      // ⏳ Mostrar indicador de "digitando"
      if (waitMessage) {
        await waitMessage(socket, remoteJid);
      }
      
      // Aqui você pode integrar com a IA
      // Exemplo: await genosIA.processCommand(fullMessage, context);
      
    } else if (!hasPrefix) {
      // ⛓️ Comandos dinâmicos (sistema antigo) - para comandos sem prefix
      await dynamicCommand(commonFunctions);
      
      // 💬 Mensagem normal - pode ser processada pela IA
      if (genosIA) {
        console.log(`💬 Mensagem para IA: "${fullMessage}"`);
        // Aqui você pode processar com a IA
        // Exemplo: await genosIA.processMessage(fullMessage, context);
      }
    } else {
      // ⛓️ Comandos dinâmicos (sistema antigo) como fallback
      await dynamicCommand(commonFunctions);
    }

  } catch (error) {
    console.error("❌ Erro ao processar mensagem:", error);
    // ⛓️ Fallback para sistema antigo em caso de erro
    try {
      await dynamicCommand(commonFunctions);
    } catch (fallbackError) {
      console.error("❌ Erro também no fallback:", fallbackError);
    }
  }
}

// 🛠️ Funções auxiliares básicas
async function sendText(socket, jid, text) {
  return await socket.sendMessage(jid, { text });
}

async function sendErrorReply(socket, jid, text) {
  return await socket.sendMessage(jid, {
    text: `❌ **ERRO**\n\n${text}`
  });
}