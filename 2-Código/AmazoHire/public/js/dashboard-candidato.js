const usuarioLogado = JSON.parse(localStorage.getItem('usuarioAmazoHire'));
let vaiRemoverFoto = false;

// Verificação de Login
if (!usuarioLogado || usuarioLogado.tipo !== 'CANDIDATO') {
    window.location.href = '/login';
}

document.getElementById('displayNome').innerText = usuarioLogado.nome;

function logout() {
    localStorage.clear();
    window.location.href = '/';
}

// Alternar entre Visualização e Edição
function alternarModoEdicao(editar) {
    const view = document.getElementById('modoVisualizacao');
    const form = document.getElementById('perfilForm');
    const btnEditar = document.getElementById('btnEditar');

    if (editar) {
        view.style.display = 'none';
        form.style.display = 'grid';
        btnEditar.style.display = 'none';
    } else {
        view.style.display = 'grid';
        form.style.display = 'none';
        btnEditar.style.display = 'inline-block';
        window.scrollTo(0, 0);
    }
}

// Carregar Dados do Perfil
async function carregarDados() {
    try {
        vaiRemoverFoto = false; // Reseta variável de remoção
        document.getElementById('avisoFoto').style.display = 'none';
        
        const response = await fetch(`/api/perfil/candidato?idUsuario=${usuarioLogado.id}`);
        const data = await response.json();

        if (data.sucesso) {
            const d = data.dados;
            
            // VISUALIZAÇÃO
            document.getElementById('displayArea').innerText = d.areaInteresse || 'Área não definida';
            document.getElementById('displayLocal').innerText = `${d.cidade || ''} - ${d.estado || ''}`;
            document.getElementById('viewBio').innerText = d.miniBio || 'Escreva sobre você...';
            document.getElementById('viewFormacao').innerText = d.formacao || '-';
            document.getElementById('viewXp').innerText = d.experiencias || '-';
            document.getElementById('viewZap').innerText = d.whatsappProf || '-';
            document.getElementById('viewPortfolio').href = d.linkPortfolio || '#';
            
            if(d.habilidades) {
                const skills = d.habilidades.split(',');
                document.getElementById('viewSkills').innerHTML = skills.map(s => `<span class="skill-tag">${s.trim()}</span>`).join('');
            }

            // FOTO DE PERFIL
            if(d.fotoPerfil) {
                document.getElementById('avatarImg').src = `/uploads/${d.fotoPerfil}`;
                document.getElementById('btnRemoverFoto').style.display = 'inline-flex'; // Mostra botão
            } else {
                document.getElementById('avatarImg').src = '/img/user-placeholder.jpg'; // Caminho absoluto para garantir
                document.getElementById('btnRemoverFoto').style.display = 'none';
            }

            // PREENCHER FORMULÁRIO
            if(d.areaInteresse) document.getElementById('areaInteresse').value = d.areaInteresse;
            if(d.miniBio) document.getElementById('miniBio').value = d.miniBio;
            if(d.habilidades) document.getElementById('habilidades').value = d.habilidades;
            if(d.whatsappProf) document.getElementById('whatsappProf').value = d.whatsappProf;
            if(d.linkPortfolio) document.getElementById('linkPortfolio').value = d.linkPortfolio;
            if(d.rua) document.getElementById('rua').value = d.rua;
            if(d.cidade) document.getElementById('cidade').value = d.cidade;
            if(d.estado) document.getElementById('estado').value = d.estado;
            if(d.cep) document.getElementById('cep').value = d.cep;
            if(d.bairro) document.getElementById('bairro').value = d.bairro;
            if(d.numero) document.getElementById('numero').value = d.numero;
            if(d.formacao) document.getElementById('formacao').value = d.formacao;
            if(d.experiencias) document.getElementById('experiencias').value = d.experiencias;
        }
    } catch (error) {
        console.error('Erro ao carregar perfil:', error);
    }
}

// SALVAR PERFIL (Com a correção de limpar o nome do arquivo)
document.getElementById('perfilForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('idUsuario', usuarioLogado.id);
    formData.append('areaInteresse', document.getElementById('areaInteresse').value);
    formData.append('miniBio', document.getElementById('miniBio').value);
    formData.append('habilidades', document.getElementById('habilidades').value);
    formData.append('whatsappProf', document.getElementById('whatsappProf').value);
    formData.append('linkPortfolio', document.getElementById('linkPortfolio').value);
    formData.append('rua', document.getElementById('rua').value);
    formData.append('numero', document.getElementById('numero').value);
    formData.append('bairro', document.getElementById('bairro').value);
    formData.append('cidade', document.getElementById('cidade').value);
    formData.append('estado', document.getElementById('estado').value);
    formData.append('cep', document.getElementById('cep').value);
    formData.append('formacao', document.getElementById('formacao').value);
    formData.append('experiencias', document.getElementById('experiencias').value);
    formData.append('removerFoto', vaiRemoverFoto);

    const fileInput = document.getElementById('fotoPerfil');
    if (fileInput.files[0]) {
        formData.append('foto', fileInput.files[0]);
        formData.set('removerFoto', false);
    }

    try {
        const response = await fetch('/api/perfil/candidato', {
            method: 'POST',
            body: formData 
        });

        const result = await response.json();
        if (result.sucesso) {
            alert('✅ Perfil salvo!');
            
            // --- AQUI ESTÁ A CORREÇÃO: LIMPAR O TEXTO DO ARQUIVO ---
            document.getElementById('fotoPerfil').value = ""; // Limpa o input invisível
            
            const spanArquivo = document.getElementById('nomeArquivo');
            if(spanArquivo) {
                spanArquivo.innerText = "Nenhum arquivo novo selecionado";
                spanArquivo.style.color = "#666";
                spanArquivo.style.fontWeight = "400";
            }
            // -------------------------------------------------------

            alternarModoEdicao(false);
            carregarDados(); 
        } else {
            alert('Erro ao salvar.');
        }
    } catch (error) {
        console.error(error);
        alert('Erro de conexão.');
    }
});

// Botão Remover Foto
document.getElementById('btnRemoverFoto').addEventListener('click', () => {
    vaiRemoverFoto = true;
    document.getElementById('btnRemoverFoto').style.display = 'none';
    document.getElementById('avisoFoto').style.display = 'block';
    
    // Limpa se tiver selecionado algo antes de remover
    document.getElementById('fotoPerfil').value = ''; 
    mostrarNomeArquivo(); // Atualiza o texto para "Nenhum..."
});

// Botão Cancelar
function cancelarEdicao() {
    // Também limpa o texto se cancelar
    document.getElementById('fotoPerfil').value = "";
    mostrarNomeArquivo();
    
    alternarModoEdicao(false);
    carregarDados();
}

// --- FUNÇÕES AUXILIARES ---

function mostrarNomeArquivo() {
    const input = document.getElementById('fotoPerfil');
    const span = document.getElementById('nomeArquivo');
    
    if (input.files && input.files.length > 0) {
        span.innerText = "Selecionado: " + input.files[0].name;
        span.style.color = "var(--color-primary)";
        span.style.fontWeight = "600";
    } else {
        span.innerText = "Nenhum arquivo novo selecionado";
        span.style.color = "#666";
        span.style.fontWeight = "400";
    }
}

// Inicializa
carregarDados();