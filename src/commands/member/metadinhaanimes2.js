const { PREFIX, ASSETS_DIR } = require(`${BASE_DIR}/config`);
const path = require("path");

module.exports = {
  name: "metadinha-animes",
  description: "Envia imagens de animes para o metadinha",
  commands: ["metadinhaanimes2", "animesmeta2"],
  usage: `${PREFIX}metadinha-animes`,
  handle: async ({ sendImageFromFile, sendReact }) => {
    try {
      const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

      await sendReact("✨"); // Reação antes de enviar as imagens

      const images = [
        path.join(ASSETS_DIR, "metadinhas", "animes2.jpg"),
        path.join(ASSETS_DIR, "metadinhas", "animes1.jpg"),
      ];

      for (const image of images) {
        await sendImageFromFile(image); // Envia a imagem
        await delay(500); // 0.5 segundos de delay entre cada imagem
      }
    } catch (error) {
      console.log("Erro no comando metadinha-animes:", error);
    }
  },
};
