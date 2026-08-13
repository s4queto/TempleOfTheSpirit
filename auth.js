// Tudo que envolve token e sessão fica aqui, para as páginas da área logada
// não repetirem esse código.

const API = 'http://localhost:3000';

// Faz a chamada já com o token no cabeçalho e trata sessão expirada num lugar só.
async function chamarApi(rota, opcoes = {}) {
    const token = localStorage.getItem('token');

    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    const resposta = await fetch(`${API}${rota}`, {
        ...opcoes,
        headers: {
            ...opcoes.headers,
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    // 401 = o backend recusou o token (inválido ou expirado).
    if (resposta.status === 401) {
        localStorage.removeItem('token');
        alert('Sua sessão expirou. Faça login novamente.');
        window.location.href = 'index.html';
        return;
    }

    return resposta;
}

function sair() {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}

// Escapa o texto antes de jogar em innerHTML. Sem isso, uma tarefa chamada
// <img src=x onerror=alert(1)> viraria código executando na página (XSS).
function escapar(texto) {
    const div = document.createElement('div');
    div.textContent = texto ?? '';
    return div.innerHTML;
}
