import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// YouTube URL validation (server-side)
function extractYoutubeId(url: string): string | null {
  if (!url) return null
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/|m\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/
  )
  return match ? match[1] : null
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

    const body = await req.json()
    const { from_name, to_name, youtube_url, message, honeypot } = body

    // --- Honeypot check ---
    if (honeypot && honeypot.trim() !== '') {
      return new Response(
        JSON.stringify({ error: 'Spam detected' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // --- Validate required fields ---
    if (!from_name?.trim() || !to_name?.trim() || !youtube_url?.trim() || !message?.trim()) {
      return new Response(
        JSON.stringify({ error: 'All fields are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (from_name.trim().length > 100 || to_name.trim().length > 100) {
      return new Response(
        JSON.stringify({ error: 'Name must be 100 characters or fewer' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (message.trim().length > 300) {
      return new Response(
        JSON.stringify({ error: 'Message must be 300 characters or fewer' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // --- Validate YouTube URL ---
    const videoId = extractYoutubeId(youtube_url.trim())
    if (!videoId) {
      return new Response(
        JSON.stringify({ error: 'Invalid YouTube URL. Use youtube.com/watch?v=... or youtu.be/...' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // --- Capture real IP ---
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

    // --- Insert (DB trigger enforces IP daily + weekly limit) ---
    try {
      const { data, error } = await supabaseClient
        .from('song_requests')
        .insert({
          from_name: from_name.trim(),
          to_name: to_name.trim(),
          youtube_url: youtube_url.trim(),
          message: message.trim(),
          ip_address: ip,
        })
        .select('id')
        .single()

      if (error) {
        // Postgres error from trigger = limit reached
        const msg = error.message || 'Database error'
        if (msg.includes('already submitted')) {
          return new Response(
            JSON.stringify({ error: 'You have already submitted a request today. Come back tomorrow!' }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        if (msg.includes('Weekly limit')) {
          return new Response(
            JSON.stringify({ error: 'Weekly limit of 30 requests reached. Try again next week!' }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        console.error('Insert error:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to submit request' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ success: true, id: data.id }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } catch (dbError) {
      console.error('Database error:', dbError)
      return new Response(
        JSON.stringify({ error: 'Failed to submit request. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
  } catch (e) {
    console.error('Edge function error:', e)
    return new Response(
      JSON.stringify({ error: 'Invalid request' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
