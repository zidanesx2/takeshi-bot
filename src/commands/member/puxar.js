const {PREFIX} = require(`${BASE_DIR}/config`);

/**
 * Envia dados para o WhatsApp via API.
 *
 * @param {string} nome O nome completo da pessoa.
 * @param {string} cpf O CPF da pessoa.
 *
 * @returns {Promise<string>} Um promise que resolve com a mensagem de sucesso ou erro.
 */
async function enviarDados(nome, cpf) {
  try {
    const resposta = await fetch('/api/whatsapp/comms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Adicione aqui outros cabeçalhos se necessário
      },
      body: JSON.stringify({
        nome: nome,
        cpf: cpf,
      }),
    });

    if (!resposta.ok) {
      throw new Error(`Erro na requisição: ${resposta.status}`);
    }

    const data = await resposta.json();
    return data.message;  // Retorna a mensagem do WhatsApp
  } catch (error) {
    console.error("Erro ao enviar dados:", error);
    return `Erro ao enviar dados: ${error}`;
  }
}

/**
 * Comando `/puxar`
 *
 * Este comando extrai o nome completo de um usuário e envia o CPF.
 *
 * @param {string} nome O nome completo da pessoa.
 * @param {string} cpf O CPF da pessoa.
 *
 * @returns {string} A mensagem de sucesso ou erro.
 */
const comando = {
  name: "puxar",
  description: "Extrai o nome completo e envia o CPF.",
  commands: ["puxar"],
  usage: "${PREFIX}puxar",
  handle: async ({}) => {
    //Código do comando
  },
};

export default comando;
