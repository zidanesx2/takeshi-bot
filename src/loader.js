/**
 * Este script é responsável
 * por carregar os eventos
 * que serão escutados pelo
 * socket do WhatsApp.
 *
 * @author Dev Gui
 * 🤖 Modificado para incluir Genos IA
 * 🚫 Modificado para incluir filtro de grupos bloqueados
 */
const { TIMEOUT_IN_MILLISECONDS_BY_EVENT, BLOCKED_GROUPS } = require("./config");
const { onMessagesUpsert } = require("./middlewares/onMesssagesUpsert");
const {
  onGroupParticipantsUpdate,
} = require("./middlewares/onGroupParticipantsUpdate");
const path = require("path");

// 🤖 Importar a IA
const { GenosIA } = require("../ia");

// 🤖 Instância global da IA
let genosIA = null;

// 🚫 Verificar se um grupo está bloqueado
function isGroupBlocked(groupId) {
  return BLOCKED_GROUPS && BLOCKED_GROUPS.includes(groupId);
}

// 🤖 Processar mensagens com a IA
async function processarMensagemIA(socket, messages) {
  try {
    // Se a IA não estiver ativa, não processar
    if (!genosIA || !genosIA.ativa) return;

    for (const message of messages) {
      // Verificar se é uma mensagem de texto válida
      if (!message.message) continue;
      
      const messageType = Object.keys(message.message)[0];
      let messageText = "";
      
      // Extrair texto da mensagem
      if (messageType === 'conversation') {
        messageText = message.message.conversation;
      } else if (messageType === 'extendedTextMessage') {
        messageText = message.message.extendedTextMessage.text;
      }
      
      if (!messageText || messageText.trim() === '') continue;

      const from = message.key?.remoteJid || '';
      const isFromMe = message.key?.fromMe || false;
      const participantId = message.key?.participant || message.key?.remoteJid;
      
      
      if (isFromMe) continue;

      // 🚫 VERIFICAR SE O GRUPO ESTÁ BLOQUEADO
      if (isGroupBlocked(from)) {
        console.log(`⛔ Grupo ${from} está bloqueado. Ignorando mensagem.`);
        continue;
      }

      
      const { PREFIX } = require('./config');
      if (messageText.startsWith(PREFIX)) continue;

      
      const isGroup = from.endsWith('@g.us');
      const userId = isGroup ? participantId : from;
      const groupId = isGroup ? from : null;

      console.log(`🤖 IA processando: "${messageText}" de ${userId}`);

      
      const respostaIA = await genosIA.processarMensagem(messageText, userId, groupId);

     
      if (respostaIA) {
        console.log(`🤖 IA respondendo: "${respostaIA}"`);
        
        
        setTimeout(async () => {
          await socket.sendMessage(from, { text: respostaIA });
        }, Math.random() * 2000 + 500); 
      }
    }
  } catch (error) {
    console.error('❌ Erro ao processar mensagem com IA:', error);
  }
}

exports.load = (socket, options = {}) => {
  global.BASE_DIR = path.resolve(__dirname);

  
  if (options.genosIA) {
    genosIA = options.genosIA;
    console.log("🤖 Genos IA integrada ao loader!");
  } else {
    
    console.log("🤖 Inicializando Genos IA no loader...");
    genosIA = new GenosIA();
    console.log("✅ Genos IA inicializada com sucesso!");
  }

  
  global.genosIA = genosIA;
  console.log("🌐 Genos IA definida como global!");

  
  socket.ev.on("messages.upsert", async ({ messages }) => {
    setTimeout(async () => {
      
      await processarMensagemIA(socket, messages);
      
      
      onMessagesUpsert({ socket, messages, genosIA }); 
    }, TIMEOUT_IN_MILLISECONDS_BY_EVENT);
  });

  socket.ev.on("group-participants.update", async (data) => {
    // 🚫 VERIFICAR SE O GRUPO ESTÁ BLOQUEADO
    if (isGroupBlocked(data.id)) {
      console.log(`⛔ Grupo ${data.id} está bloqueado. Ignorando atualização de participantes.`);
      return;
    }

    setTimeout(() => {
      try {
        onGroupParticipantsUpdate({ socket, groupParticipantsUpdate: data });
      } catch (error) {
        console.error(error);
      }
    }, TIMEOUT_IN_MILLISECONDS_BY_EVENT);
  });

  
  return { genosIA };
};