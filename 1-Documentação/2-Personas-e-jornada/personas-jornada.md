# PERSONAS E JORNADAS

Este documento apresenta as personas principais e suas jornadas dentro do sistema **Itacoatiara Empregos**. O objetivo é compreender o perfil dos usuários e como cada um deles interage com a plataforma.

---

# 1. Persona: João – O Candidato

**Nome:** João Silva  
**Idade:** 21 anos  
**Ocupação:** Estudante da UFAM – Ciência da Computação  
**Objetivo:** Encontrar vagas e estágios locais, sem precisar entrar em dezenas de grupos no WhatsApp.  
**Dores:**  
- Vagas espalhadas e difíceis de organizar;  
- Falta de informações claras;  
- Publicações confusas em redes sociais;  
- Pouco tempo para ficar procurando em vários lugares.  

---

## Jornada do Usuário (Candidato)

### **Acesso:**
- Acessa o site pelo celular 
- Cria um cadastro para montar um perfil de candidato (não se cadastrar caso so queira ver vagas)

---

## Funcionalidades Disponíveis para o Candidato

### 1. **Consultar vagas**
- Buscar vagas por título  
- Filtrar por:
  - bairro  
  - tipo  
  - modalidade  
  - salário  
  - área  

### 2. **Visualizar detalhes**
- título  
- descrição  
- requisitos  
- salário  
- benefícios  
- local  
- empresa  
- link de candidatura (WhatsApp, formulário externo, email ou telefone)

### 3. **Favoritar vagas** *(se estiver logado)*

### 4. **Criar Conta (Opcional)**
- Para salvar vagas e criar um perfil profissional 
- Confirmação por email  

### 5. **Editar Perfil**
- nome  
- telefone  
- interesses profissionais

### 6. Criar Perfil Profissional Completo
- adicionar formação
- adicionar experiências anteriores
- habilidades técnicas e comportamentais
- área de interesse
- mini-biografia
- link para portfólio (se houver)
- WhatsApp e email profissional

---

# 2. Persona: Maria – A Empregadora

**Nome:** Maria de Lourdes  
**Idade:** 43 anos  
**Ocupação:** Proprietária de um minimercado  
**Objetivo:** Divulgar vagas de forma fácil e organizada  
**Dores:**  
- Não sabe criar artes ou anúncios  
- Gasta tempo respondendo mensagens repetidas  
- Redes sociais confundem candidatos  
- Quer centralização e praticidade  

---

## Jornada do Usuário (Empregador)

### **Acesso:**
- Necessita de cadastro para publicar vagas  
- Acessa via celular ou desktop  

---

## Funcionalidades do Empregador

### 1. **Cadastrar Vaga**
Campos:
- título  
- descrição  
- requisitos  
- salário  
- benefícios  
- bairro  
- tipo de contratação  
- modalidade  
- contato para candidatura (link externo, WhatsApp, email, formulário)  

*A vaga fica com status “Pendente”.*

---

### 2. **Gerenciar Vagas**
- Editar  
- Excluir  
- Pausar  
- Duplicar vaga  
- Visualizar status (Aprovada, Pendente, Rejeitada)

---

### 3. **Perfil da Empresa**
- nome  
- email  
- whatsapp  
- endereço (bairro)  
- breve descrição do negócio

### 4. Buscar Candidatos
- acessar módulo exclusivo
- filtrar por: área profissional, formação, experiência e disponibilidade
- visualizar lista com perfis
- abrir perfil completo
- entrar em contato com o candidato via WhatsApp ou email

---

# 3. Persona: Fernanda – A Administradora/Moderadora

**Nome:** Fernanda Oliveira  
**Idade:** 28 anos  
**Ocupação:** Analista de RH e responsável pela moderação das vagas  
**Objetivo:** Garantir que apenas vagas reais e completas apareçam no sistema  
**Dores:**  
- Muitas vagas falsas circulando na cidade  
- Empregadores postam informações incompletas  
- Necessidade de padronização  

---

## Jornada da Administradora

### **Acesso:**
- Login restrito  
- Painel separado do público  

---

## Funcionalidades do Administrador

### 1. **Aprovar Vagas**
- Avaliar descrição  
- Verificar dados de contato  
- Aprovar ou rejeitar  
- Enviar email automático explicando motivo da rejeição  

### 2. **Gerenciar Conteúdo**
- Editar vagas  
- Remover vagas suspeitas  
- Pausar vagas  
- Bloquear usuários com comportamento inadequado  

### 3. **Painel de Monitoramento**
- total de vagas  
- vagas por status  
- empresas ativas  
- últimas atividades

### 4. Moderação de Perfis de Candidatos
- avaliar perfis antes de liberar para empregadores
- aprovar, rejeitar ou solicitar ajustes
- bloquear perfis falsos

---

# Resumo Geral das Ações por Persona

| Funcionalidade | Candidato | Empregador | Administrador |
|----------------|-----------|------------|---------------|
| Criar conta | Opcional | Obrigatório | Obrigatório |
| Consultar vagas | ✔ | ✔ | ✔ |
| Filtrar vagas | ✔ | ✔ | ✔ |
| Ver detalhes da vaga | ✔ | ✔ | ✔ |
| Cadastrar vaga | — | ✔ | — |
| Editar vaga | — | ✔ | ✔ |
| Excluir vaga | — | ✔ | ✔ |
| Moderação | — | — | ✔ |
| Acesso a painel próprio | ✔ (simples) | ✔ (vagas) | ✔ (admin) |
| Ver links externos para candidatura | ✔ | ✔ | ✔ |
| Criar perfil profissional | ✔ | — | ✔ (aprova) |
| Buscar candidatos | — | ✔ | ✔ |
| Visualizar perfis | — | ✔ | ✔ |
| Moderação de perfis | — | — | ✔ |



