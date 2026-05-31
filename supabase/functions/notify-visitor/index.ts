import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"
import webPush from "https://esm.sh/web-push@3.6.3"

serve(async (req) => {
  try {
    const payload = await req.json()
    console.log("🔔 [Edge] Received Webhook Payload:", payload)

    // Detalhes do Novo Visitante (INSERT)
    const { visitor_name, organization_id } = payload.record
    
    // Configurar VAPID (Secrets no Supabase)
    const publicKey = Deno.env.get('VAPID_PUBLIC_KEY')
    const privateKey = Deno.env.get('VAPID_PRIVATE_KEY')
    const contactEmail = 'hello@example.com' 

    if (!publicKey || !privateKey) {
        throw new Error("VAPID Keys not configured in Secrets")
    }

    webPush.setVapidDetails(
      `mailto:${contactEmail}`,
      publicKey,
      privateKey
    )

    // Inicializar Supabase Client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Procurar subscrições
    // Nota: Aqui podíamos filtrar pela organização, mas para já enviamos para todos os ativos
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth_token')

    if (subError || !subscriptions) {
      return new Response("Error fetching subscriptions", { status: 500 })
    }

    console.log(`🚀 [Edge] Forwarding push to ${subscriptions.length} devices...`)

    // 2. Enviar as notificações em massa
    const pushPromises = subscriptions.map((sub: any) => {
      const pushConfig = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth_token
        }
      }

      const message = JSON.stringify({
        title: 'Campainha Hello! 🔔',
        body: `${visitor_name} acabou de chegar à sua porta.`,
        url: '/dashboard/visitors'
      })

      return webPush.sendNotification(pushConfig, message)
        .catch(err => console.error(`❌ Push failed for ${sub.endpoint}:`, err))
    })

    await Promise.all(pushPromises)

    return new Response(JSON.stringify({ success: true, count: subscriptions.length }), {
      headers: { "Content-Type": "application/json" },
    })

  } catch (error) {
    console.error("🔥 [Edge] Error:", error)
    return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  }
})
