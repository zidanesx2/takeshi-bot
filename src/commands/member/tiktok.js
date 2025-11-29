const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "tiktok",
  description: "Baixa vídeos do TikTok usando yt-dlp pelo link do vídeo",
  commands: ["tiktok", "tt", "tiktokvideo"],
  usage: `${PREFIX}tiktok <link_do_video>`,

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
        "Você precisa me enviar o link do vídeo do TikTok! Exemplo: /tiktok https://www.tiktok.com/@usuario/video/1234567890"
      );
    }

    const url = args[0];

  
    if (!url.includes("tiktok.com")) {
      return sendErrorReply("O link informado não parece ser do TikTok!");
    }

    await sendWaitReact();
    await sendReply("🔍 Baixando o vídeo do TikTok, aguarde...");

    try {
      console.log(`🔍 Baixando vídeo TikTok: ${url}`);

      const downloadsDir = path.join(__dirname, "downloads");
      if (!fs.existsSync(downloadsDir)) {
        fs.mkdirSync(downloadsDir, { recursive: true });
      }

      const timestamp = Date.now();
      const outputPath = path.join(downloadsDir, `tiktok-${timestamp}.mp4`);

     
      const ytDlpCommand = `yt-dlp --add-header "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)" -f mp4 -o "${outputPath}" "${url}"`;

      console.log("⏬ Comando yt-dlp:", ytDlpCommand);

      exec(ytDlpCommand, async (error, stdout, stderr) => {
        console.log("🔍 STDOUT:", stdout);
        console.log("📝 STDERR:", stderr);

        if (error) {
          console.error("❌ Erro ao buscar ou baixar o vídeo do TikTok:", error);
          return sendErrorReply("Ocorreu um erro ao baixar o vídeo do TikTok. Verifique o link ou tente novamente.");
        }

        if (!fs.existsSync(outputPath)) {
          console.error("❌ O vídeo não foi encontrado ou o download falhou.");
          return sendErrorReply("Não consegui encontrar o vídeo. Ele pode não estar disponível ou o TikTok bloqueou o download.");
        }

        console.log("✅ Vídeo do TikTok baixado com sucesso:", outputPath);

        try {
          await sendVideoFromFile(outputPath, "Aqui está o vídeo do TikTok que você pediu!");
          await sendSuccessReact();
        } catch (err) {
          console.error("❌ Erro ao enviar vídeo:", err);
          await sendErrorReply("Erro ao enviar o vídeo do TikTok.");
        } finally {
        
          if (fs.existsSync(outputPath)) {
            try {
              fs.unlinkSync(outputPath);
              console.log("✅ Arquivo de vídeo do TikTok removido do servidor.");
            } catch (deleteError) {
              console.error("⚠️ Erro ao tentar deletar o arquivo:", deleteError);
            }
          }
        }
      });
    } catch (err) {
      console.error("[ERRO GERAL]", err);
      await sendErrorReply("Erro inesperado ao processar o vídeo do TikTok.");
    }
  },
};
