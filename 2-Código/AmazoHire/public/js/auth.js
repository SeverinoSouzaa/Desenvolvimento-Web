// Espera o site carregar todo
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. LÓGICA DE URL (RECEBER E REPASSAR O TIPO) ---
    const params = new URLSearchParams(window.location.search);
    const tipoUrl = params.get('tipo'); // Pega 'CANDIDATO' ou 'EMPREGADOR' da URL

    // CENÁRIO A: ESTOU NA TELA DE LOGIN
    // Se cheguei no login com ?tipo=..., preciso passar isso para o link de "Cadastre-se"
    const loginFormExists = document.getElementById('loginForm');
    
    if (loginFormExists && tipoUrl) {
        const linkCadastro = document.querySelector('.auth-footer a');
        if (linkCadastro) {
            // Atualiza o link para levar o tipo junto para a próxima tela
            linkCadastro.href = `/cadastro?tipo=${tipoUrl}`;
        }
    }

    // CENÁRIO B: ESTOU NA TELA DE CADASTRO
    // Se cheguei no cadastro com ?tipo=..., configuro a tela automaticamente
    const cadastroFormExists = document.getElementById('cadastroForm');

    if (cadastroFormExists && tipoUrl) {
        // 1. Marca a bolinha certa
        const radioCandidato = document.querySelector('input[value="CANDIDATO"]');
        const radioEmpresa = document.querySelector('input[value="EMPREGADOR"]');
        
        if (tipoUrl === 'CANDIDATO' && radioCandidato) {
            radioCandidato.checked = true;
        } else if (tipoUrl === 'EMPREGADOR' && radioEmpresa) {
            radioEmpresa.checked = true;
        }

        // 2. Esconde a caixa de seleção (para não confundir o usuário)
        const seletorVisual = document.querySelector('.user-type-selector');
        if (seletorVisual) {
            seletorVisual.style.display = 'none';
        }
        
        // 3. Ajusta o título para ficar personalizado
        const titulo = document.querySelector('.auth-header h2');
        if(titulo) {
            titulo.innerText = tipoUrl === 'EMPREGADOR' ? 'Cadastro de Empresa' : 'Cadastro de Candidato';
        }
    }

    // --- 2. LÓGICA DE ENVIO DO CADASTRO (Seu código original) ---
    const cadastroForm = document.getElementById('cadastroForm');

    if (cadastroForm) {
        cadastroForm.addEventListener('submit', async (e) => {
            e.preventDefault(); 

            const nome = document.getElementById('nome').value;
            const email = document.getElementById('email').value;
            const senha = document.getElementById('senha').value;
            const tipo = document.querySelector('input[name="tipo"]:checked').value;

            const btnSubmit = cadastroForm.querySelector('button');
            const textoOriginal = btnSubmit.innerText;
            btnSubmit.innerText = 'Criando conta...';
            btnSubmit.disabled = true;

            try {
                const response = await fetch('/api/cadastro', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nome, email, senha, tipo })
                });

                const data = await response.json();

                if (data.sucesso) {
                    alert('✅ Conta criada com sucesso!');
                    window.location.href = '/login'; 
                } else {
                    alert('❌ ' + data.mensagem);
                    btnSubmit.innerText = textoOriginal;
                    btnSubmit.disabled = false;
                }

            } catch (error) {
                console.error(error);
                alert('Erro ao conectar com o servidor.');
                btnSubmit.innerText = textoOriginal;
                btnSubmit.disabled = false;
            }
        });
    }

    // --- 3. LÓGICA DE ENVIO DO LOGIN (Seu código original) ---
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('email').value;
            const senha = document.getElementById('senha').value;
            const btnSubmit = loginForm.querySelector('button');
            const textoOriginal = btnSubmit.innerText;

            btnSubmit.innerText = 'Entrando...';
            btnSubmit.disabled = true;

            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, senha })
                });

                const data = await response.json();

                if (data.sucesso) {
                    localStorage.setItem('usuarioAmazoHire', JSON.stringify(data.usuario));
                    
                    // Redirecionamento Inteligente
                    if (data.usuario.tipo === 'CANDIDATO') {
                        window.location.href = '/vagas';
                    } else if (data.usuario.tipo === 'EMPREGADOR') {
                        window.location.href = '/buscar-talentos';
                    } else if (data.usuario.tipo === 'ADM') {
                        window.location.href = '/admin';
                    }
                } else {
                    alert('❌ ' + data.mensagem);
                    btnSubmit.innerText = textoOriginal;
                    btnSubmit.disabled = false;
                }

            } catch (error) {
                console.error(error);
                alert('Erro de conexão.');
                btnSubmit.innerText = textoOriginal;
                btnSubmit.disabled = false;
            }
        });
    }  

    // --- 4. LÓGICA DO OLHINHO MÁGICO (Seu código original) ---
    const btnToggleSenha = document.getElementById('btnToggleSenha');
    const inputSenha = document.getElementById('senha');

    if (btnToggleSenha && inputSenha) {
        btnToggleSenha.addEventListener('click', () => {
            const tipoAtual = inputSenha.getAttribute('type');
            
            if (tipoAtual === 'password') {
                inputSenha.setAttribute('type', 'text'); // Mostra senha
                btnToggleSenha.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;
            } else {
                inputSenha.setAttribute('type', 'password'); // Esconde senha
                btnToggleSenha.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
            }
        });
    }

});