const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "PauMeter",
  description: "🍆 Mede o tamanho do seu PAU com precisão científica! 🍆",
  commands: ["pau", "pica"],
  usage: `${PREFIX}pau`,
  handle: async ({ sendReply, sendReact }) => {
    console.log("[🍆 PAU METER] Comando ativado!");

  
    const randomNumber = Math.floor(Math.random() * 200) + 1;

    
    await sendReact("🍆");

    
    await sendReply(`
🔞 *CALCULADORA DE PAU* 🔞  

📏 *Medindo seu poder...*  
🍌 *Avaliando a grandeza...*  
🔥 *Processando os dados...*  

🍆 *Resultado:* Seu *membro* tem impressionantes *${randomNumber}CM*! 😳💦
    `);
  },
};
