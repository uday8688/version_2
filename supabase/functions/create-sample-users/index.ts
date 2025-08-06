import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const sampleUsers = [
      { email: 'admin@aptcircle.com', password: 'test123', fullName: 'Admin User', role: 'admin' },
      { email: 'owner@aptcircle.com', password: 'test123', fullName: 'Property Owner', role: 'owner' },
      { email: 'tenant@aptcircle.com', password: 'test123', fullName: 'Tenant User', role: 'tenant' },
      { email: 'vendor@aptcircle.com', password: 'test123', fullName: 'Service Provider', role: 'vendor' },
    ]

    const results = []

    for (const user of sampleUsers) {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          full_name: user.fullName,
          role: user.role
        }
      })

      if (error) {
        console.error(`Error creating user ${user.email}:`, error)
        results.push({ email: user.email, success: false, error: error.message })
      } else {
        results.push({ email: user.email, success: true, id: data.user?.id })
      }
    }

    return new Response(
      JSON.stringify({ results }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})