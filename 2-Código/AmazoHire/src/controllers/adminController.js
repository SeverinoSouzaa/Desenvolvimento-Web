const db = require('../config/db');
const bcrypt = require('bcryptjs');

// --- 1. FUNÇÕES DE DENÚNCIA (USUÁRIO COMUM) ---

exports.denunciarVaga = async (req, res) => {
    const { idVaga, idAutor, motivo } = req.body;
    try {
        await db.query('INSERT INTO denuncia_vaga (idVaga, idAutor, motivo) VALUES (?, ?, ?)', [idVaga, idAutor, motivo]);
        res.json({ sucesso: true, mensagem: 'Denúncia enviada.' });
    } catch (error) { res.status(500).json({ sucesso: false }); }
};

exports.denunciarPerfil = async (req, res) => {
    const { idPerfilDenunciado, idAutor, motivo } = req.body;
    try {
        await db.query('INSERT INTO denuncia_perfil (idPerfilDenunciado, idAutor, motivo) VALUES (?, ?, ?)', [idPerfilDenunciado, idAutor, motivo]);
        res.json({ sucesso: true, mensagem: 'Denúncia enviada.' });
    } catch (error) { res.status(500).json({ sucesso: false }); }
};

// --- 2. DASHBOARD (STATS CORRIGIDOS) ---

exports.getDashboardStats = async (req, res) => {
    try {
        // CORREÇÃO: Conta apenas usuários ATIVOS (exclui admins da conta)
        const [users] = await db.query("SELECT COUNT(*) as total FROM usuario WHERE tipo != 'ADM' AND status = 'ATIVO'");
        
        // CORREÇÃO: Conta apenas vagas ATIVAS
        const [vagas] = await db.query("SELECT COUNT(*) as total FROM vaga WHERE status = 'ATIVA'");
        
        const [denuncias] = await db.query("SELECT COUNT(*) as total FROM denuncia_vaga WHERE status='PENDENTE'");
        const [denunciasP] = await db.query("SELECT COUNT(*) as total FROM denuncia_perfil WHERE status='PENDENTE'");

        res.json({
            usuarios: users[0].total,
            vagas: vagas[0].total,
            pendencias: denuncias[0].total + denunciasP[0].total
        });
    } catch (error) { res.status(500).json({ erro: 'Erro stats' }); }
};

// --- 3. GESTÃO DE EQUIPE ---

exports.criarNovoAdmin = async (req, res) => {
    const { nome, email, senha, cargo } = req.body;
    try {
        const [existe] = await db.query("SELECT * FROM usuario WHERE email = ?", [email]);
        if(existe.length > 0) return res.status(400).json({ sucesso: false, mensagem: 'E-mail já cadastrado.' });

        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(senha, salt);
        
        const [userResult] = await db.query("INSERT INTO usuario (nome, email, senhaHash, tipo) VALUES (?, ?, ?, 'ADM')", [nome, email, senhaHash]);
        await db.query("INSERT INTO adm (idUsuario, cargo, nivelAcesso, permissao) VALUES (?, ?, 'GERAL', 'STANDARD')", [userResult.insertId, cargo]);

        res.json({ sucesso: true, mensagem: 'Admin criado.' });
    } catch (error) { res.status(500).json({ sucesso: false }); }
};

exports.listarAdmins = async (req, res) => {
    try {
        const [admins] = await db.query("SELECT u.idUsuario, u.nome, u.email, a.cargo FROM usuario u JOIN adm a ON u.idUsuario = a.idUsuario WHERE a.permissao != 'MASTER'");
        res.json({ sucesso: true, admins });
    } catch (error) { res.status(500).json({ sucesso: false }); }
};

exports.removerAdmin = async (req, res) => {
    const { idUsuario } = req.body;
    try {
        await db.query("DELETE FROM usuario WHERE idUsuario = ?", [idUsuario]);
        res.json({ sucesso: true, mensagem: 'Removido.' });
    } catch (error) { res.status(500).json({ sucesso: false }); }
};

exports.promoverAdmin = async (req, res) => {
    const { emailParaPromover } = req.body;
    try {
        const [user] = await db.query("SELECT idUsuario FROM usuario WHERE email = ?", [emailParaPromover]);
        if (user.length === 0) return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
        const idTarget = user[0].idUsuario;
        await db.query("UPDATE usuario SET tipo = 'ADM' WHERE idUsuario = ?", [idTarget]);
        await db.query("INSERT INTO adm (idUsuario, cargo, nivelAcesso, permissao) VALUES (?, 'Moderador', 'GERAL', 'STANDARD')", [idTarget]);
        res.json({ sucesso: true, mensagem: 'Promovido.' });
    } catch (error) { res.status(500).json({ sucesso: false }); }
};

// --- 4. MODERAÇÃO (COM EXCLUSÃO REAL) ---

exports.getPendencias = async (req, res) => {
    try {
        const [vagas] = await db.query(`
            SELECT d.*, v.*, a.nomeArea, e.nomeEmpresa, u.nome as nomeAutor
            FROM denuncia_vaga d
            JOIN vaga v ON d.idVaga = v.idVaga
            JOIN area_profissional a ON v.idArea = a.idArea
            JOIN empregador_perfil e ON v.idEmpresa = e.idEmpresa
            JOIN usuario u ON d.idAutor = u.idUsuario
            WHERE d.status = 'PENDENTE'
        `);

        // Perfis (Atualizado com Localização)
        const [perfis] = await db.query(`
            SELECT d.*, c.*, u_den.nome as nomeDenunciado, u_den.email, u_aut.nome as nomeAutor,
                   end.cidade, end.estado  /* <--- ADICIONAMOS ISSO */
            FROM denuncia_perfil d
            JOIN candidato_perfil c ON d.idPerfilDenunciado = c.idPerfil
            JOIN usuario u_den ON c.idUsuario = u_den.idUsuario
            JOIN usuario u_aut ON d.idAutor = u_aut.idUsuario
            LEFT JOIN endereco end ON c.idEndereco = end.idEndereco /* <--- E O JOIN AQUI */
            WHERE d.status = 'PENDENTE'
        `);

        res.json({ sucesso: true, vagas, perfis });
    } catch (error) { res.status(500).json({ sucesso: false }); }
};

// Banir Vaga (AGORA DELETA DE VERDADE)
exports.resolverVaga = async (req, res) => {
    const { idDenuncia, idVaga, decisao } = req.body;
    try {
        // Se a decisão for ACEITA (Banir), deletamos a vaga e dependências
        if (decisao === 'ACEITA') {
            // Limpa rastros antes para não dar erro de chave estrangeira
            await db.query('DELETE FROM denuncia_vaga WHERE idVaga = ?', [idVaga]);
            await db.query('DELETE FROM favorito WHERE idVaga = ?', [idVaga]);
            
            // Deleta a vaga
            await db.query('DELETE FROM vaga WHERE idVaga = ?', [idVaga]);
        } else {
            // Se for rejeitada, apenas atualiza a denúncia para não aparecer mais
            await db.query('UPDATE denuncia_vaga SET status = ? WHERE idDenunciaVaga = ?', [decisao, idDenuncia]);
        }
        res.json({ sucesso: true, mensagem: 'Moderação realizada.' });
    } catch (error) {
        res.status(500).json({ sucesso: false, mensagem: 'Erro na moderação.' });
    }
};

// Banir Candidato (AGORA DELETA DE VERDADE)
exports.resolverPerfil = async (req, res) => {
    const { idDenuncia, idPerfil, decisao } = req.body;
    try {
        if (decisao === 'ACEITA') {
            // 1. Descobre o ID do Usuário dono do perfil
            const [perfil] = await db.query('SELECT idUsuario FROM candidato_perfil WHERE idPerfil = ?', [idPerfil]);
            
            if (perfil.length > 0) {
                // Limpa denúncias atreladas para não dar erro
                await db.query('DELETE FROM denuncia_perfil WHERE idPerfilDenunciado = ?', [idPerfil]);
                
                // DELETA O USUÁRIO (O Cascade do banco deve levar o perfil junto, mas isso garante a limpeza)
                await db.query('DELETE FROM usuario WHERE idUsuario = ?', [perfil[0].idUsuario]);
            }
        } else {
            await db.query('UPDATE denuncia_perfil SET status = ? WHERE idDenunciaPerfil = ?', [decisao, idDenuncia]);
        }
        res.json({ sucesso: true, mensagem: 'Moderação realizada.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro na moderação.' });
    }
};

// Banir Empresa (AGORA DELETA DE VERDADE)
exports.banirEmpresaPorVaga = async (req, res) => {
    const { idDenuncia, idVaga } = req.body;
    try {
        // Descobre a empresa
        const [vaga] = await db.query("SELECT idEmpresa FROM vaga WHERE idVaga = ?", [idVaga]);
        if(vaga.length === 0) return res.status(404).json({sucesso:false});
        const idEmpresa = vaga[0].idEmpresa;

        // Descobre o Usuário dono da empresa
        const [empresa] = await db.query("SELECT idUsuario FROM empregador_perfil WHERE idEmpresa = ?", [idEmpresa]);
        
        if (empresa.length > 0) {
            const idUsuarioEmpresa = empresa[0].idUsuario;

            // Limpezas de segurança (Remove denúncias e favoritos das vagas dessa empresa)
            // Nota: Em um banco bem configurado com CASCADE, deletar o usuário resolveria tudo,
            // mas fazemos manual para garantir que não sobrem órfãos.
            await db.query("DELETE FROM denuncia_vaga WHERE idVaga IN (SELECT idVaga FROM vaga WHERE idEmpresa = ?)", [idEmpresa]);
            await db.query("DELETE FROM favorito WHERE idVaga IN (SELECT idVaga FROM vaga WHERE idEmpresa = ?)", [idEmpresa]);
            await db.query("DELETE FROM vaga WHERE idEmpresa = ?", [idEmpresa]);

            // DELETA A EMPRESA (USUÁRIO)
            await db.query("DELETE FROM usuario WHERE idUsuario = ?", [idUsuarioEmpresa]);
        }

        res.json({ sucesso: true, mensagem: 'Empresa e dados excluídos.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro.' });
    }
};