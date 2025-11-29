const { BOT_EMOJI } = require("../config");
const { extractDataFromMessage, baileysIs, download } = require(".");
const { waitMessage } = require("./messages");
const fs = require("fs");
const path = require("path");
const { TEMP_DIR } = require("../config");

exports.loadCommonFunctions = ({ socket, webMessage }) => {
  const {
    args,
    commandName,
    fullArgs,
    fullMessage,
    isReply,
    prefix,
    remoteJid,
    replyJid,
    userJid,
  } = extractDataFromMessage(webMessage);

  if (!remoteJid) {
    return null;
  }

  const isImage = baileysIs(webMessage, "image");
  const isVideo = baileysIs(webMessage, "video");
  const isSticker = baileysIs(webMessage, "sticker");

  // Função para fazer o download de imagens (versão corrigida)
  const downloadImage = async (webMessage, fileName) => {
    try {
      console.log(`📥 Iniciando download de imagem...`);
      
      // Primeiro tentar o método original
      try {
        const originalResult = await download(webMessage, fileName, "image", "png");
        console.log(`🔍 Resultado original: "${originalResult}"`);
        
        // Verificar se retornou algo válido
        if (originalResult && originalResult !== "null" && originalResult !== null && fs.existsSync(originalResult)) {
          console.log(`✅ Método original funcionou: ${originalResult}`);
          return originalResult;
        }
      } catch (originalError) {
        console.log(`⚠️ Método original falhou: ${originalError.message}`);
      }
      
      console.log(`🔄 Tentando download direto com Baileys...`);
      
      // Método direto usando Baileys
      let messageMedia = null;
      
      // Verificar se é resposta a uma mensagem
      if (webMessage.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage) {
        messageMedia = webMessage.message.extendedTextMessage.contextInfo.quotedMessage.imageMessage;
        console.log(`📱 Imagem encontrada em mensagem citada`);
      }
      // Verificar se a mensagem atual tem imagem
      else if (webMessage.message?.imageMessage) {
        messageMedia = webMessage.message.imageMessage;
        console.log(`📱 Imagem encontrada na mensagem atual`);
      }
      
      if (!messageMedia) {
        throw new Error("Nenhuma imagem encontrada na mensagem");
      }
      
      // Download direto usando o socket
      console.log(`🔽 Fazendo download do buffer...`);
      const buffer = await socket.downloadMediaMessage(
        { message: { imageMessage: messageMedia } },
        'buffer'
      );
      
      if (!buffer || buffer.length === 0) {
        throw new Error("Buffer da imagem está vazio");
      }
      
      // Salvar arquivo temporário
      const timestamp = Date.now();
      const outputPath = path.resolve(TEMP_DIR, `${fileName}_${timestamp}.png`);
      
      fs.writeFileSync(outputPath, buffer);
      
      console.log(`✅ Download direto concluído: ${outputPath}`);
      console.log(`📏 Tamanho do arquivo: ${buffer.length} bytes`);
      
      return outputPath;
      
    } catch (error) {
      console.log(`❌ Erro no download da imagem: ${error.message}`);
      return null;
    }
  };

  // Função para fazer o download de vídeos (versão corrigida)
  const downloadVideo = async (webMessage, fileName) => {
    try {
      console.log(`📥 Iniciando download de vídeo...`);
      
      // Primeiro tentar o método original
      try {
        const originalResult = await download(webMessage, fileName, "video", "mp4");
        console.log(`🔍 Resultado original do vídeo: "${originalResult}"`);
        
        // Verificar se retornou algo válido
        if (originalResult && originalResult !== "null" && originalResult !== null && fs.existsSync(originalResult)) {
          console.log(`✅ Método original de vídeo funcionou: ${originalResult}`);
          return originalResult;
        }
      } catch (originalError) {
        console.log(`⚠️ Método original de vídeo falhou: ${originalError.message}`);
      }
      
      console.log(`🔄 Tentando download direto de vídeo com Baileys...`);
      
      // Método direto usando Baileys
      let messageMedia = null;
      
      // Verificar se é resposta a uma mensagem
      if (webMessage.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage) {
        messageMedia = webMessage.message.extendedTextMessage.contextInfo.quotedMessage.videoMessage;
        console.log(`📱 Vídeo encontrado em mensagem citada`);
      }
      // Verificar se a mensagem atual tem vídeo
      else if (webMessage.message?.videoMessage) {
        messageMedia = webMessage.message.videoMessage;
        console.log(`📱 Vídeo encontrado na mensagem atual`);
      }
      
      if (!messageMedia) {
        throw new Error("Nenhum vídeo encontrado na mensagem");
      }
      
      // Download direto usando o socket
      console.log(`🔽 Fazendo download do buffer de vídeo...`);
      const buffer = await socket.downloadMediaMessage(
        { message: { videoMessage: messageMedia } },
        'buffer'
      );
      
      if (!buffer || buffer.length === 0) {
        throw new Error("Buffer do vídeo está vazio");
      }
      
      // Salvar arquivo temporário
      const timestamp = Date.now();
      const outputPath = path.resolve(TEMP_DIR, `${fileName}_${timestamp}.mp4`);
      
      fs.writeFileSync(outputPath, buffer);
      
      console.log(`✅ Download direto de vídeo concluído: ${outputPath}`);
      console.log(`📏 Tamanho do arquivo: ${buffer.length} bytes`);
      
      return outputPath;
      
    } catch (error) {
      console.log(`❌ Erro no download do vídeo: ${error.message}`);
      return null;
    }
  };

  // Função para enviar vídeo a partir de um arquivo
  const sendVideoFromFile = async (file, caption = "") => {
    return await socket.sendMessage(
      remoteJid,
      {
        video: fs.readFileSync(file),
        caption: caption ? `${BOT_EMOJI} ${caption}` : "",
      },
      { quoted: webMessage }
    );
  };

  // Função para fazer o download de stickers
  const downloadSticker = async (webMessage, fileName) => {
    return await download(webMessage, fileName, "sticker", "webp");
  };

  // Função para enviar texto
  const sendText = async (text, mentions) => {
    let optionalParams = {};

    if (mentions?.length) {
      optionalParams = { mentions };
    }

    return await socket.sendMessage(remoteJid, {
      text: `${BOT_EMOJI} ${text}`,
      ...optionalParams,
    });
  };

  // Função para enviar resposta com texto
  const sendReply = async (text) => {
    return await socket.sendMessage(
      remoteJid,
      { text: `${BOT_EMOJI} ${text}` },
      { quoted: webMessage }
    );
  };

  // Função para enviar reações
  const sendReact = async (emoji) => {
    return await socket.sendMessage(remoteJid, {
      react: {
        text: emoji,
        key: webMessage.key,
      },
    });
  };

  // Função para enviar reação de sucesso
  const sendSuccessReact = async () => {
    return await sendReact("✅");
  };

  // Função para enviar reação de espera
  const sendWaitReact = async () => {
    return await sendReact("⏳");
  };

  // Função para enviar reação de alerta
  const sendWarningReact = async () => {
    return await sendReact("⚠️");
  };

  // Função para enviar reação de erro
  const sendErrorReact = async () => {
    return await sendReact("❌");
  };

  // Função de sucesso reply de Mensagem
  const sendSuccessReply = async (text) => {
    await sendSuccessReact();
    return await sendReply(`✅ ${text}`);
  };

  // Função para enviar resposta de espera com texto
  const sendWaitReply = async (text) => {
    await sendWaitReact();
    return await sendReply(`⏳ Aguarde! ${text || waitMessage}`);
  };

  // Função para enviar resposta de alerta
  const sendWarningReply = async (text) => {
    await sendWarningReact();
    return await sendReply(`⚠️ Atenção! ${text}`);
  };

  // Função para enviar resposta de erro
  const sendErrorReply = async (text) => {
    await sendErrorReact();
    return await sendReply(`❌ Erro! ${text}`);
  };

  // Função para enviar stickers a partir de um arquivo (versão corrigida com pack/author)
  const sendStickerFromFile = async (file, options = {}) => {
    try {
      // Se tiver pack e author nas opções, tentar aplicar metadados
      if (options.pack || options.author) {
        console.log(`🏷️ Enviando sticker com metadados: Pack="${options.pack}", Author="${options.author}"`);
      }
      
      return await socket.sendMessage(
        remoteJid,
        {
          sticker: fs.readFileSync(file),
          // Metadados do sticker (pode não funcionar em todas as versões)
          ...(options.pack && { pack: options.pack }),
          ...(options.author && { author: options.author }),
        },
        { quoted: webMessage }
      );
    } catch (error) {
      console.log(`⚠️ Erro ao enviar sticker com metadados: ${error.message}`);
      // Fallback: enviar sem metadados
      return await socket.sendMessage(
        remoteJid,
        {
          sticker: fs.readFileSync(file),
        },
        { quoted: webMessage }
      );
    }
  };

  // Função para enviar stickers a partir de uma URL
  const sendStickerFromURL = async (url) => {
    return await socket.sendMessage(
      remoteJid,
      {
        sticker: { url },
      },
      { url, quoted: webMessage }
    );
  };

  // Função para enviar imagens a partir de um arquivo
  const sendImageFromFile = async (file, caption = "") => {
    return await socket.sendMessage(
      remoteJid,
      {
        image: fs.readFileSync(file),
        caption: caption ? `${BOT_EMOJI} ${caption}` : "",
      },
      { quoted: webMessage }
    );
  };

  // Função para enviar imagens a partir de uma URL
  const sendImageFromURL = async (url, caption = "") => {
    return await socket.sendMessage(
      remoteJid,
      {
        image: { url },
        caption: caption ? `${BOT_EMOJI} ${caption}` : "",
      },
      { url, quoted: webMessage }
    );
  };

  // Função para enviar áudio a partir de uma URL
  const sendAudioFromURL = async (url) => {
    return await socket.sendMessage(
      remoteJid,
      {
        audio: { url },
        mimetype: "audio/mp4",
      },
      { url, quoted: webMessage }
    );
  };

  // Função para enviar vídeo a partir de uma URL
  const sendVideoFromURL = async (url) => {
    return await socket.sendMessage(
      remoteJid,
      {
        video: { url },
      },
      { url, quoted: webMessage }
    );
  };

  // Função para enviar áudio a partir de um arquivo
  const sendAudioFromFile = async (file) => {
    return await socket.sendMessage(
      remoteJid,
      {
        audio: fs.readFileSync(file),
        mimetype: 'audio/mp4', // ou 'audio/mp3' dependendo do formato do arquivo
      },
      { quoted: webMessage }
    );
  };

  // Função para enviar um botão com uma mensagem
  const sendButton = async (text, buttonText, buttonData) => {
    return await socket.sendMessage(remoteJid, {
      text: `${BOT_EMOJI} ${text}`,
      buttons: [
        {
          buttonId: buttonData,
          buttonText: { displayText: buttonText },
          type: 1,
        },
      ],
      headerType: 1,
    });
  };

  return {
    args,
    commandName,
    fullArgs,
    fullMessage,
    isImage,
    isReply,
    isSticker,
    isVideo,
    prefix,
    remoteJid,
    replyJid,
    socket,
    userJid,
    webMessage,
    sendVideoFromFile,
    downloadImage,
    downloadSticker,
    downloadVideo,
    sendAudioFromFile,
    sendAudioFromURL,
    sendErrorReact,
    sendErrorReply,
    sendImageFromFile,
    sendImageFromURL,
    sendReact,
    sendReply,
    sendStickerFromFile,
    sendStickerFromURL,
    sendSuccessReact,
    sendSuccessReply,
    sendText,
    sendVideoFromURL,
    sendWaitReact,
    sendWaitReply,
    sendWarningReact,
    sendWarningReply,
    sendButton,
  };
};