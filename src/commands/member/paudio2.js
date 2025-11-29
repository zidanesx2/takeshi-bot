const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const { PREFIX, ASSETS_DIR, BOT_NAME } = require(`${BASE_DIR}/config`);
const { menuMessage } = require(`${BASE_DIR}/utils/chamadoimage`);
const https = require("https");

function formatUploadDate(uploadDate) {
  if (!uploadDate || uploadDate.length !== 8) return "Data desconhecida";
  return `${uploadDate.substring(6, 8)}/${uploadDate.substring(4, 6)}/${uploadDate.substring(0, 4)}`;
}

function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  }
  return `${minutes}m ${remainingSeconds}s`;
}

function formatNumber(num) {
  return num ? num.toLocaleString("pt-BR") : "0";
}

function createAudioVisualizer() {
  const bars = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
  const visualizer = Array.from({ length: 12 }, () => 
    bars[Math.floor(Math.random() * bars.length)]
  ).join('');
  return `🎵 ${visualizer} 🎵`;
}

function loadingBar(progress) {
  const totalLength = 15;
  const completedLength = Math.floor(progress * totalLength);
  const remainingLength = totalLength - completedLength;
  
  const loadedChar = '█';
  const emptyChar = '░';
  const bar = loadedChar.repeat(completedLength) + emptyChar.repeat(remainingLength);
  const percentage = Math.floor(progress * 100);
  
  const loadingEmojis = ['🎵', '🎶', '🎼', '🎤'];
  const currentEmoji = loadingEmojis[Math.floor(progress * loadingEmojis.length)];
  
  if (percentage < 100) {
    return `${currentEmoji} *Processando sua música...*\n\n` +
           `╭─────────────────╮\n` +
           `│ [${bar}] │\n` +
           `╰─────────────────╯\n` +
           `📊 *${percentage}%* concluído\n\n` +
           `⏳ *Aguarde, estamos preparando tudo para você...*`;
  } else {
    return `✅ *Download concluído!*\n\n` +
           `🎶 *Sua música está sendo enviada...*\n` +
           `${createAudioVisualizer()}\n\n` +
           `💫 *Aproveite a música!*`;
  }
}

module.exports = {
  name: "play",
  description: "🎵 Baixa e envia músicas do YouTube com interface melhorada",
  commands: ["play", "p", "tocar", "ouvir", "audio", "musica"],
  usage: `${PREFIX}play MC Hariel`,
  handle: async ({
    sendImageFromFile,
    sendAudioFromFile,
    sendWaitReact,
    sendSuccessReact,
    sendErrorReply,
    sendReply,
    args,
    socket,
  }) => {
    if (!args.length) {
      const errorMsg = `🚫 *Ops! Você esqueceu de me dizer qual música buscar*\n\n` +
                      `💡 *Como usar:*\n` +
                      `• ${PREFIX}play Marília Mendonça\n` +
                      `• ${PREFIX}play Henrique e Juliano\n` +
                      `• ${PREFIX}p Gusttavo Lima\n\n` +
                      `🎵 *Digite o nome do artista ou música que deseja ouvir!*`;
      
      return sendErrorReply(errorMsg);
    }

    await sendWaitReact();

    try {
      const query = args.join(" ");
      console.log(`🔍 Buscando música: ${query}`);

      let progress = 0.0;
      let loadingMessage = await sendReply(loadingBar(progress));

      // Animação de loading mais suave
      let interval = setInterval(async () => {
        progress += 0.15;
        if (progress > 1) progress = 1;

        await socket.sendMessage(loadingMessage.key.remoteJid, {
          text: loadingBar(progress),
          edit: loadingMessage.key,
        });

        if (progress >= 1) {
          clearInterval(interval);
          console.log("✅ Carregamento completo!");
        }
      }, 800);

      const ytDlpCommand = `yt-dlp -j --default-search "ytsearch" "${query}"`;
      exec(ytDlpCommand, async (error, stdout, stderr) => {
        clearInterval(interval); // Para o loading se houver erro
        
        if (error) {
          console.error("❌ Erro ao buscar informações da música:", error);
          return sendErrorReply(
            `🚫 *Não consegui encontrar essa música!*\n\n` +
            `💡 *Dicas:*\n` +
            `• Verifique se o nome está correto\n` +
            `• Tente buscar pelo nome do artista\n` +
            `• Use palavras-chave mais específicas\n\n` +
            `🔄 *Tente novamente com outro termo de busca*`
          );
        }

        const videoInfo = JSON.parse(stdout);
        const { title, uploader, view_count, duration, thumbnail, webpage_url, like_count, upload_date } = videoInfo;

        console.log("✅ Música encontrada:", title);

        const downloadsDir = path.join(__dirname, "downloads");
        if (!fs.existsSync(downloadsDir)) {
          fs.mkdirSync(downloadsDir, { recursive: true });
        }

        const safeTitle = title.replace(/[/\\:*?"<>|]/g, "");
        const imagePath = path.join(downloadsDir, `${safeTitle}-thumbnail.jpg`);
        const file = fs.createWriteStream(imagePath);
        
        https.get(thumbnail, (response) => {
          response.pipe(file);
          file.on("finish", async () => {
            console.log("✅ Thumbnail baixada!");

            // Caption melhorada com design mais bonito
            const audioVisualizer = createAudioVisualizer();
            const sendOptions = {
              caption: 
                `${audioVisualizer}\n\n` +
                `🎵 *MÚSICA ENCONTRADA* 🎵\n\n` +
                `╭─────────────────────────╮\n` +
                `│  🎶 *${title}*\n` +
                `╰─────────────────────────╯\n\n` +
                `👤 *Artista:* ${uploader}\n` +
                `⏱️ *Duração:* ${formatDuration(duration)}\n` +
                `👁️ *Visualizações:* ${formatNumber(view_count)}\n` +
                `❤️ *Likes:* ${formatNumber(like_count)}\n` +
                `📅 *Publicado em:* ${formatUploadDate(upload_date)}\n\n` +
                `🔗 *Link original:* ${webpage_url}\n\n` +
                `┌─────────────────────────┐\n` +
                `│ 🎧 *PREPARANDO ÁUDIO...* │\n` +
                `└─────────────────────────┘\n\n` +
                `💫 *O áudio será enviado em seguida!*\n` +
                `🤖 *Powered by ${BOT_NAME}*`,
              quotedMessageId: undefined,
              mentions: [],
            };

            console.log("📸 Enviando imagem com informações da música...");
            await sendImageFromFile(imagePath, sendOptions.caption);

            // Remove a imagem após enviar
            fs.unlinkSync(imagePath);

            // Download do áudio
            const outputPath = path.join(downloadsDir, `${safeTitle}.mp3`);
            const ytDlpAudioCommand = `yt-dlp --extract-audio --audio-format mp3 --default-search "ytsearch" -o "${outputPath}" "${query}"`;

            console.log("🎵 Iniciando download do áudio...");
            
            exec(ytDlpAudioCommand, async (error, stdout, stderr) => {
              if (error) {
                console.error("❌ Erro ao baixar áudio:", error);
                return sendErrorReply(
                  `🚫 *Erro ao baixar a música!*\n\n` +
                  `😔 *Desculpe, não consegui processar este áudio*\n` +
                  `🔄 *Tente novamente ou escolha outra música*`
                );
              }

              console.log("✅ Música baixada com sucesso!");

              try {
                // Envia o áudio direto sem mensagens extras
                await sendAudioFromFile(outputPath);
                fs.unlinkSync(outputPath);
                sendSuccessReact();
                
              } catch (err) {
                console.error("❌ Erro ao enviar música:", err);
                sendErrorReply(
                  `🚫 *Erro ao enviar a música!*\n\n` +
                  `😅 *O arquivo foi processado, mas houve um problema no envio*\n` +
                  `🔄 *Tente novamente em alguns instantes*`
                );
              }
            });
          });
        }).on('error', (err) => {
          console.error("❌ Erro ao baixar thumbnail:", err);
          sendErrorReply(
            `🚫 *Erro ao processar a imagem da música*\n\n` +
            `🔄 *Tente novamente*`
          );
        });
      });
    } catch (error) {
      console.error("❌ [ERRO GERAL]", error);
      await sendErrorReply(
        `🚫 *Erro inesperado!*\n\n` +
        `😔 *Algo deu errado ao processar sua solicitação*\n` +
        `🔄 *Tente novamente em alguns minutos*\n\n` +
        `💡 *Se o problema persistir, contate o administrador*`
      );
    }
  },
};