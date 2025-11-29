const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const { connect, getSock } = require("./src/connection");

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Inicializa o bot e conecta ao WhatsApp
connect()
  .then(() => {
    console.log("Bot conectado com sucesso!");
  })
  .catch((err) => {
    console.error("Erro ao conectar o bot:", err);
  });

// Rota de teste
app.get("/", (req, res) => {
  res.send("Servidor rodando! API do bot está ativa.");
});

// Rota para envio de mensagens manuais
app.post("/enviar", async (req, res) => {
  const sock = getSock();

  if (!sock) {
    return res.status(500).json({ erro: "Bot não está conectado." });
  }

  const { numero, mensagem } = req.body;

  if (!numero || !mensagem) {
    return res.status(400).json({ erro: "Número e mensagem são obrigatórios!" });
  }

  try {
    const jid = numero.includes("@s.whatsapp.net")
      ? numero
      : numero.replace(/\D/g, "") + "@s.whatsapp.net";

    await sock.sendMessage(jid, { text: mensagem });
    return res.status(200).json({ sucesso: "Mensagem enviada com sucesso!" });
  } catch (err) {
    console.error("Erro ao enviar mensagem:", err);
    return res.status(500).json({ erro: "Falha ao enviar mensagem." });
  }
});

// ✅ Rota para adicionar bot ao grupo via link
app.post("/api/convidar-bot", async (req, res) => {
  const sock = getSock();

  if (!sock) {
    return res.status(500).json({ success: false, message: "Bot não está conectado." });
  }

  const { link } = req.body;

  if (!link || !link.includes("chat.whatsapp.com/")) {
    return res.status(400).json({ success: false, message: "Link inválido." });
  }

  try {
    // Extrair o código de convite do link
    const codigoConvite = link.split("chat.whatsapp.com/")[1].split("?")[0].trim();

    await sock.groupAcceptInvite(codigoConvite);

    return res.status(200).json({ success: true, message: "Bot entrou no grupo com sucesso!" });
  } catch (error) {
    console.error("Erro ao entrar no grupo:", error);
    return res.status(500).json({ success: false, message: "Erro ao entrar no grupo." });
  }
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
