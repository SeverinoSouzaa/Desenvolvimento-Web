# PLANO DE TRABALHO

| **Nome do Projeto** | **Itacoatiara Empregos – Plataforma Local de Oportunidades** |
|---------------------|--------------------------------------------------------------|
| **Codinome**        | ITEmprega                                                    |
| **Versão**          | 1.0                                                          |
| **Status**          | Em desenvolvimento                                           |
| **Número de Controle** | 2025-001                                                  |
| **Executor Principal** | Equipe ITEmprega                                          |
| **Coordenador do Projeto** | Prof. Antonio Alberto                       |

---

# 1. INTRODUÇÃO

## 1.1 Objetivo
Este documento descreve o plano de trabalho para o desenvolvimento do sistema **Itacoatiara Empregos**, uma plataforma web informativa destinada à divulgação centralizada de vagas de emprego e oportunidades profissionais no município de Itacoatiara – AM.

O sistema tem como objetivo principal **facilitar o acesso às informações de vagas**, permitindo que empregadores publiquem oportunidades e candidatos consultem essas vagas de forma organizada, simples e confiável. Além disso, o sistema passa a oferecer um espaço de perfil profissional para candidatos, permitindo que criem um currículo online completo, visível apenas para empregadores cadastrados. Com isso, empregadores poderão buscar candidatos por área, formação, habilidades e disponibilidade, aumentando a eficiência da contratação no município.

---

## 1.2 Motivação, Justificativa e Oportunidade

Atualmente, em Itacoatiara, a divulgação de vagas ocorre majoritariamente através de grupos de WhatsApp, redes sociais ou indicações informais. Esse cenário gera diversos problemas:

- Falta de centralização das oportunidades;  
- Informações incompletas ou inconsistentes;  
- Difícil rastreamento de vagas falsas;  
- Pequenas empresas sem ferramentas profissionais para divulgar oportunidades;  
- Estudantes da UFAM com dificuldades para encontrar estágios locais.
- Vagas somem entre grupos de Facebook e WhatsApp
- Não existe um sistema oficial da cidade com filtros locais
- Pessoas com baixa escolaridade encontram dificuldade em plataformas complexas.

Diante disso, há uma **oportunidade significativa** de criar um sistema simples, funcional e acessível que centralize as informações, organize as vagas e auxilie tanto candidatos quanto empregadores.

O sistema será **informativo**: não realizará candidaturas internas. As vagas direcionarão o usuário ao método de inscrição definido pelo empregador (WhatsApp, formulário externo, email, link etc.).

---

## 1.3 Caracterização do Projeto

### Classe
Projeto de software web informativo, com foco em organização, filtragem e exibição de vagas de emprego locais.

### Enquadrabilidade
Sistema web responsivo acessível via navegador, utilizando tecnologias compatíveis com desktop e mobile.

### Tipo
Aplicação informativa com painel administrativo para moderação de vagas, voltada para fins didáticos e demonstração funcional.

---

# 2. INFORMAÇÕES GERAIS

## 2.1 Escopo Geral
O sistema terá como escopo fornecer uma plataforma onde:

- Empresas possam cadastrar vagas;  
- Administradores possam revisar e aprovar as vagas;  
- Candidatos possam acessar e filtrar oportunidades;  
- Vagas redirecionem os candidatos para o método correto de inscrição informado pelo empregador.
- Candidatos poderão criar um perfil profissional completo, visível apenas para empregadores autorizados.
- Empregadores poderão buscar candidatos por filtros específicos (área, experiência, disponibilidade).

---

## 2.2 Escopo Específico (Requisitos Funcionais, Não Funcionais e Regras de Negócio)

### **1) Requisitos Funcionais (RF)**  
O sistema deve permitir:

**RF01.** Cadastrar usuários (candidatos e empregadores).  
**RF02.** Login e autenticação de usuários.  
**RF03.** Empregadores cadastrarem vagas com:  
- título, descrição, requisitos, salário, benefícios, bairro, tipo, link de candidatura
  
**RF04.** Listagem pública de vagas para todos os usuários.  
**RF05.** Filtros de vagas por: bairro, área, tipo, faixa salarial, modalidade.  
**RF06.** Exibição completa dos detalhes de uma vaga.  
**RF07.** Direcionamento externo para candidatura (WhatsApp, formulário, link, email).  
**RF08.** Área do empregador para:  
- editar vagas  
- excluir vagas  
- pausar vagas
   
**RF09.** Área do administrador para:  
- aprovar ou rejeitar vagas  
- modificar ou remover vagas inadequadas  
- gerenciar usuários
  
**RF10.** Sistema de notificações por email (opcional).  

**RF11.** Candidatos podem criar um perfil profissional com:
- dados pessoais básicos
- foto opcional
- habilidades
- experiências
- formação acadêmica
- área de interesse
- meios de contato (email/WhatsApp profissional)

**RF12.** Empregadores podem acessar um módulo de busca de candidatos.

**RF13.** Empregadores podem filtrar candidatos por:
- área profissional
- nível de experiência
- formação
- disponibilidade

**RF14.** Sistema de moderação para aprovar perfis suspeitos ou incompletos.

---

### **2) Requisitos Não Funcionais (RNF)**

**RNF01.** O sistema deve ser responsivo (desktop e mobile).  
**RNF02.** O sistema deve ser desenvolvido em Node.js + Express + MySQL.  
**RNF03.** Interface simples, intuitiva e acessível.  
**RNF04.** Dados devem ser armazenados com segurança no banco MySQL.  
**RNF05.** O sistema deve possuir desempenho suficiente para carregar vagas rapidamente.  
**RNF06.** O painel administrativo deve ser acessível apenas por usuários autorizados.  
**RNF07.** Todas as páginas devem carregar em menos de 2 segundos em ambiente local.  
**RNF08.** Perfis de candidatos devem ter visibilidade controlada (não públicos).
**RNF09.** Dados sensíveis devem ser protegidos por autenticação e níveis de permissão.

---

### **3) Regras de Negócio (RN)**

**RN01.** Toda vaga cadastrada deve permanecer “Pendente” até aprovação do administrador.  
**RN02.** O sistema não realiza candidaturas internas; apenas redireciona o candidato.  
**RN03.** Vagas com informações incompletas não serão aprovadas.  
**RN04.** Empregadores não podem visualizar dados de candidatos pelo sistema.  
**RN05.** Apenas administradores podem excluir vagas suspeitas.  
**RN06.** Informações de contato do empregador são obrigatórias.  
**RN07.** Perfis de candidatos só podem ser visualizados por empregadores cadastrados
**RN08.** Candidatos não podem enviar mensagens pelo sistema; o contato é sempre externo.
**RN09.** Perfis com informações falsas ou incompletas serão suspensos pelo moderador.

---

## 2.3 Escopo Negativo (o que não será implementado)

- Sistema de candidatura interna pelo aplicativo;  
- Envio de currículos pelo sistema;  
- Chat entre candidato e empregador;  
- Algoritmos de recomendação inteligente;  
- Aplicações mobile nativas;  
- Integração com APIs externas (LinkedIn, Indeed etc.).
- Sistema não exibirá currículo público; somente empregadores autorizados podem visualizar perfis.
- Não haverá contato interno entre empresa e candidato (somente WhatsApp/email).

---

## 2.4 Ambiente de Desenvolvimento
- **Backend:** Node.js, Express  
- **Frontend:** HTML, CSS, JavaScript  
- **Banco:** MySQL  
- **Ferramentas:** VSCode, GitHub, Figma (prototipação), Draw.io (diagramas)  
- **Execução:** Navegador local (localhost)  

---

## 2.5 Características Inovadoras do Projeto
- Foco hiperlocal (somente vagas de Itacoatiara-AM)  
- Ferramenta simples que atende micro e pequenas empresas  
- Sistema padronizado de apresentação de vagas  
- Moderação centralizada para reduzir anúncios falsos  
- Filtros específicos por bairro e perfil local
- Primeiro sistema da cidade que permite empresas buscarem candidatos locais filtrados.
- Perfis profissionais validados garantem segurança e confiança.
- Empregadores podem encontrar talentos rapidamente, sem necessidade de grupos ou indicações.

---

## 2.6 Resultados Esperados
- Plataforma funcional para consulta de vagas da cidade  
- Sistema organizado, seguro e de fácil navegação  
- Processo de divulgação mais profissional para empregadores  
- Redução da desinformação e aumento da confiabilidade  

---

# 3. ESTRATÉGIA DE DESENVOLVIMENTO

## 3.1 Metodologia
O desenvolvimento seguirá uma abordagem incremental com entregas por ciclos (iterações quinzenais).

## 3.2 Ciclos/Iterações

**Iteração 1 – Estrutura Básica:**  
- Cadastro/login  
- CRUD de vagas para empregadores  
- Listagem pública das vagas  

**Iteração 2 – Moderação e Painel Admin:**  
- Aprovação/rejeição de vagas  
- Sistema de status  
- Notificações simples  

**Iteração 3 – Melhoria da Usabilidade:**  
- Filtros de busca  
- Interface responsiva  
- Perfis de usuários  

**Iteração 4 – Estabilização e entrega final:**  
- Correções  
- Documentação  
- Prototipação final  
- Testes  

---

## 3.3 Critérios de Aceitação
- Vaga só aparece ao público após aprovação.  
- Empregador consegue cadastrar, editar, pausar e excluir vagas.  
- Candidato consegue consultar e acessar links de candidatura.  
- Sistema deve estar funcionando localmente no navegador.  


