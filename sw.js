self.addEventListener('push', (evento) => {
    let dados = { titulo: 'Lembrete', corpo: 'Hora de beber água!' };

    try {
        dados = evento.data.json();
    } catch (erro) {
        // mantém o padrão se o payload não vier em JSON
    }

    evento.waitUntil(
        self.registration.showNotification(dados.titulo, {
            body: dados.corpo,
            icon: 'img/image.png',
            badge: 'img/image.png',
        })
    );
});

self.addEventListener('notificationclick', (evento) => {
    evento.notification.close();

    evento.waitUntil(
        clients.matchAll({ type: 'window' }).then((lista) => {
            for (const cliente of lista) {
                if ('focus' in cliente) return cliente.focus();
            }
            if (clients.openWindow) return clients.openWindow('/app.html');
        })
    );
});
