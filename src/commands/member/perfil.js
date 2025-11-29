const axios = require('axios');
const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');
const { PREFIX, BOT_NAME } = require(`${BASE_DIR}/config`);
const path = require('path');

const COIN_PATH = path.resolve('db', 'coins.json');
const DEFAULT_IMG_PATH = path.resolve('assets', 'images', 'user.png');

module.exports = {
  name: "perfil",
  description: "Mostra o perfil do usuário",
  commands: ["perfil"],
  usage: `${PREFIX}perfil`,
  handle: async ({ sendSuccessReact, sendWaitReact, socket, userJid, remoteJid, webMessageInfo, sendReply }) => {
    await sendWaitReact();

    const numero = userJid.split('@')[0];
    let nome;
    let bio = ".";

    // === Obter foto de perfil ===
    let ppUrl;
    try {
      ppUrl = await socket.profilePictureUrl(userJid, 'image');
      console.log(`✅ [perfil] Foto de perfil encontrada: ${ppUrl}`);
    } catch (err) {
      ppUrl = null;
      console.warn("⚠️ [perfil] Sem foto de perfil ou erro ao buscar URL:", err.message);
    }

    try {
      const contact = await socket.getContact(userJid);
      nome = contact.pushName || "PERFIL";
      bio = contact.status || "Sem bio";
    } catch {
      nome = webMessageInfo?.pushName || "PERFIL";
      bio = "Sem bio";
    }

    // === Carrega imagem do perfil ou imagem padrão ===
    let foto;
    try {
      if (ppUrl) {
        const { data: fotoBuffer } = await axios.get(ppUrl, { responseType: 'arraybuffer' });
        foto = await loadImage(fotoBuffer);
        console.log("✅ [perfil] Foto de perfil carregada com sucesso.");
      } else {
        throw new Error("Sem foto de perfil");
      }
    } catch (err) {
      console.warn("⚠️ [perfil] Erro ao carregar foto de perfil, tentando imagem padrão:", err.message);
      try {
        console.log("🔍 [perfil] Usando imagem padrão:", DEFAULT_IMG_PATH);
        if (!fs.existsSync(DEFAULT_IMG_PATH)) {
          console.error("❌ [perfil] user.png não encontrado:", DEFAULT_IMG_PATH);
          return await sendReply("❌ ERRO: A imagem padrão user.png não foi encontrada.");
        }
        foto = await loadImage(DEFAULT_IMG_PATH);
        console.log("✅ [perfil] Imagem padrão carregada com sucesso.");
      } catch (e) {
        console.error("❌ [perfil] Erro ao carregar imagem padrão:", e.message);
        return await sendReply("❌ ERRO: Não foi possível carregar a imagem padrão.");
      }
    }

    // === Carrega moedas ===
    let coins = 0;
    try {
      if (fs.existsSync(COIN_PATH)) {
        const coinData = JSON.parse(fs.readFileSync(COIN_PATH));
        console.log("✅ [perfil] coinData carregado:", coinData);
        coins = coinData[userJid] || 0;
        console.log(`🪙 [perfil] Coins para ${userJid}: ${coins}`);
      } else {
        console.warn("⚠️ [perfil] coins.json não existe ainda.");
      }
    } catch (err) {
      console.error("❌ [perfil] Erro ao ler coins.json:", err.message);
      coins = 0;
    }

    const mensagensEnviadas = 0;
    const comandosUsados = 0;

    // === Canvas ===
    const canvas = createCanvas(750, 420);
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#6a11cb');
    gradient.addColorStop(1, '#2575fc');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.1)';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.moveTo(40, 30);
    ctx.arcTo(710, 30, 710, 380, 20);
    ctx.arcTo(710, 380, 40, 380, 20);
    ctx.arcTo(40, 380, 40, 30, 20);
    ctx.arcTo(40, 30, 710, 30, 20);
    ctx.fill();
    ctx.shadowColor = 'transparent';

    ctx.fillStyle = '#800080';
    ctx.fillRect(40, 30, 10, 350);

    ctx.fillStyle = '#000000';
    ctx.font = 'bold 28px "Arial", sans-serif';
    ctx.shadowColor = 'rgb(0, 0, 0)';
    ctx.shadowBlur = 5;
    ctx.fillText('📋 PAINEL DO PERFIL', 60, 65);
    ctx.shadowColor = 'transparent';

    ctx.save();
    ctx.beginPath();
    ctx.arc(130, 170, 60, 0, Math.PI * 2);
    ctx.closePath();
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = 10;
    ctx.clip();
    ctx.drawImage(foto, 70, 110, 120, 120);
    ctx.restore();

    ctx.fillStyle = '#000000';
    ctx.font = 'bold 24px "Arial", sans-serif';
    ctx.fillText(nome, 220, 130);

    ctx.fillStyle = '#000000';
    ctx.font = '18px sans-serif';
    ctx.fillText(`📱 Número: ${numero}`, 220, 170);
    ctx.fillText(`📖 Bio: ${bio}`, 220, 200);
    ctx.fillText(`💰 Saldo: ${coins} moedas`, 220, 230);

    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(220, 250);
    ctx.lineTo(640, 250);
    ctx.stroke();

    ctx.fillStyle = '#000000';
    ctx.font = 'bold 20px "Arial", sans-serif';
    ctx.fillText(`📊 Estatísticas`, 220, 280);

    ctx.fillStyle = '#000000';
    ctx.font = '18px sans-serif';
    ctx.fillText(`📝 Mensagens: ${mensagensEnviadas}`, 220, 310);
    ctx.fillText(`🖥️ Comandos: ${comandosUsados}`, 220, 335);

    ctx.font = 'italic 14px "Arial", sans-serif';
    ctx.fillStyle = '#888';
    ctx.fillText(`🔧 Gerado por ${BOT_NAME || 'GENOS V1.5'} • ${new Date().toLocaleDateString('pt-BR')}`, 420, 370);

    const buffer = canvas.toBuffer();

    await sendSuccessReact();

    await socket.sendMessage(remoteJid, {
      image: buffer,
      caption: '📌 *AQUI ESTÁ SEU PERFIL!*',
      quoted: webMessageInfo
    });
  }
};
