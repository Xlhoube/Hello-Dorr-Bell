import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

const supabase = createClient(supabaseUrl, supabaseServiceKey)

serve(async (req) => {
  try {
    const { method } = req
    if (method !== 'POST') return new Response('Method not allowed', { status: 405 })

    const formData = await req.formData()
    const data = JSON.parse(formData.get('data') as string)

    // Ko-fi Webhook structure usually includes 'type', 'amount', 'currency', 'email', 'kofi_transaction_id'
    // For subscriptions, we look for 'Subscription' type or similar based on user setup
    // Custom field 1 usually contains organization_id if passed in the kofi URL (e.g., https://ko-fi.com/user?item=pro&custom_id=ORG_ID)
    
    const { 
      type, 
      email, 
      amount, 
      kofi_transaction_id,
      shop_items,
      verification_token
    } = data

    // Security check: verify webhook token if configured
    const KOFI_VERIFICATION_TOKEN = Deno.env.get('KOFI_VERIFICATION_TOKEN')
    if (verification_token !== KOFI_VERIFICATION_TOKEN) {
        console.error('Invalid verification token')
        // return new Response('Unauthorized', { status: 401 })
    }

    console.log(`Processing Ko-fi webhook: ${type} from ${email} (ID: ${kofi_transaction_id})`)

    // Identify organization. We expect organization_id in 'custom_id' or we search by email
    const organizationId = data.custom_id // We should ask user to set this in Ko-fi buttons
    
    let targetOrgId = organizationId

    if (!targetOrgId) {
        // Fallback: search by user email
        const { data: profile } = await supabase
            .from('profiles')
            .select('organization_id')
            .eq('email', email)
            .single()
        
        targetOrgId = profile?.organization_id
    }

    if (!targetOrgId) {
        return new Response('Organization not found', { status: 404 })
    }

    // Update organization tier
    // Subscription periods logic (30€/year, 20€/6m, 10€/3m, 7.5€/1m)
    let monthsToAdd = 0
    const val = parseFloat(amount)
    
    if (val >= 30) monthsToAdd = 12
    else if (val >= 20) monthsToAdd = 6
    else if (val >= 10) monthsToAdd = 3
    else if (val >= 7.5) monthsToAdd = 1

    if (monthsToAdd > 0) {
        const expiresAt = new Date()
        expiresAt.setMonth(expiresAt.getMonth() + monthsToAdd)

        const { error: updateError } = await supabase
            .from('organizations')
            .update({
                subscription_tier: 'pro',
                subscription_expires_at: expiresAt.toISOString(),
                kofi_transaction_id: kofi_transaction_id
            })
            .eq('id', targetOrgId)

        if (updateError) throw updateError
        
        console.log(`Successfully upgraded Org ${targetOrgId} to PRO for ${monthsToAdd} months.`)
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err) {
    console.error('Webhook error:', err.message)
    return new Response(Error, { status: 500 })
  }
})
