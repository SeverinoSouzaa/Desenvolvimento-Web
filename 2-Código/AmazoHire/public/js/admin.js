// --- NAVEGAÇÃO ENTRE ABAS ---
window.mudarAba = function(id) {
    // 1. Esconde todas as abas
    document.querySelectorAll('.section-view').forEach(el => el.classList.remove('active'));
    // 2. Tira a classe 'active' (branco) de todos os botões
    document.querySelectorAll('.menu-btn').forEach(el => el.classList.remove('active'));
    
    // 3. Ativa a aba e o botão clicado
    document.getElementById(id).classList.add('active');
    document.getElementById(`btn-${id}`).classList.add('active');
}

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    carregarStats(); // Carrega os números
    carregarPendencias(); // Carrega as denúncias
    carregarAdmins(); // Carrega a equipe
});

// --- ESTATÍSTICAS E BADGE ---
async function carregarStats() {
    try {
        const res = await fetch('/api/admin/stats');
        const stats = await res.json();
        
        // Preenche os números grandes
        document.getElementById('statUsers').innerText = stats.usuarios;
        document.getElementById('statVagas').innerText = stats.vagas;
        document.getElementById('statPendencias').innerText = stats.pendencias;

        // Atualiza o contador vermelho (Notification Badge)
        const badge = document.getElementById('badgePendencias');
        if (stats.pendencias > 0) {
            badge.style.display = 'inline-block';
            badge.innerText = stats.pendencias;
        } else {
            badge.style.display = 'none';
        }
    } catch (e) { console.error("Erro stats", e); }
}

// --- MODERAÇÃO (Denúncias) ---
async function carregarPendencias() {
    const res = await fetch('/api/admin/pendencias');
    const data = await res.json();
    renderVagas(data.vagas);
    renderPerfis(data.perfis);
}

function renderVagas(lista) {
    const div = document.getElementById('listaDenunciasVagas');
    div.innerHTML = '';
    if(lista.length === 0) div.innerHTML = '<p style="color:#888;">Tudo limpo por aqui.</p>';

    lista.forEach(v => {
        const vagaString = JSON.stringify(v).replace(/"/g, '&quot;');
        div.innerHTML += `
            <div class="report-item">
                <div class="report-header">
                    <strong>${v.titulo}</strong>
                    <span class="report-date">${new Date(v.dataDenuncia).toLocaleDateString()}</span>
                </div>
                <p class="report-reason">Motivo: ${v.motivo}</p>
                <div style="margin-bottom:10px;">
                    <button onclick="verVagaCompleta(${vagaString})" class="btn-mini btn-view">Ver Detalhes</button>
                </div>
                <div class="action-buttons">
                     <button onclick="moderarVaga(${v.idDenunciaVaga}, ${v.idVaga}, 'ACEITA')" class="btn-mini btn-warning">Banir Vaga</button>
                     <button onclick="banirEmpresa(${v.idDenunciaVaga}, ${v.idVaga})" class="btn-mini btn-danger">Banir Empresa</button>
                     <button onclick="moderarVaga(${v.idDenunciaVaga}, ${v.idVaga}, 'REJEITADA')" class="btn-mini btn-success">Ignorar</button>
                </div>
            </div>
        `;
    });
}

function renderPerfis(lista) {
    const div = document.getElementById('listaDenunciasPerfis');
    div.innerHTML = '';
    if(lista.length === 0) div.innerHTML = '<p style="color:#888;">Tudo limpo por aqui.</p>';

    lista.forEach(p => {
        const perfilString = JSON.stringify(p).replace(/"/g, '&quot;');
        div.innerHTML += `
            <div class="report-item">
                <div class="report-header">
                    <strong>${p.nomeDenunciado}</strong>
                    <span class="report-date">${new Date(p.dataDenuncia).toLocaleDateString()}</span>
                </div>
                <p class="report-reason">Motivo: ${p.motivo}</p>
                <div style="margin-bottom:10px;">
                    <button onclick="verPerfilCompleto(${perfilString})" class="btn-mini btn-view">Ver Perfil</button>
                </div>
                <div class="action-buttons">
                     <button onclick="moderarPerfil(${p.idDenunciaPerfil}, ${p.idPerfilDenunciado}, 'ACEITA')" class="btn-mini btn-danger">Banir Usuário</button>
                     <button onclick="moderarPerfil(${p.idDenunciaPerfil}, ${p.idPerfilDenunciado}, 'REJEITADA')" class="btn-mini btn-success">Ignorar</button>
                </div>
            </div>
        `;
    });
}

// --- AÇÕES DE BANIMENTO ---
window.moderarVaga = async function(idDenuncia, idVaga, decisao) {
    if(!confirm('Confirmar ação?')) return;
    await fetch('/api/admin/resolver-vaga', {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ idDenuncia, idVaga, decisao })
    });
    carregarStats(); carregarPendencias();
}

window.banirEmpresa = async function(idDenuncia, idVaga) {
    if(!confirm('ATENÇÃO: Isso vai suspender a conta da empresa e bloquear TODAS as vagas dela. Continuar?')) return;
    await fetch('/api/admin/banir-empresa', {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ idDenuncia, idVaga })
    });
    carregarStats(); carregarPendencias();
}

window.moderarPerfil = async function(idDenuncia, idPerfil, decisao) {
    if(!confirm('Confirmar ação?')) return;
    await fetch('/api/admin/resolver-perfil', {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ idDenuncia, idPerfil, decisao })
    });
    carregarStats(); carregarPendencias();
}

// --- MODAIS ---
window.verVagaCompleta = function(v) {
    const html = `
        <div style="margin-bottom: 20px;">
            <h2 style="margin-bottom: 5px;">${v.titulo}</h2>
            <p style="color: #666; font-size: 1rem;">
                <strong>Empresa:</strong> ${v.nomeEmpresa}<br>
                <strong>Área:</strong> ${v.nomeArea}
            </p>
        </div>

        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border: 1px solid #e0e0e0; margin-bottom: 20px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div><strong>Salário:</strong> ${v.salario ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v.salario) : 'A combinar'}</div>
                <div><strong>Modalidade:</strong> ${v.modalidade}</div>
                <div><strong>Contrato:</strong> ${v.tipoContratacao}</div>
                <div><strong>Publicado:</strong> ${new Date(v.dataPublicacao).toLocaleDateString()}</div>
            </div>
        </div>

        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">

        <h3>Descrição da Vaga</h3>
        <p style="white-space: pre-line; margin-bottom: 20px;">${v.descricao}</p>

        <h3>Requisitos</h3>
        <p style="white-space: pre-line; margin-bottom: 20px;">${v.requisitos}</p>

        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">

        <h3> Dados de Candidatura (Para análise)</h3>
        <ul style="list-style: none; padding: 0;">
            <li style="margin-bottom: 5px;"><strong>Link Externo:</strong> ${v.linkCandidaturaExterno ? `<a href="${v.linkCandidaturaExterno}" target="_blank">${v.linkCandidaturaExterno}</a>` : 'Não informado'}</li>
            <li style="margin-bottom: 5px;"><strong>E-mail:</strong> ${v.emailCandidatura || 'Não informado'}</li>
            <li><strong>WhatsApp:</strong> ${v.whatsappCandidatura || 'Não informado'}</li>
        </ul>
    `;
    document.getElementById('conteudoModal').innerHTML = html;
    document.getElementById('modalDetalhes').style.display = 'flex';
}

window.verPerfilCompleto = function(p) {
    // Tratamento da foto
    const fotoSrc = p.fotoPerfil ? `/uploads/${p.fotoPerfil}` : '/img/user-placeholder.jpg';

    const html = `
        <div style="text-align: center; margin-bottom: 25px;">
            <div style="width: 120px; height: 120px; border-radius: 50%; overflow: hidden; margin: 0 auto 15px; border: 4px solid #f0f0f0;">
                <img src="${fotoSrc}" onerror="this.src='/img/user-placeholder.png'" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <h2 style="margin-bottom: 5px;">${p.nomeDenunciado}</h2>
            <p style="color: #666;">${p.email}</p>
            <p style="background: #eee; display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 0.85rem; margin-top: 10px;">
                ${p.areaInteresse || 'Área não definida'}
            </p>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <div style="background: #f9f9f9; padding: 15px; border-radius: 8px;">
                <strong>Localização:</strong><br>
                ${p.cidade || '-'} / ${p.estado || '-'}
            </div>
            <div style="background: #f9f9f9; padding: 15px; border-radius: 8px;">
                <strong>Habilidades:</strong><br>
                ${p.habilidades || '-'}
            </div>
        </div>

        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">

        <h3>Sobre Mim (Bio)</h3>
        <p style="white-space: pre-line; margin-bottom: 20px;">${p.miniBio || 'Sem descrição.'}</p>

        <h3>Formação Acadêmica</h3>
        <p style="white-space: pre-line; margin-bottom: 20px;">${p.formacao || 'Não informado.'}</p>

        <h3>Experiência Profissional</h3>
        <p style="white-space: pre-line; margin-bottom: 20px;">${p.experiencias || 'Não informado.'}</p>

        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">

        <h3>Contatos e Links</h3>
        <ul style="list-style: none; padding: 0;">
            <li style="margin-bottom: 8px;"><strong>WhatsApp:</strong> ${p.whatsappProf || '-'}</li>
            <li><strong>Portfólio:</strong> ${p.linkPortfolio ? `<a href="${p.linkPortfolio}" target="_blank">Acessar Link</a>` : '-'}</li>
        </ul>
    `;
    document.getElementById('conteudoModal').innerHTML = html;
    document.getElementById('modalDetalhes').style.display = 'flex';
}

window.fecharModal = function() { document.getElementById('modalDetalhes').style.display = 'none'; }

// --- GESTÃO DE EQUIPE ---
async function carregarAdmins() {
    const res = await fetch('/api/admin/listar');
    const data = await res.json();
    const tbody = document.getElementById('tabelaAdmins');
    tbody.innerHTML = '';
    data.admins.forEach(adm => {
        tbody.innerHTML += `
            <tr>
                <td>${adm.nome}</td>
                <td>${adm.email}</td>
                <td><span style="background:#eee; padding:2px 8px; border-radius:4px; font-size:0.8rem;">${adm.cargo}</span></td>
                <td><button onclick="removerAdmin(${adm.idUsuario})" class="btn-mini btn-danger">Revogar</button></td>
            </tr>
        `;
    });
}

document.getElementById('formAdmin').addEventListener('submit', async (e) => {
    e.preventDefault();
    const dados = {
        nome: document.getElementById('novoNome').value,
        email: document.getElementById('novoEmail').value,
        cargo: document.getElementById('novoCargo').value,
        senha: document.getElementById('novaSenha').value
    };
    const res = await fetch('/api/admin/criar', {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify(dados)
    });
    const result = await res.json();
    alert(result.mensagem);
    if(result.sucesso) { document.getElementById('formAdmin').reset(); carregarAdmins(); }
});

window.removerAdmin = async function(id) {
    if(!confirm('Tem certeza?')) return;
    await fetch('/api/admin/remover', {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ idUsuario: id })
    });
    carregarAdmins();
}