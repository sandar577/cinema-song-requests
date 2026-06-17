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

    // Compute midnight MMT (UTC+6:30) as a proper UTC timestamp.
    // Bare date "2026-06-17" → Postgres interprets as midnight UTC ✗
    // We need "2026-06-16T17:30:00.000Z" (midnight MMT in UTC) ✓
    const now = new Date();
    const MMT_OFFSET_MS = 6.5 * 60 * 60 * 1000; // 6h 30m
    const mmtNow = new Date(now.getTime() + MMT_OFFSET_MS);
    const todayMMT = mmtNow.toISOString().split('T')[0]; // e.g. "2026-06-17"
    const [y, m, d] = todayMMT.split('-').map(Number);
    // Subtract MMT offset from midnight MMT to get the UTC equivalent
    const midnightMMT_utc = new Date(Date.UTC(y, m - 1, d) - MMT_OFFSET_MS);
    const midnightMMT_iso = midnightMMT_utc.toISOString();
    console.log(`[todays-requests] MMT today=${todayMMT}, since=${midnightMMT_iso}`);

    // Fetch today's unplayed requests, ordered by creation time (oldest first)
    const { data, error } = await supabaseClient
      .from('song_requests')
      .select('*')
      .eq('played', false)
      .gte('created_at', midnightMMT_iso)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Fetch error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch requests' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Count total today for remaining slots (MMT date)
    const { count } = await supabaseClient
      .from('song_requests')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', midnightMMT_iso)

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
