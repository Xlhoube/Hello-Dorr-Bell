import { supabase } from './supabase';
import packageJson from '../../package.json';

// Chave Pública VAPID (CORRIGIDA - 65 BYTES - v1.1.08)
const VAPID_PUBLIC_KEY = new Uint8Array([
    4, 1, 103, 166, 59, 127, 185, 81, 169, 180, 165, 46, 237, 238, 91, 177, 87, 175, 254, 80, 172, 101, 179, 175, 22, 19, 147, 171, 10, 102, 184, 228, 171, 249, 13, 98, 7, 75, 79, 122, 165, 189, 131, 108, 48, 110, 152, 197, 178, 206, 92, 222, 38, 220, 238, 246, 84, 141, 233, 42, 161, 154, 42, 237, 175
]);
 // Chave unificada para o projeto

export async function subscribeUserToPush() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn('Push messaging is not supported');
        return;
    }

    try {
        console.log('🔍 [Push] Starting subscription process...');
        
        let registration;
        if ('serviceWorker' in navigator) {
            // Tentar obter registo existente
            registration = await navigator.serviceWorker.getRegistration();
            
            // Se não houver, ou se estivermos presos num estado estranho, forçar registo
            if (!registration) {
                console.log('🔄 [Push] No SW registration found, registering manually...');
                registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
            }
            
            // Esperar que esteja ativo (com timeout)
            const readyPromise = navigator.serviceWorker.ready;
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('SW Activation Timeout')), 5000)
            );
            
            try {
                registration = await Promise.race([readyPromise, timeoutPromise]) as ServiceWorkerRegistration;
            } catch (e) {
                console.warn('⚠️ [Push] SW Ready timed out, using current registration anyway');
            }
        }

        if (!registration) throw new Error('Service Worker not available');
        
        // Verifica se já existe uma subscrição
        let subscription = await registration.pushManager.getSubscription();
        
        // Verificar se a subscrição existente usa a mesma chave VAPID
        if (subscription) {
            const currentKey = new Uint8Array(subscription.options.applicationServerKey!);
            const newKey = VAPID_PUBLIC_KEY;
            
            // Comparar as chaves (Uint8Array)
            const isMatch = currentKey && 
                currentKey.length === newKey.length && 
                currentKey.every((v, i) => v === newKey[i]);

            if (!isMatch) {
                console.log('🔄 [Push] VAPID Key mismatch. Unsubscribing to refresh...');
                await subscription.unsubscribe();
                subscription = null;
            }
        }

        if (!subscription) {
            // Criar nova subscrição
            subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: VAPID_PUBLIC_KEY
            });
            console.log('✅ [Push] New subscription created:', subscription);
        }

        // Guardar no Supabase
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            alert('❌ [Push] Erro: Utilizador não logado!');
            return;
        }

        const subJSON = subscription.toJSON();
        console.log('📤 Sending push subscription to Supabase...');

        const { data: upsertResult, error: upsertError } = await supabase
            .from('push_subscriptions')
            .upsert({
                user_id: user.id,
                endpoint: subscription.endpoint,
                p256dh: subJSON.keys?.p256dh,
                auth_token: subJSON.keys?.auth,
                device_info: navigator.userAgent
            }, { 
                onConflict: 'endpoint' 
            })
            .select();

        if (upsertError) {
            console.error('❌ [Push] Error upserting subscription:', upsertError);
        } else {
            console.log('✅ [Push] Device subscription synchronized', upsertResult);
            // Alert manual para garantir que o utilizador vê o registo a acontecer
            console.log('🔔 REGISTO EFETUADO NO SUPABASE');
        }

    } catch (error: any) {
        console.error('❌ [Push] Error subscribing user:', error);
        if (error.message?.includes('Registration failed')) {
            alert('❌ Erro: O browser bloqueou as notificações. Verifica as permissões do site.');
        }
    }
}

