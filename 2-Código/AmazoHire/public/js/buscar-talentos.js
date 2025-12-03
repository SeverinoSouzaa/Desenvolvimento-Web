let todosCandidatos = [];

function logout() {
    localStorage.clear();
    window.location.href = '/';
}

document.addEventListener('DOMContentLoaded', () => {
    carregarTalentos();
    
    // Filtro em tempo real
    document.getElementById('campoBusca').addEventListener('input', filtrar);
    
    // Configura fechar modal
    const modal = document.getElementById('modalPerfil');
    if(modal) {
        document.querySelector('.close-modal').onclick = () => modal.style.display = "none";
        window.onclick = (e) => { if(e.target == modal) modal.style.display = "none"; }
    }
});

async function carregarTalentos() {
    const container = document.getElementById('listaCandidatos');
    try {
        const response = await fetch('/api/talentos');
        const data = await response.json();
        
        if(data.sucesso) {
            todosCandidatos = data.candidatos;
            renderizar(todosCandidatos);
        }
    } catch (error) {
        container.innerHTML = '<p>Erro ao carregar talentos.</p>';
    }
}

function renderizar(lista) {
    const container = document.getElementById('listaCandidatos');
    container.innerHTML = '';

    if (lista.length === 0) {
        container.innerHTML = '<p>Nenhum profissional encontrado.</p>';
        return;
    }

    lista.forEach(c => {
        const fotoUrl = c.fotoPerfil ? `/uploads/${c.fotoPerfil}` : '/img/user-placeholder.jpg';
        const skills = c.habilidades ? c.habilidades.split(',').slice(0, 3) : []; 

        const div = document.createElement('div');
        div.className = 'job-card candidate-card'; 
        
        // Transformamos o objeto em string para passar pro Modal
        const jsonString = JSON.stringify(c).replace(/'/g, "&apos;").replace(/"/g, "&quot;");

        div.innerHTML = `
            <div style="text-align: center; margin-bottom: 15px;">
                <img src="${fotoUrl}" class="card-avatar" onerror="this.src='/img/user-placeholder.png'">
                <h3 style="margin-top: 10px;">${c.nome}</h3>
                <p class="job-company">${c.areaInteresse || 'Área não informada'}</p>
            </div>
            
            <div class="skills-preview">
                ${skills.map(s => `<span class="skill-tag-mini">${s.trim()}</span>`).join('')}
            </div>

            <button class="btn btn-outline mt-20" onclick='abrirPerfil(${jsonString})'>Ver Perfil Completo</button>
        `;
        container.appendChild(div);
    });
}

function filtrar() {
    const termo = document.getElementById('campoBusca').value.toLowerCase();
    
    const filtrados = todosCandidatos.filter(c => {
        const nome = c.nome.toLowerCase();
        const area = (c.areaInteresse || '').toLowerCase();
        const skills = (c.habilidades || '').toLowerCase();
        
        return nome.includes(termo) || area.includes(termo) || skills.includes(termo);
    });
    
    renderizar(filtrados);
}

// --- FUNÇÃO ATUALIZADA: ABRIR PERFIL (COM BOTÃO DENUNCIAR AJUSTADO) ---
window.abrirPerfil = function(c) {
    const modal = document.getElementById('modalPerfil');
    
    // Preenche dados
    document.getElementById('mNome').innerText = c.nome;
    document.getElementById('mArea').innerText = c.areaInteresse || 'Não informado';
    document.getElementById('mLocal').innerText = `${c.cidade || ''} - ${c.estado || ''}`;
    document.getElementById('mBio').innerText = c.miniBio || 'Sem descrição.';
    document.getElementById('mFormacao').innerText = c.formacao || '-';
    document.getElementById('mXp').innerText = c.experiencias || '-';
    
    // Foto
    const fotoUrl = c.fotoPerfil ? `/uploads/${c.fotoPerfil}` : '/img/user-placeholder.png';
    const imgModal = document.getElementById('mFoto');
    imgModal.src = fotoUrl;
    imgModal.onerror = function() { this.src = '/img/user-placeholder.jpg'; };

    // Skills
    const skillsContainer = document.getElementById('mSkills');
    if(c.habilidades) {
        skillsContainer.innerHTML = c.habilidades.split(',').map(s => `<span class="skill-tag">${s.trim()}</span>`).join('');
    } else {
        skillsContainer.innerHTML = '-';
    }

    // Botões de Contato
    let buttonsHtml = '';
    if (c.whatsappProf) {
        const msg = `Olá ${c.nome}, vi seu perfil no AmazoHire e gostaria de conversar.`;
        const link = `https://api.whatsapp.com/send?phone=55${c.whatsappProf}&text=${encodeURIComponent(msg)}`;
        buttonsHtml += `<a href="${link}" target="_blank" class="btn btn-outline">WhatsApp</a>`;
    }
    
    buttonsHtml += `<a href="mailto:${c.email}" class="btn btn-outline">Enviar E-mail</a>`;
    
    if (c.linkPortfolio) {
        buttonsHtml += `<a href="${c.linkPortfolio}" target="_blank" class="btn btn-outline">Ver Portfólio</a>`;
    }

    // --- RODAPÉ COM LINHA E DENÚNCIA PADRONIZADA ---
    const footerDiv = document.querySelector('#modalPerfil .modal-footer');
    footerDiv.innerHTML = `
        <h3>Entrar em contato:</h3>
        <div id="areaContato" class="apply-buttons">
            ${buttonsHtml}
        </div>

        <hr style="margin: 20px 0; border: 0; border-top: 1px solid #eee;">

        <div>
            <button onclick="denunciarPerfil(${c.idPerfil})" class="btn-hover-danger">
                Denunciar Perfil
            </button>
        </div>
    `;

    modal.style.display = 'flex';
}

async function denunciarPerfil(idPerfilDenunciado) {
    const motivo = prompt("Qual o motivo da denúncia?");
    if (!motivo) return;

    const usuario = JSON.parse(localStorage.getItem('usuarioAmazoHire'));
    if (!usuario) return alert('Faça login.');

    try {
        await fetch('/api/denunciar/perfil', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idPerfilDenunciado, idAutor: usuario.id, motivo })
        });
        alert('Denúncia enviada.');
    } catch(e) {
        alert('Erro ao enviar.');
    }
}