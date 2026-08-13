const API = 'http://localhost:3000';


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


function escapar(texto) {
    const div = document.createElement('div');
    div.textContent = texto ?? '';
    return div.innerHTML;
}
