-- 1. Criação do Schema
DROP DATABASE IF EXISTS amazohire;
CREATE DATABASE amazohire;
USE amazohire;

-- 2. Tabela de Usuários (Login)
CREATE TABLE usuario (
    idUsuario INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senhaHash VARCHAR(255) NOT NULL,
    tipo ENUM('CANDIDATO', 'EMPREGADOR', 'ADM') NOT NULL,
    status ENUM('ATIVO', 'INATIVO', 'SUSPENSO') DEFAULT 'ATIVO',
    dataCadastro DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabela de Endereços (Usada por Perfis)
CREATE TABLE endereco (
    idEndereco INT AUTO_INCREMENT PRIMARY KEY,
    rua VARCHAR(100),
    numero VARCHAR(20),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    estado CHAR(2),
    cep VARCHAR(10),
    complemento VARCHAR(100)
);

-- 4. Tabela de Admin (Com a correção da coluna 'permissao')
CREATE TABLE adm (
    idAdm INT AUTO_INCREMENT PRIMARY KEY,
    idUsuario INT NOT NULL,
    cargo VARCHAR(50),
    nivelAcesso VARCHAR(50),
    qtdeDenunciasAvaliadas INT DEFAULT 0,
    permissao VARCHAR(50), -- Coluna adicionada durante os ajustes
    FOREIGN KEY (idUsuario) REFERENCES usuario(idUsuario) ON DELETE CASCADE
);

-- 5. Perfil do Empregador
CREATE TABLE empregador_perfil (
    idEmpresa INT AUTO_INCREMENT PRIMARY KEY,
    idUsuario INT NOT NULL,
    idEndereco INT,
    nomeEmpresa VARCHAR(100) NOT NULL,
    descricaoNegocio TEXT,
    whatsappContato VARCHAR(20),
    emailContato VARCHAR(100),
    FOREIGN KEY (idUsuario) REFERENCES usuario(idUsuario) ON DELETE CASCADE,
    FOREIGN KEY (idEndereco) REFERENCES endereco(idEndereco)
);

-- 6. Perfil do Candidato (Com a coluna de Foto adicionada)
CREATE TABLE candidato_perfil (
    idPerfil INT AUTO_INCREMENT PRIMARY KEY,
    idUsuario INT NOT NULL,
    idEndereco INT,
    habilidades TEXT,
    experiencias TEXT,
    formacao TEXT,
    areaInteresse VARCHAR(100),
    miniBio TEXT,
    whatsappProf VARCHAR(20),
    linkPortfolio VARCHAR(255),
    visibilidade BOOLEAN DEFAULT TRUE,
    fotoPerfil VARCHAR(255), -- Coluna adicionada para a foto
    FOREIGN KEY (idUsuario) REFERENCES usuario(idUsuario) ON DELETE CASCADE,
    FOREIGN KEY (idEndereco) REFERENCES endereco(idEndereco)
);

-- 7. Áreas Profissionais
CREATE TABLE area_profissional (
    idArea INT AUTO_INCREMENT PRIMARY KEY,
    nomeArea VARCHAR(100) NOT NULL,
    descricao TEXT
);

-- 8. Vagas (Com todas as atualizações de Endereço e Contato)
CREATE TABLE vaga (
    idVaga INT AUTO_INCREMENT PRIMARY KEY,
    idEmpresa INT NOT NULL,
    idArea INT NOT NULL,
    titulo VARCHAR(100) NOT NULL,
    descricao TEXT NOT NULL,
    requisitos TEXT,
    salario DECIMAL(10,2),
    beneficios TEXT,
    tipoContratacao VARCHAR(50),
    modalidade VARCHAR(50),
    linkCandidaturaExterno VARCHAR(255),
    
    -- Campos adicionados durante o projeto:
    emailCandidatura VARCHAR(100),
    whatsappCandidatura VARCHAR(20),
    
    -- Campos de Localização Específica da Vaga:
    cidade VARCHAR(100),
    estado VARCHAR(2),
    bairro VARCHAR(100), -- Já existia, mas agora é usado junto com os outros
    rua VARCHAR(255),
    
    status ENUM('ATIVA', 'PAUSADA', 'ENCERRADA', 'BLOQUEADA') DEFAULT 'ATIVA',
    dataPublicacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (idEmpresa) REFERENCES empregador_perfil(idEmpresa),
    FOREIGN KEY (idArea) REFERENCES area_profissional(idArea)
);

-- 9. Favoritos
CREATE TABLE favorito (
    idFavorito INT AUTO_INCREMENT PRIMARY KEY,
    idCandidato INT NOT NULL,
    idVaga INT NOT NULL,
    dataFavorito DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idCandidato) REFERENCES candidato_perfil(idPerfil) ON DELETE CASCADE,
    FOREIGN KEY (idVaga) REFERENCES vaga(idVaga) ON DELETE CASCADE
);

-- 10. Denúncias de Vaga
CREATE TABLE denuncia_vaga (
    idDenunciaVaga INT AUTO_INCREMENT PRIMARY KEY,
    idVaga INT NOT NULL,
    idAutor INT NOT NULL,
    motivo VARCHAR(255) NOT NULL,
    status ENUM('PENDENTE', 'ACEITA', 'REJEITADA') DEFAULT 'PENDENTE',
    dataDenuncia DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idVaga) REFERENCES vaga(idVaga) ON DELETE CASCADE,
    FOREIGN KEY (idAutor) REFERENCES usuario(idUsuario)
);

-- 11. Denúncias de Perfil
CREATE TABLE denuncia_perfil (
    idDenunciaPerfil INT AUTO_INCREMENT PRIMARY KEY,
    idPerfilDenunciado INT NOT NULL,
    idAutor INT NOT NULL,
    motivo VARCHAR(255) NOT NULL,
    status ENUM('PENDENTE', 'ACEITA', 'REJEITADA') DEFAULT 'PENDENTE',
    dataDenuncia DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idPerfilDenunciado) REFERENCES candidato_perfil(idPerfil) ON DELETE CASCADE,
    FOREIGN KEY (idAutor) REFERENCES usuario(idUsuario)
);

-- =======================================================
-- DADOS INICIAIS (Executar para popular o sistema)
-- =======================================================

-- Inserir Áreas Padrão
INSERT INTO area_profissional (nomeArea, descricao) VALUES 
('Tecnologia', 'Desenvolvimento, Redes e Suporte'),
('Saúde', 'Médicos, Enfermeiros e Técnicos'),
('Administrativo', 'RH, Financeiro e Secretaria'),
('Vendas', 'Comercial e Atendimento'),
('Engenharia', 'Civil, Elétrica e Mecânica');

-- Inserir o PRIMEIRO ADMIN (Super Admin)
-- Email: admin@amazohire.com
-- Senha: 123456 (Hash gerado)
INSERT INTO usuario (nome, email, senhaHash, tipo, status) 
VALUES ('Super Admin', 'admin@amazohire.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuban.uyv8a2.M.Uu4gJ/8.J1/e.l/Ddm', 'ADM', 'ATIVO');

-- Vincular o Admin na tabela correta
INSERT INTO adm (idUsuario, cargo, nivelAcesso, permissao)
VALUES (LAST_INSERT_ID(), 'Moderador Chefe', 'GERAL', 'MASTER');