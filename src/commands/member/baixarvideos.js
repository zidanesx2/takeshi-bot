const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "video",
  description: "Baixa vídeos do YouTube usando yt-dlp",
  commands: ["video", "ytvideo", "baixarvideo"],
  usage: `${PREFIX}video <nome_do_video>`,

  handle: async ({
    sendSuccessReact,
    sendWaitReact,
    sendReact,
    sendVideoFromFile,
    sendErrorReply,
    sendReply,
    args,
  }) => {
    if (!args.length) {
      return sendErrorReply(
        "Você precisa me enviar o nome do vídeo! Exemplo: /video DJ Alok"
      );
    }

    await sendWaitReact();
    await sendReply("🔍 Buscando o vídeo, aguarde...");

    try {
      const query = args.join(" ");
      console.log(`🔍 Buscando vídeo: ${query}`);

      const downloadsDir = path.join(__dirname, "downloads");
      if (!fs.existsSync(downloadsDir)) {
        fs.mkdirSync(downloadsDir, { recursive: true });
      }

      const timestamp = Date.now();
      const outputPath = path.join(downloadsDir, `video-${timestamp}.mp4`);

      // CORREÇÃO: Usar formato que já vem mesclado ou forçar merge com ffmpeg
      // Opção 1: Baixar formato já mesclado (mais rápido, mas pode ter qualidade menor)
      const ytDlpCommand = `yt-dlp -f "best[ext=mp4]/bestvideo[ext=mp4]+bestaudio[ext=m4a]/best" --merge-output-format mp4 --audio-format m4a -o "${outputPath}" "ytsearch:${query}"`;
      
      // Opção 2 (MELHOR): Forçar merge com ffmpeg
      // const ytDlpCommand = `yt-dlp -f "bestvideo[ext=mp4][height<=720]+bestaudio[ext=m4a]/best[ext=mp4]/best" --merge-output-format mp4 --remux-video mp4 -o "${outputPath}" "ytsearch:${query}"`;
      
      console.log("⏬ Comando yt-dlp:", ytDlpCommand);

      exec(ytDlpCommand, { maxBuffer: 1024 * 1024 * 50 }, async (error, stdout, stderr) => {
        if (error) {
          console.error("❌ Erro ao buscar ou baixar o vídeo:", error);
          console.error("STDERR:", stderr);
          return sendErrorReply("Ocorreu um erro ao baixar o vídeo. Tente novamente com outro nome.");
        }

        if (!fs.existsSync(outputPath)) {
          console.error("❌ Arquivo não foi criado:", outputPath);
          return sendErrorReply("Erro: O vídeo não foi baixado corretamente.");
        }

        const stats = fs.statSync(outputPath);
        console.log(`✅ Vídeo baixado com sucesso: ${outputPath} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);

        // Verificar tamanho do arquivo (WhatsApp tem limite de ~16MB)
        if (stats.size > 16 * 1024 * 1024) {
          console.warn("⚠️ Vídeo muito grande, pode falhar no envio!");
          await sendReply("⚠️ O vídeo é muito grande. Comprimindo...");
          
          // Comprimir vídeo com ffmpeg
          const compressedPath = path.join(downloadsDir, `compressed-${timestamp}.mp4`);
          const compressCommand = `ffmpeg -i "${outputPath}" -vcodec libx264 -crf 28 -preset fast -acodec aac -b:a 128k "${compressedPath}"`;
          
          exec(compressCommand, async (compressError) => {
            if (compressError) {
              console.error("❌ Erro ao comprimir:", compressError);
              return sendErrorReply("Vídeo muito grande e não pôde ser comprimido.");
            }
            
            try {
              await sendVideoFromFile(compressedPath, "Aqui está o vídeo que você pediu! (comprimido)");
              await sendSuccessReact();
            } catch (err) {
              console.error("❌ Erro ao enviar vídeo:", err);
              await sendErrorReply("Erro ao enviar o vídeo.");
            } finally {
              // Deletar ambos os arquivos
              [outputPath, compressedPath].forEach(file => {
                if (fs.existsSync(file)) {
                  try {
                    fs.unlinkSync(file);
                    console.log(`✅ Arquivo removido: ${file}`);
                  } catch (deleteError) {
                    console.error("⚠️ Erro ao deletar:", deleteError);
                  }
                }
              });
            }
          });
        } else {
          try {
            await sendVideoFromFile(outputPath, "Aqui está o vídeo que você pediu!");
            await sendSuccessReact();
          } catch (err) {
            console.error("❌ Erro ao enviar vídeo:", err);
            await sendErrorReply("Erro ao enviar o vídeo.");
          } finally {
            if (fs.existsSync(outputPath)) {
              try {
                fs.unlinkSync(outputPath);
                console.log("✅ Arquivo de vídeo removido do servidor.");
              } catch (deleteError) {
                console.error("⚠️ Erro ao tentar deletar o arquivo:", deleteError);
              }
            }
          }
        }
      });
    } catch (err) {
      console.error("[ERRO GERAL]", err);
      await sendErrorReply("Erro inesperado ao processar o vídeo.");
    }
  },
};