const { PREFIX, ASSETS_DIR } = require(`${BASE_DIR}/config`);
const path = require("path");

module.exports = {
  name: "metadinha-casal",
  description: "Envia imagens de casal para o metadinha",
  commands: ["metadinhacasal", "casalmeta", "metadinhacasals"],
  usage: `${PREFIX}metadinha-casal`,
  handle: async ({ sendImageFromFile, sendReact }) => {
    try {
      const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

      await sendReact("😂"); 

      const images = [
        path.join(ASSETS_DIR, "casal", "casal.jpg"),
        path.join(ASSETS_DIR, "casal", "casal2.jpg"),
      ];

      for (const image of images) {
        await sendImageFromFile(image); // Envia a imagem
        await delay(500); // 0.5 segundos de delay entre cada imagem
      }
    } catch (error) {
      console.log("Erro no comando metadinha-casal:", error);
    }
  },
};
