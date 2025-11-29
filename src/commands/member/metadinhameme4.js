const { PREFIX, ASSETS_DIR } = require(`${BASE_DIR}/config`);
const path = require("path");

module.exports = {
  name: "metadinha-memes",
  description: "Envia imagens de memes para o metadinha",
  commands: ["metadinhamemes4", "animesmeta", "metadinhameme4"],
  usage: `${PREFIX}metadinha-memes`,
  handle: async ({ sendImageFromFile, sendReact }) => {
    try {
      const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

      await sendReact("😂"); 

      const images = [
        path.join(ASSETS_DIR, "memes", "meme7.jpg"),
        path.join(ASSETS_DIR, "memes", "meme8.jpg"),
      ];

      for (const image of images) {
        await sendImageFromFile(image); // Envia a imagem
        await delay(500); // 0.5 segundos de delay entre cada imagem
      }
    } catch (error) {
      console.log("Erro no comando metadinha-memes:", error);
    }
  },
};
