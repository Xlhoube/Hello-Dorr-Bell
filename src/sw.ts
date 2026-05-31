/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching';

declare let self: ServiceWorkerGlobalScope;

// Precache todos os assets gerados pelo Vite
precacheAndRoute(self.__WB_MANIFEST);

// Forçar atualização imediata
self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

// Escutar eventos de PUSH (vindo do Servidor/Supabase)
self.addEventListener('push', (event) => {
    console.log('📬 [SW] Push Received:', event);
    
    let data = {
        title: 'Novo Visitante!',
        body: 'Alguém está a tocar à sua campainha.',
        icon: '/logo.png',
        url: '/dashboard/visitors'
    };

    try {
        if (event.data) {
            data = { ...data, ...event.data.json() };
        }
    } catch (e) {
        console.error('❌ [SW] Error parsing push data:', e);
    }

    const options: any = {
        body: data.body,
        icon: data.icon,
        badge: '/logo.png',
        vibrate: [500, 110, 500, 110, 450, 110, 200, 110, 170, 40, 450, 110, 200, 110, 170, 40],
        sound: data.sound || '/Ring01.mp3',
        data: {
            url: data.url
        },
        actions: [
            { action: 'open', title: 'Abrir Dashboard' }
        ],
        tag: 'doorbell-notification',
        renotify: true,
        requireInteraction: true // Manter a notificação até o utilizador agir
    };

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            const isAppFocused = windowClients.some(client => client.focused);
            
            console.log(`🔔 [SW v1.1.40] Showing notification for: ${data.title}`, { isAppFocused, options });

            // Se a app estiver em foco OU se o browser forçar silêncio, 
            // garantimos que não há conflito de vibração/som.
            if (isAppFocused || options.silent) {
                options.silent = true;
                delete options.vibrate;
                delete options.sound;
                console.log('🔇 [SW] Strict silent mode applied (removed vibrate/sound)');
            }

            return self.registration.showNotification(data.title, options);
        })
    );
});

// Ao clicar na notificação
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // Se já houver uma janela aberta, focar nela
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url.includes(urlToOpen) && 'focus' in client) {
                    return (client as any).focus();
                }
            }
            // Se não, abrir uma nova
            if (self.clients.openWindow) {
                return self.clients.openWindow(urlToOpen);
            }
        })
    );
});
