const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

const baseHeaders = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${ANON_KEY}`,
}

function supabaseFunctionUrl(name) {
  return `${SUPABASE_URL}/functions/v1/${name}`
}

/**
 * Submit a song request via the edge function.
 * Returns { success, data } or { success: false, error }
 */
export async function submitRequest({ fromName, toName, youtubeUrl, message, honeypot }) {
  const res = await fetch(supabaseFunctionUrl('submit-request'), {
    method: 'POST',
    headers: baseHeaders,
    body: JSON.stringify({
      from_name: fromName,
      to_name: toName,
      youtube_url: youtubeUrl,
      message,
      honeypot,
    }),
  })

  const data = await res.json()
  if (!res.ok) {
    return { success: false, error: data.error || 'Something went wrong' }
  }
  return { success: true, data }
}

/**
 * Fetch today's unplayed requests via the edge function.
 * Returns { success, data: requests[] } or { success: false, error }
 */
export async function fetchTodaysRequests() {
  const res = await fetch(supabaseFunctionUrl('todays-requests'), {
    method: 'GET',
    headers: baseHeaders,
  })

  const data = await res.json()
  if (!res.ok) {
    return { success: false, error: data.error || 'Failed to fetch requests' }
  }
  return { success: true, data: data.requests || data }
}

/**
 * Mark a request as played via the edge function.
 */
export async function markPlayed(requestId) {
  const res = await fetch(supabaseFunctionUrl('mark-played'), {
    method: 'POST',
    headers: baseHeaders,
    body: JSON.stringify({ id: requestId }),
  })

  const data = await res.json()
  if (!res.ok) {
    return { success: false, error: data.error || 'Failed to mark as played' }
  }
  return { success: true, data }
}

/**
 * Get remaining daily slots. Returns { success, data: { remaining, total } }
 */
export async function getRemainingSlots() {
  const res = await fetch(supabaseFunctionUrl('todays-requests'), {
    method: 'GET',
    headers: baseHeaders,
  })

  const data = await res.json()
  if (!res.ok) {
    return { success: false, error: data.error }
  }
  return { success: true, data: { remaining: data.remaining || 0, total: data.total || 10 } }
}
