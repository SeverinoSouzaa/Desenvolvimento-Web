const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.cadastrar = async (req, res) => {
    const { nome, email, senha, tipo } = req.body;

    try {
        // 1. Verificar se o usuário já existe
        const [usuariosExistentes] = await db.query('SELECT * FROM usuario WHERE email = ?', [email]);
        
        if (usuariosExistentes.length > 0) {
            return res.status(400).json({ 
                sucesso: false, 
                mensagem: 'Este e-mail já está cadastrado.' 
            });
        }

        // 2. Criptografar a senha (Segurança)
        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(senha, salt);

        // 3. Inserir no Banco de Dados
        const [resultado] = await db.query(
            'INSERT INTO usuario (nome, email, senhaHash, tipo) VALUES (?, ?, ?, ?)',
            [nome, email, senhaHash, tipo]
        );

        // 4. Se for EMPRESA ou CANDIDATO, cria o perfil vazio na tabela específica
        const idNovoUsuario = resultado.insertId;

        if (tipo === 'EMPREGADOR') {
            await db.query(
                'INSERT INTO empregador_perfil (idUsuario, nomeEmpresa) VALUES (?, ?)',
                [idNovoUsuario, nome] // Inicialmente usa o nome do cadastro como nome da empresa
            );
        } else {
            await db.query(
                'INSERT INTO candidato_perfil (idUsuario) VALUES (?)',
                [idNovoUsuario]
            );
        }

        res.status(201).json({ 
            sucesso: true, 
            mensagem: 'Cadastro realizado com sucesso! Redirecionando...' 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            sucesso: false, 
            mensagem: 'Erro no servidor. Tente novamente.' 
        });
    }
};

exports.login = async (req, res) => {
    const { email, senha } = req.body;

    try {
        // 1. Busca o usuário pelo email
        const [usuarios] = await db.query('SELECT * FROM usuario WHERE email = ?', [email]);
        
        if (usuarios.length === 0) {
            return res.status(401).json({ 
                sucesso: false, 
                mensagem: 'E-mail ou senha incorretos.' 
            });
        }

        const usuario = usuarios[0];

        // 2. Compara a senha digitada com a criptografada do banco
        const senhaValida = await bcrypt.compare(senha, usuario.senhaHash);

        if (!senhaValida) {
            return res.status(401).json({ 
                sucesso: false, 
                mensagem: 'E-mail ou senha incorretos.' 
            });


        }

// --- TRAVA DE SEGURANÇA (BANIMENTO) ---
        if (usuario.status === 'SUSPENSO' || usuario.status === 'BLOQUEADO') {
            return res.status(403).json({ 
                sucesso: false, 
                mensagem: ' Esta conta foi suspensa por violar nossas diretrizes.' 
            });
        }



        
        // 3. Se deu tudo certo, retorna o tipo de usuário para o front saber onde ir
        // (Aqui futuramente podemos criar um Token de segurança, mas por enquanto vamos validar o acesso)
        res.json({ 
            sucesso: true, 
            mensagem: 'Login realizado com sucesso!',
            usuario: {
                id: usuario.idUsuario,
                nome: usuario.nome,
                tipo: usuario.tipo
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            sucesso: false, 
            mensagem: 'Erro no servidor.' 
        });
    }
};