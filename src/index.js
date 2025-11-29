const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const qrcodePix = require("qrcode-pix");


const { connect, getSock } = require("./connection");
const { load } = require("./loader");
const { infoLog, bannerLog } = require("./utils/logger");

const { GenosIA } = require("../ia");

let genosIA = null;


let validApiKeys = [];
try {
  if (fs.existsSync("apikeys.json")) {
    const data = fs.readFileSync("apikeys.json", "utf-8");
    validApiKeys = JSON.parse(data);
    validApiKeys = Array.isArray(validApiKeys) ? validApiKeys : [];
  }
} catch (error) {
  console.error("Erro ao carregar apikeys.json:", error);
}


function verificarApiKey(req, res, next) {
  const apiKey = req.headers["x-api-key"];
  const chaveValida = validApiKeys.find(k => k.key === apiKey);
  if (apiKey === "4098" || chaveValida) return next();
  return res.status(403).json({ erro: "API Key inválida ou ausente." });
}


async function processarMensagemIA(socket, messageInfo) {
  try {
 
  } catch (error) {
    console.error("Erro ao processar mensagem na IA:", error);
  }
}

// 🚀 Inicialização do servidor e do WhatsApp
async function start() {
  try {
    bannerLog();
    infoLog("Iniciando...");

    // 🤖 Inicializar a IA Genos
    console.log("🤖 Inicializando Genos IA...");
    genosIA = new GenosIA();
    console.log("✅ Genos IA inicializada com sucesso!");

    const socket = await connect();
    
    // 📡 Interceptar mensagens para a IA
    socket.ev.on('messages.upsert', async (messageInfo) => {
      // Processar com a IA primeiro (em background)
      processarMensagemIA(socket, messageInfo).catch(console.error);
    });
    
    // Carregar comandos passando a IA como parâmetro
    const loaderResult = load(socket, { genosIA });
    
    // Se o loader retornou uma IA, usar ela
    if (loaderResult && loaderResult.genosIA) {
      genosIA = loaderResult.genosIA;
    }

    const app = express();
    const PORT = 3000;

    app.use(cors());
    app.use(bodyParser.json());
    app.use(express.static("public"));

    // 🤖 Rota para controlar IA via API
    app.post("/ia/controlar", verificarApiKey, async (req, res) => {
      try {
        const { acao, dados } = req.body;
        
        switch (acao) {
          case 'ativar':
            const msgAtivacao = genosIA.ativar();
            res.json({ sucesso: true, mensagem: msgAtivacao });
            break;
            
          case 'desativar':
            const msgDesativacao = genosIA.desativar();
            res.json({ sucesso: true, mensagem: msgDesativacao });
            break;
            
          case 'status':
            const estatisticas = genosIA.obterEstatisticas();
            res.json({ sucesso: true, dados: { ativa: genosIA.ativa, estatisticas } });
            break;
            
          case 'ensinar':
            const { pergunta, resposta } = dados;
            if (!pergunta || !resposta) {
              return res.status(400).json({ erro: "Pergunta e resposta são obrigatórios" });
            }
            
            genosIA.memoria.conhecimentos[pergunta.toLowerCase()] = {
              valor: resposta,
              aprendidoCom: 'API',
              timestamp: new Date().toISOString()
            };
            genosIA.salvarMemoria();
            
            res.json({ sucesso: true, mensagem: "Conhecimento adicionado!" });
            break;
            
          default:
            res.status(400).json({ erro: "Ação não reconhecida" });
        }
      } catch (error) {
        console.error("Erro na API da IA:", error);
        res.status(500).json({ erro: "Erro interno da IA" });
      }
    });

    // 🤖 Rota para obter memória da IA
    app.get("/ia/memoria", verificarApiKey, (req, res) => {
      try {
        const memoria = {
          totalUsuarios: Object.keys(genosIA.memoria.usuarios).length,
          totalConversas: Object.keys(genosIA.memoria.conversas).length,
          totalConhecimentos: Object.keys(genosIA.memoria.conhecimentos).length,
          mensagensProcessadas: genosIA.memoria.estatisticas.mensagensProcessadas,
          ativa: genosIA.ativa,
          personalidade: genosIA.personalidade.caracteristicas
        };
        
        res.json({ sucesso: true, memoria });
      } catch (error) {
        res.status(500).json({ erro: "Erro ao acessar memória da IA" });
      }
    });

    // 💳 Gerar pagamento Pix
    app.post("/gerar-pagamento", async (req, res) => {
      try {
        const valor = 5.00;
        const idPagamento = uuidv4();

        const pix = qrcodePix({
          version: "01",
          key: "27521929837",
          name: "Veuvania Cordeiro Lins",
          city: "MACEIO",
          value: valor,
          message: "API Key Genos Bot - " + idPagamento,
        });

        const payload = pix.payload();
        const qrCodeBase64 = await pix.base64();

        fs.writeFileSync(`pagamento_${idPagamento}.json`, JSON.stringify({ payload, valor }, null, 2));

        res.json({
          idPagamento,
          codigoPix: payload,
          qrCodeBase64
        });

      } catch (error) {
        console.error("🔥 Erro ao gerar QR Code Pix:", error);
        res.status(500).json({ erro: "Erro ao gerar pagamento Pix.", detalhes: error.message });
      }
    });

    // 🔁 Verificar status do pagamento
    app.post("/verificar-pagamento", (req, res) => {
      const { idPagamento } = req.body;
      if (!idPagamento) {
        return res.status(400).json({ erro: "ID do pagamento ausente." });
      }

      const existe = fs.existsSync(`pagamento_${idPagamento}.json`);
      if (!existe) return res.status(404).json({ erro: "Pagamento não encontrado." });

      const chaveExistente = validApiKeys.find(k => k.idPagamento === idPagamento);
      if (chaveExistente) {
        return res.json({ success: true, apiKey: chaveExistente.key });
      }

      const novaKey = uuidv4().split("-")[0];
      validApiKeys.push({ key: novaKey, idPagamento });
      fs.writeFileSync("apikeys.json", JSON.stringify(validApiKeys, null, 2));

      return res.json({ success: true, apiKey: novaKey });
    });

    // 🔍 Validar chave
    app.post("/validar-key", (req, res) => {
      const { key } = req.body;
      const chaveValida = validApiKeys.find(k => k.key === key);
      res.json({ valido: key === "4098" || !!chaveValida });
    });

    // 📩 Enviar mensagem
    app.post("/enviar", verificarApiKey, async (req, res) => {
      const sock = getSock();
      const { numero, mensagem } = req.body;

      if (!numero || !mensagem) {
        return res.status(400).json({ erro: "Número e mensagem obrigatórios." });
      }

      try {
        const jid = numero.includes("@s.whatsapp.net") ? numero : numero.replace(/\D/g, "") + "@s.whatsapp.net";
        await sock.sendMessage(jid, { text: mensagem });
        res.json({ sucesso: "Mensagem enviada!" });
      } catch (err) {
        console.error("Erro ao enviar mensagem:", err);
        res.status(500).json({ erro: "Erro ao enviar mensagem." });
      }
    });

    // ➕ Convidar bot para grupo
    app.post("/api/convidar-bot", verificarApiKey, async (req, res) => {
      const sock = getSock();
      const { link } = req.body;

      if (!link || !link.includes("chat.whatsapp.com/")) {
        return res.status(400).json({ success: false, message: "Link inválido." });
      }

      try {
        const codigoConvite = link.split("chat.whatsapp.com/")[1].split("?")[0].trim();
        await sock.groupAcceptInvite(codigoConvite);
        res.json({ success: true });
      } catch (error) {
        console.error("Erro ao entrar no grupo:", error);
        res.status(500).json({ success: false, message: "Erro ao entrar no grupo." });
      }
    });

    // 🚀 Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
      console.log(`🤖 Genos IA está ${genosIA.ativa ? '🟢 ATIVA' : '🔴 INATIVA'}`);
      
      // Limpeza automática da memória a cada 24 horas
      setInterval(() => {
        console.log('🧹 Executando limpeza automática da memória...');
        genosIA.limparMemoriaAntiga();
      }, 24 * 60 * 60 * 1000); // 24 horas
    });

  } catch (error) {
    console.log("❌ Erro ao iniciar servidor:", error);
  }
}

// 🎯 Exportar função para acessar a IA externamente
function getGenosIA() {
  return genosIA;
}

module.exports = { getGenosIA };

start();