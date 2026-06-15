import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Fetch today's unplayed requests, ordered by creation time (oldest first)
    const { data, error } = await supabaseClient
      .from('song_requests')
      .select('*')
      .eq('played', false)
      .gte('created_at', new Date().toISOString().split('T')[0]) // today only
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Fetch error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch requests' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Count total today for remaining slots
    const { count } = await supabaseClient
      .from('song_requests')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date().toISOString().split('T')[0])

    const total = 10
    const used = count || 0
    const remaining = Math.max(0, total - used)

    return new Response(
      JSON.stringify({
        requests: data || [],
        remaining,
        total,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (e) {
    console.error('Edge function error:', e)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
