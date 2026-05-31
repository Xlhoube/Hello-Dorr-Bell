import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")

serve(async (req) => {
  try {
    const { record } = await req.json()
    const { email, organization_id } = record

    // 1. Obter nome da organização
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    )

    const { data: org } = await supabase
      .from("organizations")
      .select("name")
      .eq("id", organization_id)
      .single()

    const orgName = org?.name || "Uma organização no Hello"

    // 2. Enviar Email via Resend
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Hello Access <notifications@hello-access.com>", // Precisas de validar este domínio no Resend
        to: [email],
        subject: `Convite para a equipa: ${orgName}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #3b82f6;">Olá!</h2>
            <p>Foste convidado para te juntares à equipa da <strong>${orgName}</strong> no Hello Access.</p>
            <p>O Hello permite-te gerir acessos, atender a campainha virtual e falar com visitantes diretamente do teu telemóvel.</p>
            <div style="margin: 30px 0; text-align: center;">
              <a href="https://hello-access.com/register?email=${encodeURIComponent(email)}" style="background-color: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Aceitar Convite / Criar Conta</a>
            </div>
            <p style="color: #666; font-size: 12px;">Se não estavas à espera deste convite, podes ignorar este email.</p>
          </div>
        `,
      }),
    })

    const data = await res.json()
    return new Response(JSON.stringify(data), { 
      status: 200, 
      headers: { "Content-Type": "application/json" } 
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { "Content-Type": "application/json" } 
    })
  }
})
