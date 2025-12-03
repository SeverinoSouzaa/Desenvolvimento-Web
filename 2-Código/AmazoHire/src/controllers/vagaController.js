const db = require('../config/db');

// Listar vagas DA EMPRESA (Agora busca o endereço da própria vaga)
exports.getVagasEmpresa = async (req, res) => {
    const { idUsuario } = req.query;
    try {
        const [empresa] = await db.query('SELECT idEmpresa FROM empregador_perfil WHERE idUsuario = ?', [idUsuario]);
        if (empresa.length === 0) return res.json({ sucesso: true, vagas: [] });

        const [vagas] = await db.query(`
            SELECT v.*, a.nomeArea 
            FROM vaga v
            JOIN area_profissional a ON v.idArea = a.idArea
            WHERE v.idEmpresa = ?
            ORDER BY v.dataPublicacao DESC
        `, [empresa[0].idEmpresa]);

        res.json({ sucesso: true, vagas });
    } catch (error) {
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar vagas.' });
    }
};

// Criar OU Editar Vaga (Endereço específico da vaga)
exports.salvarVaga = async (req, res) => {
    let { 
        idVaga, idUsuario, titulo, nomeArea, descricao, requisitos, salario, 
        tipoContratacao, modalidade, 
        linkCandidaturaExterno, emailCandidatura, whatsappCandidatura,
        cidade, estado, bairro, rua 
    } = req.body;

    try {
        // 1. Formatações
        if (salario) {
            if (typeof salario === 'string' && salario.includes(',')) {
                salario = salario.replace(/\./g, '').replace(',', '.');
            }
        } else { salario = null; }
        
        cidade = cidade || null; estado = estado || null;
        bairro = bairro || null; rua = rua || null;

        // 2. Lógica de Área (Busca ou Cria)
        let idArea;
        const [areaExistente] = await db.query('SELECT idArea FROM area_profissional WHERE nomeArea = ?', [nomeArea]);
        if (areaExistente.length > 0) {
            idArea = areaExistente[0].idArea;
        } else {
            const [novaArea] = await db.query('INSERT INTO area_profissional (nomeArea) VALUES (?)', [nomeArea]);
            idArea = novaArea.insertId;
        }

        // 3. Pega ID da Empresa
        const [empresa] = await db.query('SELECT idEmpresa FROM empregador_perfil WHERE idUsuario = ?', [idUsuario]);
        if (empresa.length === 0) return res.status(400).json({ sucesso: false, mensagem: 'Empresa não encontrada.' });
        const idEmpresa = empresa[0].idEmpresa;

        // 4. Salva a Vaga (Com o endereço nela mesma)
        if (idVaga) {
            // EDIÇÃO
            await db.query(`
                UPDATE vaga SET 
                    titulo=?, idArea=?, descricao=?, requisitos=?, salario=?, 
                    tipoContratacao=?, modalidade=?, 
                    linkCandidaturaExterno=?, emailCandidatura=?, whatsappCandidatura=?,
                    cidade=?, estado=?, bairro=?, rua=?
                WHERE idVaga = ? AND idEmpresa = ?
            `, [titulo, idArea, descricao, requisitos, salario, tipoContratacao, modalidade, linkCandidaturaExterno, emailCandidatura, whatsappCandidatura, cidade, estado, bairro, rua, idVaga, idEmpresa]);
            
            res.json({ sucesso: true, mensagem: 'Vaga atualizada!' });

        } else {
            // CRIAÇÃO
            await db.query(`
                INSERT INTO vaga (idEmpresa, idArea, titulo, descricao, requisitos, salario, tipoContratacao, modalidade, linkCandidaturaExterno, emailCandidatura, whatsappCandidatura, cidade, estado, bairro, rua)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [idEmpresa, idArea, titulo, descricao, requisitos, salario, tipoContratacao, modalidade, linkCandidaturaExterno, emailCandidatura, whatsappCandidatura, cidade, estado, bairro, rua]);

            res.json({ sucesso: true, mensagem: 'Vaga publicada!' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao salvar.' });
    }
};

// Excluir Vaga
exports.excluirVaga = async (req, res) => {
    const { idVaga, idUsuario } = req.body;
    try {
        const [empresa] = await db.query('SELECT idEmpresa FROM empregador_perfil WHERE idUsuario = ?', [idUsuario]);
        const idEmpresa = empresa[0].idEmpresa;

        await db.query('DELETE FROM denuncia_vaga WHERE idVaga = ?', [idVaga]);
        await db.query('DELETE FROM favorito WHERE idVaga = ?', [idVaga]);
        await db.query('DELETE FROM vaga WHERE idVaga = ? AND idEmpresa = ?', [idVaga, idEmpresa]);
        
        res.json({ sucesso: true, mensagem: 'Vaga excluída.' });
    } catch (error) {
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao excluir vaga.' });
    }
};

// Alternar Status
exports.alternarStatus = async (req, res) => {
    const { idVaga, statusAtual, idUsuario } = req.body;
    try {
        const [empresa] = await db.query('SELECT idEmpresa FROM empregador_perfil WHERE idUsuario = ?', [idUsuario]);
        const idEmpresa = empresa[0].idEmpresa;
        const novoStatus = statusAtual === 'ATIVA' ? 'PAUSADA' : 'ATIVA';
        await db.query('UPDATE vaga SET status = ? WHERE idVaga = ? AND idEmpresa = ?', [novoStatus, idVaga, idEmpresa]);
        res.json({ sucesso: true, novoStatus });
    } catch (error) {
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao alterar status.' });
    }
};

// Listar Públicas (Lê endereço da própria vaga)
exports.getVagasPublicas = async (req, res) => {
    try {
        const query = `
            SELECT v.*, a.nomeArea, e.nomeEmpresa
            FROM vaga v
            JOIN area_profissional a ON v.idArea = a.idArea
            JOIN empregador_perfil e ON v.idEmpresa = e.idEmpresa
            WHERE v.status = 'ATIVA'
            ORDER BY v.dataPublicacao DESC
        `;
        const [vagas] = await db.query(query);
        res.json({ sucesso: true, vagas });
    } catch (error) {
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar vagas.' });
    }
};

// Toggle Favorito
exports.toggleFavorito = async (req, res) => {
    const { idUsuario, idVaga } = req.body;
    try {
        const [cand] = await db.query('SELECT idPerfil FROM candidato_perfil WHERE idUsuario = ?', [idUsuario]);
        if (cand.length === 0) return res.status(400).json({ mensagem: 'Perfil não encontrado.' });
        const idPerfil = cand[0].idPerfil;

        const [existe] = await db.query('SELECT idFavorito FROM favorito WHERE idCandidato = ? AND idVaga = ?', [idPerfil, idVaga]);

        if (existe.length > 0) {
            await db.query('DELETE FROM favorito WHERE idFavorito = ?', [existe[0].idFavorito]);
            res.json({ sucesso: true, favoritado: false });
        } else {
            await db.query('INSERT INTO favorito (idCandidato, idVaga) VALUES (?, ?)', [idPerfil, idVaga]);
            res.json({ sucesso: true, favoritado: true });
        }
    } catch (error) {
        res.status(500).json({ sucesso: false });
    }
};

// Listar Favoritas (Lê endereço da própria vaga)
exports.getMinhasFavoritas = async (req, res) => {
    const { idUsuario } = req.query;
    try {
        const query = `
            SELECT v.*, a.nomeArea, e.nomeEmpresa
            FROM favorito f
            JOIN candidato_perfil c ON f.idCandidato = c.idPerfil
            JOIN vaga v ON f.idVaga = v.idVaga
            JOIN area_profissional a ON v.idArea = a.idArea
            JOIN empregador_perfil e ON v.idEmpresa = e.idEmpresa
            WHERE c.idUsuario = ? AND v.status = 'ATIVA'
            ORDER BY f.dataFavorito DESC
        `;
        const [vagas] = await db.query(query, [idUsuario]);
        res.json({ sucesso: true, vagas });
    } catch (error) {
        res.status(500).json({ sucesso: false });
    }
};

// IDs Favoritos
exports.getMeusFavoritosIds = async (req, res) => {
    const { idUsuario } = req.query;
    try {
        const [rows] = await db.query(`
            SELECT f.idVaga FROM favorito f
            JOIN candidato_perfil c ON f.idCandidato = c.idPerfil
            WHERE c.idUsuario = ?
        `, [idUsuario]);
        const ids = rows.map(r => r.idVaga);
        res.json({ sucesso: true, ids });
    } catch (error) { res.status(500).json({ ids: [] }); }
};