import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
    // 1. Preflight - Must be successful and fast
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders, status: 200 });
    }

    try {
        const payload = await req.json();
        const visitor = payload.record;

        console.log(`🔔 Event received for visitor: ${visitor?.id}`);

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

        // Fetch Unit & Residents
        const { data: profiles } = await supabaseAdmin
            .from('profiles')
            .select('id, email, doorbell_sound')
            .eq('organization_id', visitor.organization_id);

        if (!profiles || profiles.length === 0) {
            console.log(`❌ No profiles found for Org: ${visitor.organization_id}`);
            return new Response(JSON.stringify({ 
                message: "No residents", 
                org_searched: visitor.organization_id,
                visitor_id: visitor.id 
            }), { 
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200 
            });
        }

        console.log(`✅ Found ${profiles.length} profiles for Org: ${visitor.organization_id}`);

        const profileIds = profiles.map(p => p.id);
        console.log(`🔍 Searching subscriptions for Profile IDs: ${profileIds.join(', ')}`);

        const { data: subscriptions, error: subError } = await supabaseAdmin
            .from('push_subscriptions')
            .select('*')
            .in('user_id', profileIds);

        if (subError) {
            console.error(`❌ Subscription Lookup Error:`, subError);
        }

        console.log(`📊 Found ${subscriptions?.length || 0} active subscriptions`);

        // --- PWA PUSH ---
        const pushResults = [];
        if (subscriptions && subscriptions.length > 0) {
            try {
                const webpush = await import("npm:web-push");
                const VAPID_PUBLIC_KEY = "BAFnpjt_uVGptKUu7e5bsVev_lCsZbOvFhOTqwpmuOSr-Q1iB0tPeqW9g2wwbpjFss5c3ibc7vZUjekqoZoq7a8";
                const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!;

                webpush.setVapidDetails('mailto:suporte@hello-doorbell.com', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
                
                for (const sub of subscriptions) {
                    try {
                        const profile = profiles.find(p => p.id === sub.user_id);
                        await webpush.sendNotification({
                            endpoint: sub.endpoint,
                            keys: { p256dh: sub.p256dh, auth: sub.auth_token }
                        }, JSON.stringify({
                            title: `🔔 Visitante: ${visitor.visitor_name || 'Alguém'}`,
                            body: `Estão a tocar à tua campainha.`,
                            url: `/dashboard/visitors?chat=${visitor.id}`,
                            icon: '/logo.png',
                            sound: profile?.doorbell_sound || '/Ring01.mp3'
                        }));
                        pushResults.push({ id: sub.id, success: true });
                    } catch (e: any) {
                        pushResults.push({ id: sub.id, success: false, error: e.message });
                    }
                }
            } catch (e: any) {
                console.error("WebPush Library Error:", e.message);
            }
        }

        return new Response(JSON.stringify({ 
            success: true, 
            pushResults,
            profilesFound: profiles.length,
            subscriptionsFound: subscriptions?.length || 0
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
        });

    } catch (err: any) {
        console.error("💥 Function Error:", err.message);
        return new Response(JSON.stringify({ error: err.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500
        });
    }
});
