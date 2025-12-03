const usuario = JSON.parse(localStorage.getItem('usuarioAmazoHire'));
let minhasVagasSalvas = []; 

if (!usuario || usuario.tipo !== 'CANDIDATO') {
    window.location.href = '/login';
}

function logout() {
    localStorage.clear();
    window.location.href = '/';
}

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('modalVaga');
    if(modal) {
        document.querySelector(".close-modal").onclick = () => modal.style.display = "none";
        window.onclick = (e) => { if (e.target == modal) modal.style.display = "none"; }
    }
    carregarFavoritos();
});

async function carregarFavoritos() {
    const container = document.getElementById('listaFavoritos');
    try {
        const res = await fetch(`/api/favoritos/listar?idUsuario=${usuario.id}`);
        const data = await res.json();
        
        minhasVagasSalvas = data.vagas; 

        container.innerHTML = '';
        if(data.vagas.length === 0) {
            container.innerHTML = '<p>Você ainda não salvou nenhuma vaga.</p>';
            return;
        }

        data.vagas.forEach(vaga => {
            const div = document.createElement('div');
            div.className = 'job-card';
            div.style.display = 'flex';
            div.style.flexDirection = 'column';
            div.style.justifyContent = 'space-between';

            // --- LÓGICA DE LIMPEZA DO LOCAL (CARD) ---
            let textoLocal = "";
            if (vaga.cidade && vaga.estado) {
                textoLocal = ` - ${vaga.cidade}/${vaga.estado}`;
            }

            const salarioTexto = vaga.salario 
                ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(vaga.salario) 
                : 'A combinar';

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
                    
                    <button onclick="removerFavorito(${vaga.idVaga})" class="btn-remove-fav" title="Remover dos salvos">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="black" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                    </button>
                </div>
            `;
            container.appendChild(div);
        });
    } catch(e) { container.innerHTML = '<p>Erro ao carregar.</p>'; }
}

async function removerFavorito(idVaga) {
    if(!confirm('Remover esta vaga da sua lista?')) return;
    await fetch('/api/favoritos/toggle', {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ idUsuario: usuario.id, idVaga })
    });
    carregarFavoritos(); 
}

// --- FUNÇÃO DE ABRIR MODAL (Com Localização Detalhada) ---
window.abrirModal = function(idVaga) {
    const vaga = minhasVagasSalvas.find(v => v.idVaga === idVaga);
    if (!vaga) return;

    document.getElementById('mTitulo').innerText = vaga.titulo;
    document.getElementById('mEmpresa').innerText = vaga.nomeEmpresa;
    document.getElementById('mArea').innerText = vaga.nomeArea;
    document.getElementById('mTipo').innerText = vaga.tipoContratacao;
    
    // Cabeçalho Modal (Cidade/UF)
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
                <p style="color: #555; font-size: 0.95rem;">${textoEnd.join(' • ')}</p>
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
    `;

    document.getElementById('modalVaga').style.display = "flex";
}