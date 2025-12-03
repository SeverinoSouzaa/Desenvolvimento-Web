const usuario = JSON.parse(localStorage.getItem('usuarioAmazoHire'));

if (!usuario || usuario.tipo !== 'EMPREGADOR') {
    window.location.href = '/login';
}

document.getElementById('nomeEmpresaDisplay').innerText = usuario.nome;

function logout() {
    localStorage.clear();
    window.location.href = '/';
}

// 1. Carregar Vagas
async function carregarMinhasVagas() {
    const container = document.getElementById('listaVagas');
    
    try {
        const response = await fetch(`/api/minhas-vagas?idUsuario=${usuario.id}`);
        const data = await response.json();

        container.innerHTML = ''; 

        if (data.vagas.length === 0) {
            container.innerHTML = '<p>Nenhuma vaga publicada ainda.</p>';
            return;
        }

        data.vagas.forEach(vaga => {
            const dataPub = new Date(vaga.dataPublicacao).toLocaleDateString('pt-BR');
            
            let statusClass = 'status-ativa';
            if (vaga.status === 'PAUSADA') statusClass = 'status-pausada';
            if (vaga.status === 'BLOQUEADA') statusClass = 'status-bloqueada';

            const btnPausarTexto = vaga.status === 'ATIVA' ? 'Pausar' : 'Ativar';

            const avisoBloqueio = vaga.status === 'BLOQUEADA' 
                ? `<div style="background:#ffebeb; color:#dc3545; padding:10px; font-size:0.85rem; margin-bottom:10px; border-radius:4px; border: 1px solid #dc3545;">
                    ⚠️ <strong>Vaga Removida:</strong> Esta publicação violou nossas diretrizes e foi removida pelo administrador.
                   </div>` 
                : '';

            const vagaString = JSON.stringify(vaga).replace(/"/g, '&quot;');
            
            const div = document.createElement('div');
            div.className = `vaga-card-item ${vaga.status === 'PAUSADA' || vaga.status === 'BLOQUEADA' ? 'opacity-low' : ''}`;
            
            const salarioFormatado = vaga.salario 
                ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(vaga.salario) 
                : 'A combinar';
           
            div.innerHTML = `
                ${avisoBloqueio}
                <div class="vaga-header">
                    <span class="vaga-title">${vaga.titulo}</span>
                    <span class="vaga-badge ${statusClass}">${vaga.status}</span>
                </div>
                <div class="vaga-details">
                    <strong>${vaga.nomeArea}</strong> • ${salarioFormatado} • ${vaga.modalidade}
                </div>
                
                <div class="vaga-actions">
                    ${vaga.status !== 'BLOQUEADA' ? `
                        <button class="btn-action edit" onclick="prepararEdicao(${vagaString})">Editar</button>
                        <button class="btn-action pause" onclick="alternarStatus(${vaga.idVaga}, '${vaga.status}')">${btnPausarTexto}</button>
                    ` : ''}
                    <button class="btn-action delete" onclick="excluirVaga(${vaga.idVaga})">Excluir</button>
                </div>

                <div class="vaga-footer">Publicado em: ${dataPub}</div>
            `;
            container.appendChild(div);
        });

    } catch (error) {
        console.error(error);
    }
}

// 2. Salvar (Criar ou Editar)
document.getElementById('formVaga').addEventListener('submit', async (e) => {
    e.preventDefault();

    const idVaga = document.getElementById('idVaga').value;

    const dados = {
        idVaga: idVaga || null,
        idUsuario: usuario.id,
        titulo: document.getElementById('titulo').value,
        nomeArea: document.getElementById('nomeArea').value,
        salario: document.getElementById('salario').value,
        tipoContratacao: document.getElementById('tipoContratacao').value,
        modalidade: document.getElementById('modalidade').value,
        
        cidade: document.getElementById('cidade').value,
        estado: document.getElementById('estado').value,
        bairro: document.getElementById('bairro').value,
        rua: document.getElementById('rua').value,

        descricao: document.getElementById('descricao').value,
        requisitos: document.getElementById('requisitos').value,
        
        linkCandidaturaExterno: document.getElementById('linkExterno').value,
        emailCandidatura: document.getElementById('emailCandidatura').value,
        whatsappCandidatura: document.getElementById('whatsappCandidatura').value
    };

    try {
        const response = await fetch('/api/vaga', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        const res = await response.json();

        if (res.sucesso) {
            alert(idVaga ? '✅ Vaga atualizada!' : '✅ Vaga publicada!');
            limparFormulario(); // Chama a função de limpeza
            carregarMinhasVagas();
        } else {
            alert('Erro: ' + res.mensagem);
        }

    } catch (error) {
        alert('Erro de conexão.');
    }
});

// Funções Auxiliares
function prepararEdicao(vaga) {
    document.getElementById('formTitle').innerText = 'Editando Vaga';
    document.getElementById('btnSalvar').innerText = 'Salvar Alterações';
    document.getElementById('btnCancelar').style.display = 'inline-block';

    document.getElementById('idVaga').value = vaga.idVaga;
    document.getElementById('titulo').value = vaga.titulo;
    document.getElementById('nomeArea').value = vaga.nomeArea;
    document.getElementById('salario').value = vaga.salario; // Carrega valor cru (ex: 1400.00)
    document.getElementById('tipoContratacao').value = vaga.tipoContratacao;
    document.getElementById('modalidade').value = vaga.modalidade;
    document.getElementById('descricao').value = vaga.descricao;
    document.getElementById('requisitos').value = vaga.requisitos;
    
    // Localização
    document.getElementById('cidade').value = vaga.cidade || '';
    document.getElementById('estado').value = vaga.estado || '';
    document.getElementById('bairro').value = vaga.bairro || '';
    document.getElementById('rua').value = vaga.rua || '';

    document.getElementById('linkExterno').value = vaga.linkCandidaturaExterno || '';
    document.getElementById('emailCandidatura').value = vaga.emailCandidatura || '';
    document.getElementById('whatsappCandidatura').value = vaga.whatsappCandidatura || '';

    document.querySelector('.nova-vaga-card').scrollIntoView({ behavior: 'smooth' });
}

// ESTA FUNÇÃO ESTAVA FALTANDO E É CRUCIAL
function limparFormulario() {
    document.getElementById('formVaga').reset();
    document.getElementById('idVaga').value = '';
    document.getElementById('formTitle').innerText = 'Publicar Nova Oportunidade';
    document.getElementById('btnSalvar').innerText = 'Publicar Vaga';
    document.getElementById('btnCancelar').style.display = 'none';
}

// Funções de ação (Excluir e Status)
async function excluirVaga(idVaga) {
    if(!confirm('Tem certeza? Essa ação não pode ser desfeita.')) return;
    await fetch('/api/vaga/excluir', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idVaga, idUsuario: usuario.id })
    });
    carregarMinhasVagas();
}

async function alternarStatus(idVaga, statusAtual) {
    if(!confirm('Deseja realmente alterar o status desta vaga?')) return;
    await fetch('/api/vaga/status', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idVaga, statusAtual, idUsuario: usuario.id })
    });
    carregarMinhasVagas();
}

carregarMinhasVagas();