const { connect } = require("./src/connection");
const { load } = require("./src/loader");
const { infoLog, bannerLog } = require("./src/utils/logger");
const { sendHelloGroup } = require("./src/utils/sendHello");

// 🚫 GRUPOS BLOQUEADOS - Coloque aqui os IDs dos grupos que o bot NÃO deve enviar mensagens
const BLOCKED_GROUPS = [
  "120363424183668001@g.us", // Grupo que não quer mensagens
  "120363424183668002@g.us", // Outro grupo
  "120363405745100337@g.us", // Mais um grupo
];

// ✅ Função para verificar se um grupo está bloqueado
function isGroupBlocked(groupId) {
  return BLOCKED_GROUPS.includes(groupId);
}

// ✅ Função melhorada para enviar mensagem apenas se não estiver bloqueado
async function sendToGroupIfAllowed(socket, groupId) {
  if (isGroupBlocked(groupId)) {
    infoLog(`⛔ Grupo ${groupId} está bloqueado. Mensagem não será enviada.`);
    return false;
  }
  
  await sendHelloGroup(socket, groupId);
  return true;
}

async function start() {
  try {
    bannerLog();
    infoLog("Iniciando meus componentes internos...");

    const socket = await connect();

    load(socket);

    // ✅ Exemplo de uso
    const groupId = "120363424183668005@g.us";
    await sendToGroupIfAllowed(socket, groupId);

  } catch (error) {
    console.log(error);
  }
}

start();