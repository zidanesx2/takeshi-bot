const path = require("path");

// Prefixo dos comandos.
exports.PREFIX = "/";

// Emoji do bot 
exports.BOT_EMOJI = "";

// Nome do bot 
exports.BOT_NAME = "𝐆𝐄𝐍𝐎𝐒 𝐕𝟏.𝟓";

// Número do bot

exports.BOT_NUMBER = "558299345195";

// Número do dono

exports.OWNER_NUMBER = "55999042818";

// Diretório dos comandos
exports.COMMANDS_DIR = path.join(__dirname, "commands");

// Diretório de arquivos de mídia.
exports.ASSETS_DIR = path.resolve(__dirname, "..", "assets");

// Diretório de arquivos temporários.
exports.TEMP_DIR = path.resolve(__dirname, "..", "assets", "temp");

// Timeout em milissegundos por evento
exports.TIMEOUT_IN_MILLISECONDS_BY_EVENT = 100;

// Plataforma de API's
exports.SPIDER_API_BASE_URL = "https://api.spiderx.com.br/api";

// API DO SPIDER
exports.SPIDER_API_TOKEN = "QQSho9vmy8F87ZFPwDY1";

// 📝 GRUPOS PERMITIDOS - Bot só responde em grupos nesta lista
// Use o comando /ativarbot em um grupo para adicioná-lo automaticamente!
exports.ALLOWED_GROUPS = [
  "",
  ""
];
  
// Diretório base do projeto.
exports.BASE_DIR = path.resolve(__dirname);