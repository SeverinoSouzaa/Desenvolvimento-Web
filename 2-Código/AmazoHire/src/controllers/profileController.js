const db = require('../config/db');

// Busca os dados do perfil (incluindo endereço)
exports.getPerfilCandidato = async (req, res) => {
    const { idUsuario } = req.query; // Recebe o ID do front-end

    try {
        const query = `
            SELECT u.nome, u.email, c.*, e.* FROM usuario u
            LEFT JOIN candidato_perfil c ON u.idUsuario = c.idUsuario
            LEFT JOIN endereco e ON c.idEndereco = e.idEndereco
            WHERE u.idUsuario = ?
        `;
        
        const [rows] = await db.query(query, [idUsuario]);

        if (rows.length === 0) {
            return res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado.' });
        }

        res.json({ sucesso: true, dados: rows[0] });

    } catch (error) {
        console.error(error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar perfil.' });
    }
};

exports.salvarPerfilCandidato = async (req, res) => {
    const dados = req.body;
    const arquivo = req.file; 

    try {
        // Atualiza ou Cria Endereço
        const [endResult] = await db.query(
            'INSERT INTO endereco (rua, numero, bairro, cidade, estado, cep) VALUES (?, ?, ?, ?, ?, ?)',
            [dados.rua, dados.numero, dados.bairro, dados.cidade, dados.estado, dados.cep]
        );
        const idEndereco = endResult.insertId;

        // Monta a query
        let querySQL = `UPDATE candidato_perfil SET 
                idEndereco = ?, whatsappProf = ?, areaInteresse = ?, miniBio = ?, 
                habilidades = ?, experiencias = ?, formacao = ?, linkPortfolio = ?`;
        
        let params = [
            idEndereco, dados.whatsappProf, dados.areaInteresse, dados.miniBio, 
            dados.habilidades, dados.experiencias, dados.formacao, dados.linkPortfolio
        ];

        // --- AQUI ESTA A MAGICA DA REMOÇÃO ---
        if (dados.removerFoto === 'true') {
            // Se o usuário pediu para remover, definimos como NULL no banco
            querySQL += `, fotoPerfil = NULL`; 
        } else if (arquivo) {
            // Se o usuário enviou uma nova foto
            querySQL += `, fotoPerfil = ?`;
            params.push(arquivo.filename);
        }
        // -------------------------------------

        querySQL += ` WHERE idUsuario = ?`;
        params.push(dados.idUsuario);

        await db.query(querySQL, params);

        res.json({ sucesso: true, mensagem: 'Perfil atualizado!' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao salvar.' });
    }
};