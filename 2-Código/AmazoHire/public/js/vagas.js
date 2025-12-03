let todasAsVagas = [];
let meusFavoritos = []; // Lista de IDs favoritados

document.addEventListener('DOMContentLoaded', () => {
    verificarLogin();
    carregarVagas();
    configurarFiltros();
    configurarModal();
});

function verificarLogin() {
    const usuario = JSON.parse(localStorage.getItem('usuarioAmazoHire'));
    const navLinks = document.getElementById('navLinks');

    if (usuario) {
        // --- USUÁRIO LOGADO ---
        let dashboardLink = '/dashboard-candidato';
        if (usuario.tipo === 'EMPREGADOR') dashboardLink = '/buscar-talentos';
        if (usuario.tipo === 'ADM') dashboardLink = '/admin';

        // Se for candidato, adiciona o botão Salvos
        let botoesExtras = '';
        if(usuario.tipo === 'CANDIDATO') {
            botoesExtras = `<a href="/favoritos" class="btn-nav">Salvos</a>`;
        }

        navLinks.innerHTML = `
            <div style="display: flex; gap: 10px; align-items: center;">
                ${botoesExtras}
                <a href="${dashboardLink}" class="btn-nav">Meu Painel</a>
                <button onclick="logout()" class="btn-nav">Sair</button>
            </div>
        `;
        
        // Carrega favoritos se for candidato
        if(usuario.tipo === 'CANDIDATO') carregarFavoritosIds();

    } else {
        // --- USUÁRIO NÃO LOGADO (VISITANTE) ---
        navLinks.innerHTML = `
            <div style="display: flex; gap: 10px; align-items: center;">
                <a href="/" class="btn-nav">Voltar ao Início</a>
                <a href="/login" class="btn-nav">Login / Cadastrar</a>
            </div>
        `;
    }
}

async function carregarFavoritosIds() {
    const usuario = JSON.parse(localStorage.getItem('usuarioAmazoHire'));
    if(!usuario) return;
    try {
        const res = await fetch(`/api/favoritos/ids?idUsuario=${usuario.id}`);
        const data = await res.json();
        meusFavoritos = data.ids;
        renderizarVagas(todasAsVagas);
    } catch(e) {}
}

async function carregarVagas() {
    const container = document.getElementById('listaVagasPublicas');
    try {
        const response = await fetch('/api/vagas/publicas');
        const data = await response.json();
        todasAsVagas = data.vagas;
        renderizarVagas(todasAsVagas);
    } catch (error) {
        container.innerHTML = '<p>Erro ao carregar oportunidades.</p>';
    }
}

function renderizarVagas(lista) {
    const container = document.getElementById('listaVagasPublicas');
    container.innerHTML = '';

    if (lista.length === 0) {
        container.innerHTML = '<p>Nenhuma vaga encontrada.</p>';
        return;
    }

    const usuario = JSON.parse(localStorage.getItem('usuarioAmazoHire'));
    const isCandidato = usuario && usuario.tipo === 'CANDIDATO';

    lista.forEach(vaga => {
        const div = document.createElement('div');
        div.className = 'job-card';
        div.style.display = 'flex';
        div.style.flexDirection = 'column';
        div.style.justifyContent = 'space-between';
        
        const salarioTexto = vaga.salario 
            ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(vaga.salario) 
            : 'A combinar';
        
        // Limpeza do Local (Cabeçalho do Card)
        let textoLocal = "";
        if (vaga.cidade && vaga.estado) {
            textoLocal = ` - ${vaga.cidade}/${vaga.estado}`;
        }

        // Verifica favorito
        const isFav = meusFavoritos.includes(vaga.idVaga);
        const heartFill = isFav ? 'black' : 'none';
        
        const svgIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="${heartFill}" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`;

        const btnHeart = isCandidato 
            ? `<button onclick="toggleHeart(this, ${vaga.idVaga})" class="btn-heart-action" style="background:transparent; border:none; cursor:pointer; padding: 8px; display:flex; align-items:center; justify-content:center; border-radius:50%; transition: background 0.2s;">
                 ${svgIcon}
               </button>` 
            : '';

        div.innerHTML = `
            <div>
                <h3>${vaga.titulo}</h3>
                <p class="job-company" style="margin-bottom: 15px;">${vaga.nomeEmpresa}${textoLocal}</p>
                <div class="job-badges" style="margin-bottom: 15px;">
                    <span class="badge" style="background:#f0f0f0; color:#333;">${vaga.nomeArea}</span>
                    <span class="badge" style="background:#f0f0f0; color:#333;">${vaga.modalidade}</span>
                </div>
                <p class="job-salary" style="font-weight:600; color:var(--color-success);">${salarioTexto}</p>
            </div>
            <div class="job-card-footer">
                <button class="btn btn-outline" style="flex-grow: 1;" onclick="abrirModal(${vaga.idVaga})">Ver Detalhes</button>
                ${btnHeart}
            </div>
        `;
        container.appendChild(div);
    });
    
    if(isCandidato) {
        document.querySelectorAll('.btn-heart-action').forEach(btn => {
            btn.addEventListener('mouseover', () => btn.style.background = '#f0f0f0');
            btn.addEventListener('mouseout', () => btn.style.background = 'transparent');
        });
    }
}

async function toggleHeart(btn, idVaga) {
    const usuario = JSON.parse(localStorage.getItem('usuarioAmazoHire'));
    const svg = btn.querySelector('svg');
    const isFilled = svg.getAttribute('fill') === 'black';
    svg.setAttribute('fill', isFilled ? 'none' : 'black');

    try {
        const res = await fetch('/api/favoritos/toggle', {
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ idUsuario: usuario.id, idVaga })
        });
        const data = await res.json();
        if(!data.sucesso) {
            svg.setAttribute('fill', isFilled ? 'black' : 'none');
            alert('Erro ao favoritar.');
        } else {
            if(data.favoritado) meusFavoritos.push(idVaga);
            else meusFavoritos = meusFavoritos.filter(id => id !== idVaga);
        }
    } catch(e) {
        svg.setAttribute('fill', isFilled ? 'black' : 'none');
    }
}

function configurarFiltros() {
    const inputBusca = document.getElementById('campoBusca');
    const selectArea = document.getElementById('filtroArea');
    const btnBuscar = document.getElementById('btnBuscar');

    function filtrar() {
        const termo = inputBusca.value.toLowerCase();
        const area = selectArea.value;
        const filtradas = todasAsVagas.filter(vaga => {
            const matchTexto = vaga.titulo.toLowerCase().includes(termo) || vaga.nomeEmpresa.toLowerCase().includes(termo);
            const matchArea = area === '' || vaga.nomeArea === area;
            return matchTexto && matchArea;
        });
        renderizarVagas(filtradas);
    }
    inputBusca.addEventListener('input', filtrar);
    selectArea.addEventListener('change', filtrar);
    btnBuscar.addEventListener('click', filtrar);
}

function configurarModal() {
    const modal = document.getElementById('modalVaga');
    document.querySelector(".close-modal").onclick = () => modal.style.display = "none";
    window.onclick = (e) => { if (e.target == modal) modal.style.display = "none"; }
}

// --- FUNÇÃO ATUALIZADA (COM LOCALIZAÇÃO E BOTÃO DENUNCIAR ORIGINAL) ---
window.abrirModal = function(idVaga) {
    const vaga = todasAsVagas.find(v => v.idVaga === idVaga);
    if (!vaga) return;

    document.getElementById('mTitulo').innerText = vaga.titulo;
    document.getElementById('mEmpresa').innerText = vaga.nomeEmpresa;
    document.getElementById('mArea').innerText = vaga.nomeArea;
    document.getElementById('mTipo').innerText = vaga.tipoContratacao;
    
    let localizacaoCabecalho = `${vaga.cidade || ''}/${vaga.estado || ''}`;
    if (localizacaoCabecalho === '/') localizacaoCabecalho = 'Localização a combinar';
    document.getElementById('mModalidade').innerText = localizacaoCabecalho;

    document.getElementById('mDescricao').innerHTML = vaga.descricao.replace(/\n/g, '<br>');
    document.getElementById('mRequisitos').innerHTML = vaga.requisitos ? vaga.requisitos.replace(/\n/g, '<br>') : '-';
    
    const salarioFormatado = vaga.salario 
        ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(vaga.salario) 
        : 'A combinar';
    document.getElementById('mSalario').innerText = salarioFormatado;

    // Botões de Candidatura
    let buttonsHtml = '';
    if (vaga.linkCandidaturaExterno) buttonsHtml += `<a href="${vaga.linkCandidaturaExterno}" target="_blank" class="btn btn-outline">Site da Empresa</a>`;
    if (vaga.whatsappCandidatura) {
        const msg = `Olá, vi a vaga de ${vaga.titulo} no AmazoHire e gostaria de me candidatar.`;
        const link = `https://api.whatsapp.com/send?phone=55${vaga.whatsappCandidatura}&text=${encodeURIComponent(msg)}`;
        buttonsHtml += `<a href="${link}" target="_blank" class="btn btn-outline">WhatsApp</a>`;
    }
    if (vaga.emailCandidatura) buttonsHtml += `<a href="mailto:${vaga.emailCandidatura}?subject=Vaga: ${vaga.titulo}" class="btn btn-outline">Enviar E-mail</a>`;

    if (buttonsHtml === '') buttonsHtml = '<p>Entre em contato diretamente com a empresa.</p>';

    // --- LOCALIZAÇÃO DETALHADA ---
    let enderecoDetalhadoHtml = '';
    if (vaga.bairro || vaga.rua) {
        let textoEnd = [];
        if (vaga.bairro) textoEnd.push(`Bairro: ${vaga.bairro}`);
        if (vaga.rua) textoEnd.push(`Endereço: ${vaga.rua}`);
        
        // Estrutura h3+p padrão
        enderecoDetalhadoHtml = `
            <div style="margin-top: 15px;">
                <h3>Localização</h3>
                <p>${textoEnd.join(' • ')}</p>
            </div>
        `;
    }

   const footerDiv = document.querySelector('#modalVaga .modal-footer');
    footerDiv.innerHTML = `
        ${enderecoDetalhadoHtml}
        
        <hr style="margin: 20px 0; border: 0; border-top: 1px solid #eee;">
        
        <h3>Como se candidatar:</h3>
        <div id="areaCandidatura" class="apply-buttons">
            ${buttonsHtml}
        </div>
        
        <hr style="margin: 20px 0; border: 0; border-top: 1px solid #eee;">
        
        <div>
            <button onclick="denunciarVaga(${vaga.idVaga})" class="btn-hover-danger">
                Denunciar Vaga
            </button>
        </div>
    `;

    document.getElementById('modalVaga').style.display = "flex";
}

async function denunciarVaga(idVaga) {
    const motivo = prompt("Qual o motivo da denúncia?");
    if (!motivo) return;
    const usuario = JSON.parse(localStorage.getItem('usuarioAmazoHire'));
    if (!usuario) return alert('Faça login.');
    await fetch('/api/denunciar/vaga', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idVaga, idAutor: usuario.id, motivo })
    });
    alert('Denúncia enviada.');
}

function logout() { localStorage.clear(); window.location.href = '/'; }