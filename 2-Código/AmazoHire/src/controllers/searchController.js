const db = require('../config/db');

exports.listarCandidatos = async (req, res) => {
    try {
        const query = `
            SELECT 
                u.nome, u.email,
                c.idPerfil, c.idUsuario, c.areaInteresse, c.habilidades, c.miniBio, 
                c.fotoPerfil, c.whatsappProf, c.linkPortfolio, c.formacao, c.experiencias,
                e.cidade, e.estado
            FROM candidato_perfil c
            JOIN usuario u ON c.idUsuario = u.idUsuario
            LEFT JOIN endereco e ON c.idEndereco = e.idEndereco
            WHERE c.visibilidade = 1
            AND u.tipo = 'CANDIDATO'
            AND u.status = 'ATIVO'
            
            -- FILTRO DE QUALIDADE: 
            -- Só mostra se tiver Área de Interesse preenchida (não nula e não vazia)
            AND c.areaInteresse IS NOT NULL 
            AND c.areaInteresse != ''
        `;
        
        const [candidatos] = await db.query(query);
        res.json({ sucesso: true, candidatos });

    } catch (error) {
        console.error(error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar candidatos.' });
    }
};