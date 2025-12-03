// 1. IMPORTAÇÕES GERAIS
const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
require('dotenv').config();

// 2. IMPORTAÇÕES DOS CONTROLLERS
const db = require('./src/config/db');
const adminController = require('./src/controllers/adminController');
const searchController = require('./src/controllers/searchController');
const authController = require('./src/controllers/authController');
const profileController = require('./src/controllers/profileController');
const vagaController = require('./src/controllers/vagaController');

// 3. CONFIGURAÇÃO DE UPLOAD (MULTER)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname) 
    }
});
const upload = multer({ storage: storage });

if (!fs.existsSync('public/uploads')){
    fs.mkdirSync('public/uploads');
}

// 4. INICIALIZAÇÃO DO APP (Onde o 'app' nasce)
const app = express();
const PORT = process.env.PORT || 3000;

// 5. MIDDLEWARES (Configurações)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// --- 6. ROTAS DE TELAS (FRONT-END) ---

app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'index.html')); });
app.get('/login', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'login.html')); });
app.get('/cadastro', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'cadastro.html')); });
app.get('/dashboard-candidato', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'dashboard-candidato.html')); });
app.get('/dashboard-empresa', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'dashboard-empresa.html')); });
app.get('/buscar-talentos', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'buscar-talentos.html')); });
app.get('/vagas', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'vagas.html')); });
app.get('/admin', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'admin.html')); });
app.get('/sobre', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'sobre.html'));
});

// --- 7. ROTAS DE API (BACK-END) ---

// Autenticação
app.post('/api/cadastro', authController.cadastrar);
app.post('/api/login', authController.login);

// Perfil Candidato
app.get('/api/perfil/candidato', profileController.getPerfilCandidato);
app.post('/api/perfil/candidato', upload.single('foto'), profileController.salvarPerfilCandidato);

// Busca de Talentos
app.get('/api/talentos', searchController.listarCandidatos);

// Vagas (Empresa e Pública)
app.get('/api/minhas-vagas', vagaController.getVagasEmpresa);
app.post('/api/vaga', vagaController.salvarVaga);
app.post('/api/vaga/excluir', vagaController.excluirVaga);
app.post('/api/vaga/status', vagaController.alternarStatus);
app.get('/api/vagas/publicas', vagaController.getVagasPublicas);
// Favoritos
app.post('/api/favoritos/toggle', vagaController.toggleFavorito);
app.get('/api/favoritos/listar', vagaController.getMinhasFavoritas);
app.get('/api/favoritos/ids', vagaController.getMeusFavoritosIds);
app.get('/favoritos', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'favoritos.html'));
});

// --- ADMINISTRAÇÃO (ROTAS CORRIGIDAS) ---
// Denúncias (Usuários)
app.post('/api/denunciar/vaga', adminController.denunciarVaga);
app.post('/api/denunciar/perfil', adminController.denunciarPerfil);

// Gestão e Moderação (Painel Admin)
app.get('/api/admin/pendencias', adminController.getPendencias);
app.get('/api/admin/stats', adminController.getDashboardStats); // Stats
app.post('/api/admin/resolver-vaga', adminController.resolverVaga);
app.post('/api/admin/resolver-perfil', adminController.resolverPerfil);
app.post('/api/admin/banir-empresa', adminController.banirEmpresaPorVaga); // Banir

// Gestão de Equipe
app.post('/api/admin/criar', adminController.criarNovoAdmin);
app.get('/api/admin/listar', adminController.listarAdmins);
app.post('/api/admin/remover', adminController.removerAdmin);
app.post('/api/admin/promover', adminController.promoverAdmin); // Caso use a promoção simples

// Teste de conexão
app.get('/teste-banco', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT 1 + 1 AS solution');
        res.send(`Banco de dados conectado! A solução é: ${rows[0].solution}`);
    } catch (err) {
        res.status(500).send(`Erro ao conectar: ${err.message}`);
    }
});

// 8. INICIAR O SERVIDOR
app.listen(PORT, () => {
    console.log(`\n🚀 Servidor rodando em: http://localhost:${PORT}`);
});