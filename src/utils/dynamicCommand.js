/**
 * Direcionador
 * de comandos.
 *
 * @author Dev Gui
 * 🔧 Modificado para verificar números específicos em comandos owner
 */
const { DangerError } = require("../errors/DangerError");
const { InvalidParameterError } = require("../errors/InvalidParameterError");
const { WarningError } = require("../errors/WarningError");
const { findCommandImport } = require(".");
const {
  verifyPrefix,
  hasTypeOrCommand,
  isLink,
  isAdmin,
} = require("../middlewares");
const { checkPermission } = require("../middlewares/checkPermission");
const {
  isActiveGroup,
  getAutoResponderResponse,
  isActiveAutoResponderGroup,
  isActiveAntiLinkGroup,
} = require("./database");
const { errorLog } = require("../utils/logger");
const { ONLY_GROUP_ID } = require("../config");
const { hasPermission } = require("../utils/checkPermissions");

// 👑 Números com permissão para comandos owner
// 👑 Números com permissão para comandos owner
const ALLOWED_OWNER_NUMBERS = [
  "558299288351",
  "558299042818",
  "75901282873580",
  "78593875013681",
];

/**
 * Verifica se o usuário tem permissão de número específico
 */
function hasOwnerNumberPermission(userJid) {
  // Extrair apenas os números do userJid
  const userNumber = userJid.replace(/[^\d]/g, "");
  
  console.log("\n");
  console.log("╔════════════════════════════════════╗");
  console.log("║    VERIFICAÇÃO DE PERMISSÃO OWNER  ║");
  console.log("╠════════════════════════════════════╣");
  console.log(`║ userJid completo: ${userJid}`);
  console.log(`║ Número extraído: ${userNumber}`);
  console.log(`║ Números permitidos: ${ALLOWED_OWNER_NUMBERS.join(", ")}`);
  console.log(`║ Tem permissão? ${ALLOWED_OWNER_NUMBERS.includes(userNumber) ? "✅ SIM" : "❌ NÃO"}`);
  console.log("╚════════════════════════════════════╝");
  console.log("\n");
  
  return ALLOWED_OWNER_NUMBERS.includes(userNumber);
}

exports.dynamicCommand = async (paramsHandler) => {
  const {
    commandName,
    prefix,
    sendWarningReply,
    sendErrorReply,
    remoteJid,
    sendReply,
    socket,
    userJid,
    fullMessage,
    webMessage,
  } = paramsHandler;

  if (isActiveAntiLinkGroup(remoteJid) && isLink(fullMessage)) {
    if (!userJid) return;

    if (!(await isAdmin({ remoteJid, userJid, socket }))) {
      await socket.groupParticipantsUpdate(remoteJid, [userJid], "remove");

      await sendReply(
        "Anti-link ativado! Você foi removido por enviar um link!"
      );

      await socket.sendMessage(remoteJid, {
        delete: {
          remoteJid,
          fromMe: false,
          id: webMessage.key.id,
          participant: webMessage.key.participant,
        },
      });

      return;
    }
  }

  const { type, command } = findCommandImport(commandName);

  if (ONLY_GROUP_ID && ONLY_GROUP_ID !== remoteJid) {
    return;
  }

  if (!verifyPrefix(prefix) || !hasTypeOrCommand({ type, command })) {
    if (isActiveAutoResponderGroup(remoteJid)) {
      const response = getAutoResponderResponse(fullMessage);

      if (response) {
        await sendReply(response);
      }
    }

    return;
  }

  // 👑 VERIFICAR SE É COMANDO OWNER E SE TEM PERMISSÃO DE NÚMERO
  if (type === "owner") {
    if (!hasOwnerNumberPermission(userJid)) {
      await sendErrorReply("❌ Você não tem permissão para usar comandos owner! Apenas números autorizados podem usar.");
      return;
    }
    // Se tem permissão de número, pula a verificação de superadmin
  } else {
    // Para outros comandos, verifica permissão normalmente
    if (!(await checkPermission({ type, ...paramsHandler }))) {
      await sendErrorReply("Você não tem permissão para executar este comando!");
      return;
    }
  }

  if (!isActiveGroup(remoteJid) && command.name !== "on") {
    await sendWarningReply(
      "Este grupo está desativado! Peça para o dono do grupo ativar o bot!"
    );

    return;
  }

  try {
    await command.handle({
      ...paramsHandler,
      type,
    });
  } catch (error) {
    if (error instanceof InvalidParameterError) {
      await sendWarningReply(`Parâmetros inválidos! ${error.message}`);
    } else if (error instanceof WarningError) {
      await sendWarningReply(error.message);
    } else if (error instanceof DangerError) {
      await sendErrorReply(error.message);
    } else {
      errorLog("Erro ao executar comando", error);
      await sendErrorReply(
        `Ocorreu um erro ao executar o comando ${command.name}! O desenvolvedor foi notificado!
      
📄 *Detalhes*: ${error.message}`
      );
    }
  }
};