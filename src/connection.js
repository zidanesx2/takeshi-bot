const path = require("path");
const fs = require("fs");
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

// 📁 Caminho do arquivo de código de autenticação
const AUTH_CODE_FILE = path.resolve(__dirname, "..", "auth-code.json");

/**
 * Salvar código de autenticação
 */
function saveAuthCode(authCode) {
  try {
    fs.writeFileSync(AUTH_CODE_FILE, JSON.stringify({ authCode, savedAt: new Date().toISOString() }, null, 2));
    console.log("\n");
    successLog("✅ Código de autenticação salvo!");
    console.log(`📄 Arquivo: ${AUTH_CODE_FILE}`);
    console.log("💾 Você pode usar este código para conectar rapidamente no futuro!\n");
  } catch (error) {
    errorLog("Erro ao salvar código de autenticação:", error);
  }
}

/**
 * Carregar código de autenticação salvo
 */
function loadAuthCode() {
  try {
    if (fs.existsSync(AUTH_CODE_FILE)) {
      const data = fs.readFileSync(AUTH_CODE_FILE, "utf-8");
      const { authCode } = JSON.parse(data);
      console.log("\n");
      infoLog("📌 Código de autenticação encontrado!");
      console.log(`🔑 Seu código: ${authCode}\n`);
      return authCode;
    }
  } catch (error) {
    errorLog("Erro ao carregar código de autenticação:", error);
  }
  return null;
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

  socket.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    // 📱 Mostrar QR Code no terminal
    if (qr) {
      const QRCode = require("qrcode-terminal");
      console.log("\n");
      infoLog("📱 QR Code gerado! Escaneie com seu WhatsApp");
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
      
      // 💾 Salvar código de autenticação após conexão bem-sucedida
      if (socket.user?.id) {
        const authCode = Buffer.from(socket.user.id).toString("base64");
        saveAuthCode(authCode);
      }
      
      // 📌 Mostrar código salvo
      loadAuthCode();
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
  saveAuthCode,
  loadAuthCode,
};