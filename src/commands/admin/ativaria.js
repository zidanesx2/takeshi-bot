const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "ia",
  description: "🤖 Sistema de controle da IA Genos - Ativar, desativar e obter estatísticas",
  commands: ["ia", "genos", "ai"],
  usage: `${PREFIX}ia <ativar/desativar/status/stats/reset>`,
  handle: async ({
    sendReply,
    sendErrorReply,
    sendSuccessReact,
    sendWaitReact,
    args,
    ...outrosParametros
  }) => {
    // A IA pode estar sendo passada pelo middleware ou estar global
    let genosIA = outrosParametros?.genosIA || global.genosIA;
    
    // Se não encontrou, tentar importar do loader
    if (!genosIA) {
      try {
        // Tentar acessar a IA através do require cache do loader
        const loaderModule = require.cache[require.resolve('../../loader')];
        if (loaderModule && loaderModule.exports.genosIA) {
          genosIA = loaderModule.exports.genosIA;
        }
      } catch (error) {
        console.log("Erro ao acessar IA do loader:", error.message);
      }
    }
    

    // Verificar se a IA foi inicializada
    if (!genosIA) {
      return sendErrorReply(
        `🚫 *IA não inicializada!*\n\n` +
        `❌ A Genos IA não foi carregada corretamente.\n` +
        `🔄 Reinicie o bot para corrigir o problema!`
      );
    }

    const subcomando = args[0]?.toLowerCase();

    if (!subcomando) {
      const helpMessage = `🤖 *GENOS IA - Sistema de Controle*\n\n` +
        `📋 *Comandos disponíveis:*\n\n` +
        `🟢 \`${PREFIX}ia ativar\` - Ativar a IA\n` +
        `🔴 \`${PREFIX}ia desativar\` - Desativar a IA\n` +
        `📊 \`${PREFIX}ia status\` - Ver status atual\n` +
        `📈 \`${PREFIX}ia stats\` - Ver estatísticas detalhadas\n` +
        `🧹 \`${PREFIX}ia reset\` - Resetar memória da IA\n` +
        `🧠 \`${PREFIX}ia memoria\` - Ver conteúdo da memória\n\n` +
        `💡 *Como funciona:*\n` +
        `• A IA aprende com as conversas\n` +
        `• Salva tudo em arquivos JSON\n` +
        `• Evolui sua personalidade com o tempo\n` +
        `• Use "aprenda: pergunta = resposta" para ensinar\n\n` +
        `🤖 *Status atual:* ${genosIA.ativa ? '🟢 Ativa' : '🔴 Inativa'}`;

      return sendReply(helpMessage);
    }

    await sendWaitReact();

    try {
      switch (subcomando) {
        case 'ativar':
        case 'on':
        case 'ligar':
          if (genosIA.ativa) {
            return sendReply(`🤖 *IA já está ativa!*\n\nA Genos está funcionando normalmente e respondendo às mensagens! ✨`);
          }

          const mensagemAtivacao = genosIA.ativar();
          await sendSuccessReact();
          return sendReply(mensagemAtivacao);

        case 'desativar':
        case 'off':
        case 'desligar':
          if (!genosIA.ativa) {
            return sendReply(`🤖 *IA já está desativada!*\n\nA Genos está em modo hibernação! 💤`);
          }

          const mensagemDesativacao = genosIA.desativar();
          await sendSuccessReact();
          return sendReply(mensagemDesativacao);

        case 'status':
        case 'info':
          const statusIcon = genosIA.ativa ? '🟢' : '🔴';
          const statusText = genosIA.ativa ? 'ATIVA' : 'INATIVA';
          const totalUsuarios = Object.keys(genosIA.memoria?.usuarios || {}).length;
          const totalConhecimentos = Object.keys(genosIA.memoria?.conhecimentos || {}).length;

          const statusMessage = `🤖 *GENOS IA - Status*\n\n` +
            `${statusIcon} *Status:* ${statusText}\n` +
            `🧠 *Mensagens processadas:* ${genosIA.memoria?.estatisticas?.mensagensProcessadas || 0}\n` +
            `👥 *Usuários conhecidos:* ${totalUsuarios}\n` +
            `📚 *Conhecimentos:* ${totalConhecimentos}\n` +
            `🔋 *Energia:* ${genosIA.memoria?.emocoes?.energia || 0}%\n` +
            `🎭 *Humor:* ${genosIA.memoria?.emocoes?.humor || 'neutro'}\n\n` +
            `⏰ *Última atividade:*\n${genosIA.memoria?.estatisticas?.ultimaAtividade || 'Nunca'}\n\n` +
            `🎯 *Personalidade atual:*\n${genosIA.personalidade?.caracteristicas?.join(', ') || 'Não definida'}`;

          return sendReply(statusMessage);

        case 'stats':
        case 'estatisticas':
          const estatisticas = genosIA.obterEstatisticas();
          return sendReply(estatisticas);

        case 'reset':
        case 'resetar':
          // Confirmação de segurança
          const resetMessage = `⚠️ *ATENÇÃO: RESET DA IA*\n\n` +
            `🚨 Isso irá apagar TODA a memória da IA:\n` +
            `• Todas as conversas\n` +
            `• Todos os conhecimentos aprendidos\n` +
            `• Dados de usuários\n` +
            `• Personalidade desenvolvida\n\n` +
            `❓ Tem certeza? Digite: \`${PREFIX}ia confirmareset\``;

          return sendReply(resetMessage);

        case 'confirmareset':
          // Reset completo
          genosIA.memoria = {
            conversas: {},
            usuarios: {},
            conhecimentos: {},
            emocoes: { humor: 'neutro', energia: 50 },
            estatisticas: { mensagensProcessadas: 0, ultimaAtividade: null }
          };
          
          // Verificar se existe o método antes de chamar
          if (typeof genosIA.criarPersonalidadeInicial === 'function') {
            genosIA.personalidade = genosIA.criarPersonalidadeInicial();
          } else {
            genosIA.personalidade = { caracteristicas: ['curiosa', 'amigável', 'inteligente'] };
          }
          
          // Verificar se existem os métodos antes de chamar
          if (typeof genosIA.salvarMemoria === 'function') {
            genosIA.salvarMemoria();
          }
          if (typeof genosIA.salvarConfig === 'function') {
            genosIA.salvarConfig();
          }

          await sendSuccessReact();
          return sendReply(`🔄 *IA RESETADA COM SUCESSO!*\n\nA Genos voltou ao estado inicial!\n\n🤖 Memória limpa e pronta para novas aprendizagens! ✨`);

        case 'memoria':
        case 'memory':
          const totalConversasDetalhes = Object.keys(genosIA.memoria?.conversas || {}).length;
          const conhecimentosLista = Object.keys(genosIA.memoria?.conhecimentos || {}).slice(0, 5).join(', ');
          const usuariosAtivos = Object.entries(genosIA.memoria?.usuarios || {})
            .sort((a, b) => (b[1]?.interacoes || 0) - (a[1]?.interacoes || 0))
            .slice(0, 3)
            .map(([nome, dados]) => `${nome} (${dados?.interacoes || 0} msgs)`)
            .join(', ');

          const memoriaMessage = `🧠 *MEMÓRIA DA GENOS IA*\n\n` +
            `💬 *Conversas ativas:* ${totalConversasDetalhes}\n` +
            `📚 *Conhecimentos aprendidos:* ${Object.keys(genosIA.memoria?.conhecimentos || {}).length}\n` +
            `👥 *Usuários registrados:* ${Object.keys(genosIA.memoria?.usuarios || {}).length}\n\n` +
            `🔥 *Usuários mais ativos:*\n${usuariosAtivos || 'Nenhum ainda'}\n\n` +
            `📖 *Últimos conhecimentos:*\n${conhecimentosLista || 'Nenhum ainda'}\n\n` +
            `🎭 *Evolução da personalidade:*\n${genosIA.personalidade?.caracteristicas?.join(' • ') || 'Não definida'}\n\n` +
            `💾 *Arquivos de memória:*\n• genos_memoria.json\n• genos_config.json`;

          return sendReply(memoriaMessage);

        case 'limpar':
        case 'clean':
          genosIA.limparMemoriaAntiga();
          await sendSuccessReact();
          return sendReply(`🧹 *Memória antiga limpa!*\n\nConversas com mais de 30 dias foram removidas para otimizar o desempenho! ✨`);

        case 'backup':
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const backupData = {
            memoria: genosIA.memoria,
            config: genosIA.config,
            personalidade: genosIA.personalidade,
            timestamp: timestamp
          };

          const fs = require('fs');
          const backupFile = `backup_genos_${timestamp}.json`;
          fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));

          await sendSuccessReact();
          return sendReply(`💾 *Backup criado com sucesso!*\n\nArquivo: \`${backupFile}\`\n\n✅ Toda a memória e configurações foram salvas!`);

        default:
          return sendErrorReply(
            `❓ *Comando não reconhecido!*\n\n` +
            `📋 *Comandos disponíveis:*\n` +
            `• ativar/desativar\n` +
            `• status/stats\n` +
            `• memoria/reset\n` +
            `• backup/limpar\n\n` +
            `💡 Use \`${PREFIX}ia\` sem parâmetros para ver a ajuda completa!`
          );
      }
    } catch (error) {
      console.error('❌ Erro no comando IA:', error);
      return sendErrorReply(
        `🚫 *Erro interno do sistema IA!*\n\n` +
        `😅 Algo deu errado ao processar o comando...\n` +
        `🔄 Tente novamente em alguns instantes!`
      );
    }
  },
};