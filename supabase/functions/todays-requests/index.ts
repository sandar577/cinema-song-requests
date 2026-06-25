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

    // Compute this Monday midnight MMT (UTC+6:30) as a UTC timestamp.
    // Week starts on Monday. We find the most recent Monday in MMT time.
    const now = new Date();
    const MMT_OFFSET_MS = 6.5 * 60 * 60 * 1000; // 6h 30m
    const mmtNow = new Date(now.getTime() + MMT_OFFSET_MS);
    const mmtDate = new Date(mmtNow.toISOString().split('T')[0]); // midnight MMT as UTC date
    const dow = mmtDate.getUTCDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    const daysSinceMonday = (dow + 6) % 7; // Mon=0, Tue=1, ..., Sun=6
    const mondayMMT = new Date(mmtDate);
    mondayMMT.setUTCDate(mondayMMT.getUTCDate() - daysSinceMonday);
    // Subtract MMT offset to get UTC equivalent of Monday midnight MMT
    const mondayMMT_utc = new Date(mondayMMT.getTime() - MMT_OFFSET_MS);
    const mondayMMT_iso = mondayMMT_utc.toISOString();
    console.log(`[weekly-requests] MMT now=${mmtNow.toISOString()}, week since=${mondayMMT_iso}`);

    // Fetch this week's unplayed requests, ordered by creation time (oldest first)
    const { data, error } = await supabaseClient
      .from('song_requests')
      .select('*')
      .eq('played', false)
      .gte('created_at', mondayMMT_iso)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Fetch error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch requests' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Count total this week for remaining slots
    const { count } = await supabaseClient
      .from('song_requests')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', mondayMMT_iso)

    const total = 30
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
