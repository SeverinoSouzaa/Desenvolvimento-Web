# AmazoHire

Sistema de gestão de vagas e currículos desenvolvido como trabalho acadêmico.
O sistema permite que empresas publiquem vagas e candidatos cadastrem currículos e se candidatem.

## Tecnologias Utilizadas

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Backend:** Node.js, Express
- **Banco de Dados:** MySQL
- **Outros:** Multer (Uploads), BCrypt (Segurança), Nodemon.


## Como Rodar o Projeto

### 1. Clonar o repositório

- Vá para a página inicial do repositório no GitHub (Desenvolvimento-Web).
- Procure um botão verde chamado <> Code.
- Clique nele e escolha a opção Download ZIP.
- O navegador vai baixar um arquivo chamado Desenvolvimento-Web-main.zip
- Extrair o arquivo zipado no computador
- Abra o vs code e procure a pasta com os código: Desenvolvimento web - 2-Código - AmazoHire (essa ultima)
- Subir ela no vs code.
---
### 2. Dependências e Configurações

Abra o terminal do vscode e baixe as dependências: 

* npm init -y
* npm install express mysql2 dotenv body-parser cors
* npm install --save-dev nodemon
* npm install bcryptjs

ou 
* npm install

- Abra o arquivo .env.example e renomeie para: .env
- Coloque a sua senha do banco Workbench em DB_PASS
- Abra o arquivo database.sql, Copie todo o conteúdo e Execute no seu MySQL Workbench para criar o banco "amazohire" e as tabelas.

Por fim, inicie o servidor
- npm start

---

### 3. Instrução para Inserir um user admin e testar sua tela

- Crie um cadastro com: Nome: Super Admin, email: admin2@teste.com, senha: 123456

Rodar esse código no workbench:

USE amazohire;

-- 1. Descobre o ID do usuário que você acabou de criar e muda o tipo dele
UPDATE usuario 
SET tipo = 'ADM' 
WHERE email = 'admin2@teste.com';

-- 2. Insere ele na tabela de ADM (Vincula os poderes)
INSERT INTO adm (idUsuario, cargo, nivelAcesso, permissao)
SELECT idUsuario, 'Moderador', 'GERAL', 'MASTER'
FROM usuario
WHERE email = 'admin2@teste.com';
