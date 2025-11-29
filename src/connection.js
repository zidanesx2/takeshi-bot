const path = require("path");
const fs = require("fs");
const readline = require("readline");
const {
  default: makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  isJidBroadcast,
  isJidStatusBroadcast,
  proto,
  isJidNewsletter,
  Browsers,
} = require("@whiskeysockets/baileys");
const NodeCache = require("node-cache");
const pino = require("pino");
const { load } = require("./loader");
const {
  warningLog,
  infoLog,
  errorLog,
  sayLog,
  successLog,
} = require("./utils/logger");

const msgRetryCounterCache = new NodeCache();

let sock = null;

/**
 * Função para fazer pergunta no terminal
 */
function question(prompt) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

/**
 * Extrair apenas números de uma string
 */
function onlyNumbers(str) {
  return str.replace(/\D/g, "");
}

async function getMessage(key) {
  return proto.Message.fromObject({});
}

async function connect() {
  const { state, saveCreds } = await useMultiFileAuthState(
    path.resolve(__dirname, "..", "assets", "auth", "baileys")
  );

  const { version } = await fetchLatestBaileysVersion();

  const socket = makeWASocket({
    version,
    logger: pino({ level: "silent" }),
    browser: Browsers.ubuntu("MeuBot"),
    auth: state,
    shouldIgnoreJid: (jid) =>
      isJidBroadcast(jid) || isJidStatusBroadcast(jid) || isJidNewsletter(jid),
    keepAliveIntervalMs: 60 * 1000,
    markOnlineOnConnect: false,
    msgRetryCounterCache,
    shouldSyncHistoryMessage: () => false,
    getMessage,
  });

  sock = socket;

  // 🔑 Verificar se precisa de código de pareamento
  if (!socket.authState.creds.registered) {
    warningLog("Credenciais ainda não configuradas!");

    console.log("\n");
    infoLog('Informe o número de telefone do bot (exemplo: "5511920202020"):');

    const phoneNumber = await question("📱 Número de telefone: ");

    if (!phoneNumber) {
      errorLog("Número de telefone inválido! Tente novamente com npm start.");
      process.exit(1);
    }

    try {
      console.log("\n");
      infoLog("Gerando código de pareamento...");
      
      const code = await socket.requestPairingCode(onlyNumbers(phoneNumber));

      console.log("\n");
      console.log("╔════════════════════════════════════════════════════════════╗");
      console.log("║           🔌 ESCOLHA A FORMA DE CONEXÃO 🔌                ║");
      console.log("╠════════════════════════════════════════════════════════════╣");
      console.log("║                                                            ║");
      console.log("║  OPÇÃO 1️⃣  - CÓDIGO DE PAREAMENTO                         ║");
      console.log("║  Use este código para conectar:                           ║");
      console.log("║                                                            ║");
      console.log(`║  🔑 CÓDIGO: ${code}                                          ║`);
      console.log("║                                                            ║");
      console.log("║  Passos:                                                   ║");
      console.log("║  1. Abra o WhatsApp                                        ║");
      console.log("║  2. Vá em Configurações > Dispositivos Vinculados         ║");
      console.log("║  3. Clique em Vincular um Dispositivo                     ║");
      console.log("║  4. Digite o código acima                                 ║");
      console.log("║                                                            ║");
      console.log("║  OPÇÃO 2️⃣  - QR CODE                                      ║");
      console.log("║  Se preferir, também pode escanear o QR Code              ║");
      console.log("║                                                            ║");
      console.log("╚════════════════════════════════════════════════════════════╝");
      console.log("\n");

      successLog(`Código de pareamento gerado: ${code}`);
    } catch (error) {
      errorLog("Erro ao gerar código de pareamento:", error.message);
      process.exit(1);
    }
  }

  socket.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    // 📱 Mostrar QR Code se disponível
    if (qr) {
      const QRCode = require("qrcode-terminal");
      console.log("\n");
      infoLog("📱 QR Code gerado! Escaneie com seu WhatsApp:");
      QRCode.generate(qr, { small: true });
      console.log("\n");
    }

    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;

      if (statusCode === DisconnectReason.loggedOut) {
        errorLog("Bot desconectado!");
      } else if (statusCode === 401) {
        errorLog("DISPOSITIVO REMOVIDO! Delete a pasta auth/baileys e reconecte!");
        process.exit(1);
      } else {
        switch (statusCode) {
          case DisconnectReason.badSession:
            warningLog("Sessão inválida!");
            break;
          case DisconnectReason.connectionClosed:
            warningLog("Conexão fechada!");
            break;
          case DisconnectReason.connectionLost:
            warningLog("Conexão perdida!");
            break;
          case DisconnectReason.connectionReplaced:
            warningLog("Conexão substituída!");
            break;
          case DisconnectReason.multideviceMismatch:
            warningLog("Dispositivo incompatível!");
            break;
          case DisconnectReason.forbidden:
            warningLog("Conexão proibida!");
            break;
          case DisconnectReason.restartRequired:
            infoLog('Me reinicie por favor! Digite "npm start".');
            break;
          case DisconnectReason.unavailableService:
            warningLog("Serviço indisponível!");
            break;
          default:
            warningLog("Desconectado por motivo desconhecido.");
            break;
        }

        const newSocket = await connect();
        load(newSocket);
      }
    } else if (connection === "open") {
      successLog("Fui conectado com sucesso!");
    } else {
      infoLog("Atualizando conexão...");
    }
  });

  socket.ev.on("creds.update", saveCreds);

  return socket;
}

module.exports = {
  connect,
  getSock: () => sock,
};