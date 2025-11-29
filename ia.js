const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

class GenosIA {
    constructor() {
        this.dbPath = path.join(__dirname, 'genos_memoria.db');
        this.db = null;
        this.ativa = false;
        this.personalidade = this.criarPersonalidadeInicial();
        
        this.inicializarBanco().then(() => {
            console.log('🤖 Genos IA inicializada com SQLite!');
        });
    }

    // 🗄️ Inicializar banco SQLite
    async inicializarBanco() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    console.error('Erro ao conectar SQLite:', err);
                    reject(err);
                    return;
                }

                // Criar tabelas
                this.criarTabelas().then(resolve).catch(reject);
            });
        });
    }

    // 📋 Criar estrutura das tabelas
    async criarTabelas() {
        const tabelas = [
            // Tabela de usuários
            `CREATE TABLE IF NOT EXISTS usuarios (
                id TEXT PRIMARY KEY,
                nome TEXT,
                primeiro_contato DATETIME,
                interacoes INTEGER DEFAULT 0,
                ultima_interacao DATETIME,
                palavras_frequentes TEXT,
                horarios_ativos TEXT,
                personalidade TEXT DEFAULT 'desconhecida'
            )`,

            // Tabela de conversas
            `CREATE TABLE IF NOT EXISTS conversas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                conversa_id TEXT,
                usuario TEXT,
                mensagem TEXT,
                tipo TEXT,
                timestamp DATETIME,
                FOREIGN KEY (usuario) REFERENCES usuarios(id)
            )`,

            // Tabela de conhecimentos
            `CREATE TABLE IF NOT EXISTS conhecimentos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                chave TEXT UNIQUE,
                valor TEXT,
                aprendido_com TEXT,
                timestamp DATETIME,
                FOREIGN KEY (aprendido_com) REFERENCES usuarios(id)
            )`,

            // Tabela de configurações
            `CREATE TABLE IF NOT EXISTS config (
                chave TEXT PRIMARY KEY,
                valor TEXT
            )`,

            // Tabela de estatísticas
            `CREATE TABLE IF NOT EXISTS estatisticas (
                id INTEGER PRIMARY KEY,
                mensagens_processadas INTEGER DEFAULT 0,
                ultima_atividade DATETIME,
                energia INTEGER DEFAULT 50,
                humor TEXT DEFAULT 'neutro'
            )`
        ];

        for (const sql of tabelas) {
            await this.executarQuery(sql);
        }

        // Inicializar configurações se não existirem
        await this.inicializarConfiguracoes();
    }

    // ⚙️ Inicializar configurações padrão
    async inicializarConfiguracoes() {
        const configs = [
            { chave: 'ativa', valor: 'false' },
            { chave: 'personalidade', valor: JSON.stringify(this.personalidade) }
        ];

        for (const config of configs) {
            await this.executarQuery(
                'INSERT OR IGNORE INTO config (chave, valor) VALUES (?, ?)',
                [config.chave, config.valor]
            );
        }

        // Inicializar estatísticas se não existir
        await this.executarQuery(
            'INSERT OR IGNORE INTO estatisticas (id, mensagens_processadas, energia, humor) VALUES (1, 0, 50, ?)',
            ['neutro']
        );

        // Carregar configurações
        await this.carregarConfiguracoes();
    }

    // 📥 Carregar configurações do banco
    async carregarConfiguracoes() {
        try {
            const ativaResult = await this.buscarQuery('SELECT valor FROM config WHERE chave = ?', ['ativa']);
            this.ativa = ativaResult ? ativaResult.valor === 'true' : false;

            const personalidadeResult = await this.buscarQuery('SELECT valor FROM config WHERE chave = ?', ['personalidade']);
            if (personalidadeResult) {
                this.personalidade = JSON.parse(personalidadeResult.valor);
            }
        } catch (error) {
            console.error('Erro ao carregar configurações:', error);
        }
    }

    // 🎭 Criar personalidade inicial
    criarPersonalidadeInicial() {
        return {
            nome: "Genos",
            tipo: "IA Assistente Pessoal",
            caracteristicas: [
                "amigável", "prestativo", "inteligente", 
                "curioso", "engraçado", "leal"
            ],
            estiloConversa: "casual e divertido",
            emojiFavoritos: ["🤖", "✨", "🔥", "💫", "🚀"],
            respostasPersonalizadas: {
                saudacao: [
                    "Oi! Sou o Genos 🤖 Como posso ajudar?",
                    "Olá! 👋 Pronto para conversar!",
                    "E aí! ✨ O que vamos fazer hoje?"
                ],
                despedida: [
                    "Tchau! Foi ótimo conversar com você! 👋",
                    "Até mais! Qualquer coisa me chama! 🤖",
                    "Falou! Nos vemos por aí! ✨"
                ],
                naoEntendi: [
                    "Não entendi muito bem... Pode explicar melhor? 🤔",
                    "Hmm, não captei. Reformula aí! 😅",
                    "Essa foi difícil! Me ajuda explicando de outro jeito? 🤖"
                ]
            }
        };
    }

    // 🔧 Executar query (INSERT, UPDATE, DELETE)
    executarQuery(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID, changes: this.changes });
                }
            });
        });
    }

    // 🔍 Buscar dados (SELECT)
    buscarQuery(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    // 🔍 Buscar múltiplas linhas
    buscarTodosQuery(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // 💾 Salvar configurações
    async salvarConfiguracoes() {
        try {
            await this.executarQuery(
                'UPDATE config SET valor = ? WHERE chave = ?',
                [this.ativa.toString(), 'ativa']
            );

            await this.executarQuery(
                'UPDATE config SET valor = ? WHERE chave = ?',
                [JSON.stringify(this.personalidade), 'personalidade']
            );
        } catch (error) {
            console.error('Erro ao salvar configurações:', error);
        }
    }

    // 🔛 Ativar IA
    async ativar() {
        this.ativa = true;
        await this.salvarConfiguracoes();
        console.log('🟢 Genos IA ativada!');
        return "🤖✨ *Genos IA Ativada!*\n\nOlá! Agora estou ativa e pronta para conversar! Vou aprender com nossas interações e melhorar cada dia mais! 🚀";
    }

    // 🔴 Desativar IA
    async desativar() {
        this.ativa = false;
        await this.salvarConfiguracoes();
        console.log('🔴 Genos IA desativada!');
        return "🤖💤 *Genos IA Desativada!*\n\nEstou entrando em modo hibernação... Quando precisar de mim, é só ativar novamente! Tchau! 👋";
    }

    // 🧠 Processar mensagem
    async processarMensagem(mensagem, usuario, grupoId = null) {
        if (!this.ativa) return null;

        try {
            // Atualizar estatísticas
            await this.atualizarEstatisticas();

            // Registrar/atualizar usuário
            await this.registrarUsuario(usuario);

            // Salvar conversa
            const conversaId = grupoId || usuario;
            await this.salvarMensagem(conversaId, usuario, mensagem, 'recebida');

            // Gerar resposta
            const resposta = await this.gerarResposta(mensagem, usuario, grupoId);

            // Salvar resposta
            if (resposta) {
                await this.salvarMensagem(conversaId, 'Genos', resposta, 'enviada');
            }

            // Aprender com a interação
            await this.aprenderComInteracao(mensagem, usuario);

            return resposta;

        } catch (error) {
            console.error('Erro ao processar mensagem:', error);
            return "🤖❌ Ops! Tive um pequeno problema interno. Tente novamente!";
        }
    }

    // 📊 Atualizar estatísticas
    async atualizarEstatisticas() {
        await this.executarQuery(
            'UPDATE estatisticas SET mensagens_processadas = mensagens_processadas + 1, ultima_atividade = ? WHERE id = 1',
            [new Date().toISOString()]
        );
    }

    // 👤 Registrar/atualizar usuário
    async registrarUsuario(usuario) {
        const usuarioExiste = await this.buscarQuery(
            'SELECT id FROM usuarios WHERE id = ?',
            [usuario]
        );

        if (!usuarioExiste) {
            // Novo usuário
            await this.executarQuery(
                'INSERT INTO usuarios (id, nome, primeiro_contato, interacoes, ultima_interacao) VALUES (?, ?, ?, 1, ?)',
                [usuario, usuario, new Date().toISOString(), new Date().toISOString()]
            );
        } else {
            // Usuário existente - incrementar interações
            await this.executarQuery(
                'UPDATE usuarios SET interacoes = interacoes + 1, ultima_interacao = ? WHERE id = ?',
                [new Date().toISOString(), usuario]
            );
        }
    }

    // 💬 Salvar mensagem na conversa
    async salvarMensagem(conversaId, usuario, mensagem, tipo) {
        await this.executarQuery(
            'INSERT INTO conversas (conversa_id, usuario, mensagem, tipo, timestamp) VALUES (?, ?, ?, ?, ?)',
            [conversaId, usuario, mensagem, tipo, new Date().toISOString()]
        );
    }

    // 🎯 Gerar resposta (mesma lógica do original, mas com consultas SQLite)
    async gerarResposta(mensagem, usuario, grupoId = null) {
        const mensagemLower = mensagem.toLowerCase();
        
        // Detectar contexto e intenção
        const contexto = this.analisarContexto(mensagem, usuario);
        
        // Respostas para saudações
        if (this.ehSaudacao(mensagemLower)) {
            return await this.responderSaudacao(usuario);
        }

        // Respostas para despedidas
        if (this.ehDespedida(mensagemLower)) {
            return this.responderDespedida(usuario);
        }

        // Perguntas sobre a IA
        if (this.ehPerguntaSobreIA(mensagemLower)) {
            return this.responderSobreIA();
        }

        // Comandos de aprendizado
        if (mensagemLower.startsWith('aprenda:')) {
            return await this.aprenderNovoConhecimento(mensagem, usuario);
        }

        // Buscar conhecimento aprendido
        const conhecimento = await this.buscarConhecimento(mensagemLower);
        if (conhecimento) {
            return conhecimento;
        }

        // Resposta padrão
        return this.gerarRespostaPadrao(mensagem, usuario, contexto);
    }

    // 👋 Responder saudação
    async responderSaudacao(usuario) {
        const saudacoes = this.personalidade.respostasPersonalizadas.saudacao;
        const saudacaoEscolhida = saudacoes[Math.floor(Math.random() * saudacoes.length)];
        
        // Verificar se é primeira vez
        const usuarioData = await this.buscarQuery('SELECT interacoes FROM usuarios WHERE id = ?', [usuario]);
        const primeiraVez = usuarioData && usuarioData.interacoes <= 1;
        
        if (primeiraVez) {
            return `${saudacaoEscolhida}\n\nÉ a primeira vez que conversamos! Prazer em conhecer você! 😊\n\nVou aprendendo com nossas conversas, então seja paciente comigo no início! 🤖`;
        }
        
        return saudacaoEscolhida;
    }

    // 📚 Aprender novo conhecimento
    async aprenderNovoConhecimento(mensagem, usuario) {
        const conhecimento = mensagem.substring(8); // Remove "aprenda: "
        const partes = conhecimento.split('=');
        
        if (partes.length === 2) {
            const chave = partes[0].trim().toLowerCase();
            const valor = partes[1].trim();
            
            await this.executarQuery(
                'INSERT OR REPLACE INTO conhecimentos (chave, valor, aprendido_com, timestamp) VALUES (?, ?, ?, ?)',
                [chave, valor, usuario, new Date().toISOString()]
            );
            
            return `🧠 *Conhecimento adquirido!*\n\nAgora sei que: *${partes[0].trim()}* = *${valor}*\n\nObrigado por me ensinar! 🤖✨`;
        }
        
        return `📚 Para me ensinar, use: *aprenda: pergunta = resposta*\n\nExemplo: aprenda: qual sua cor favorita = azul`;
    }

    // 🔍 Buscar conhecimento
    async buscarConhecimento(mensagem) {
        const conhecimentos = await this.buscarTodosQuery('SELECT * FROM conhecimentos');
        
        for (const conhecimento of conhecimentos) {
            if (mensagem.includes(conhecimento.chave)) {
                return `🧠 *Lembro disso!*\n\n${conhecimento.valor}\n\n_Aprendi isso com ${conhecimento.aprendido_com}_ 📚`;
            }
        }
        return null;
    }

    // 📊 Obter estatísticas
    async obterEstatisticas() {
        try {
            const stats = await this.buscarQuery('SELECT * FROM estatisticas WHERE id = 1');
            const totalUsuarios = await this.buscarQuery('SELECT COUNT(*) as total FROM usuarios');
            const totalConversas = await this.buscarQuery('SELECT COUNT(DISTINCT conversa_id) as total FROM conversas');
            const totalConhecimentos = await this.buscarQuery('SELECT COUNT(*) as total FROM conhecimentos');
            
            return `📊 *Estatísticas do Genos IA:*\n\n` +
                   `🧠 *Memória:*\n` +
                   `• ${stats?.mensagens_processadas || 0} mensagens processadas\n` +
                   `• ${totalUsuarios?.total || 0} usuários conhecidos\n` +
                   `• ${totalConversas?.total || 0} conversas ativas\n` +
                   `• ${totalConhecimentos?.total || 0} conhecimentos aprendidos\n\n` +
                   `🎭 *Personalidade:*\n` +
                   `• ${this.personalidade.caracteristicas.join(', ')}\n\n` +
                   `⚡ *Status:* ${this.ativa ? '🟢 Ativa' : '🔴 Inativa'}\n` +
                   `🔋 *Energia:* ${stats?.energia || 50}%`;
        } catch (error) {
            console.error('Erro ao obter estatísticas:', error);
            return "❌ Erro ao carregar estatísticas";
        }
    }

    // 🧹 Limpar dados antigos
    async limparMemoriaAntiga() {
        const trintaDiasAtras = new Date();
        trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
        
        try {
            await this.executarQuery(
                'DELETE FROM conversas WHERE timestamp < ?',
                [trintaDiasAtras.toISOString()]
            );
            console.log('🧹 Memória antiga limpa!');
        } catch (error) {
            console.error('Erro ao limpar memória:', error);
        }
    }

    // Métodos auxiliares (mantendo a mesma lógica)
    analisarContexto(mensagem, usuario) {
        const palavrasChave = mensagem.toLowerCase().split(' ');
        const emocoes = ['feliz', 'triste', 'raiva', 'medo', 'surpresa'];
        const topicos = ['música', 'filme', 'jogo', 'comida', 'trabalho', 'estudo'];
        
        return {
            emocao: emocoes.find(e => palavrasChave.includes(e)) || 'neutra',
            topico: topicos.find(t => palavrasChave.includes(t)) || 'geral',
            urgencia: mensagem.includes('!') || mensagem.includes('urgente'),
            pergunta: mensagem.includes('?')
        };
    }

    ehSaudacao(mensagem) {
        const saudacoes = ['oi', 'olá', 'eai', 'opa', 'salve', 'bom dia', 'boa tarde', 'boa noite'];
        return saudacoes.some(s => mensagem.includes(s));
    }

    ehDespedida(mensagem) {
        const despedidas = ['tchau', 'bye', 'falou', 'até', 'xau', 'flw'];
        return despedidas.some(d => mensagem.includes(d));
    }

    ehPerguntaSobreIA(mensagem) {
        const palavrasIA = ['você é', 'quem é você', 'o que você é', 'como funciona'];
        return palavrasIA.some(p => mensagem.includes(p));
    }

    responderSobreIA() {
        return `🤖 *Sobre mim:*\n\n` +
               `• Sou o Genos, uma IA em desenvolvimento!\n` +
               `• Estou usando SQLite para memória otimizada! 🗄️\n` +
               `• Cada interação me deixa mais inteligente! ✨\n\n` +
               `*Funções atuais:*\n` +
               `🧠 Memória persistente\n` +
               `📚 Aprendizado contínuo\n` +
               `🎭 Personalidade em evolução\n` +
               `💾 Banco de dados eficiente\n\n` +
               `Diga "aprenda: [algo]" para me ensinar!`;
    }

    responderDespedida(usuario) {
        const despedidas = this.personalidade.respostasPersonalizadas.despedida;
        return despedidas[Math.floor(Math.random() * despedidas.length)];
    }

    gerarRespostaPadrao(mensagem, usuario, contexto) {
        const respostas = [
            `Interessante! 🤔 Conte-me mais sobre isso!`,
            `Hmm, entendi! ✨ O que você acha sobre isso?`,
            `Bacana! 😊 Isso me lembra de algo...`,
            `Curioso! 🤖 Não tinha pensado nisso antes!`,
            `Legal! 🚀 Cada conversa é uma nova descoberta para mim!`
        ];

        if (contexto.emocao === 'feliz') {
            return `😊 Que legal! Fico feliz em saber! ${respostas[Math.floor(Math.random() * respostas.length)]}`;
        } else if (contexto.emocao === 'triste') {
            return `😔 Sinto muito por isso... Estou aqui se quiser conversar! Como posso ajudar?`;
        } else if (contexto.pergunta) {
            return `🤔 Boa pergunta! Infelizmente ainda não tenho essa informação, mas estou aprendendo! Você pode me ensinar?`;
        }
        
        return respostas[Math.floor(Math.random() * respostas.length)];
    }

    async aprenderComInteracao(mensagem, usuario) {
        // Implementar lógica de aprendizado se necessário
        // Por exemplo, analisar padrões, horários, etc.
    }

    // 🔒 Fechar conexão com banco
    fecharConexao() {
        if (this.db) {
            this.db.close((err) => {
                if (err) {
                    console.error('Erro ao fechar banco:', err);
                } else {
                    console.log('🔒 Conexão SQLite fechada');
                }
            });
        }
    }
}

module.exports = { GenosIA };