/**
 * Extract YouTube video ID from various URL formats.
 * Supported: youtu.be/ID, youtube.com/watch?v=ID, /embed/ID, /shorts/ID, m.youtube.com
 *
 * @param {string} url
 * @returns {string|null} 11-char video ID or null if invalid
 */
export function extractYoutubeId(url) {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/|m\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/, // bare ID
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match) return match[1];
  }

  return null;
}

/**
 * Build an embed URL from a YouTube video ID.
 * @param {string} videoId
 * @returns {string}
 */
export function buildEmbedUrl(videoId) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  // enablejsapi=1 is REQUIRED — the projector relies on YouTube's
  // postMessage onStateChange events to detect when a video ends
  // origin is required for postMessage to work
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0&fs=0&playsinline=1&enablejsapi=1&origin=${encodeURIComponent(origin)}`;
}

/**
 * Validate a YouTube URL and return the ID if valid.
 * @param {string} url
 * @returns {{ valid: boolean, videoId?: string, error?: string }}
 */
export function validateYoutubeUrl(url) {
  if (!url || !url.trim()) {
    return { valid: false, error: "Please enter a YouTube URL" };
  }

  const videoId = extractYoutubeId(url);
  if (!videoId) {
    return {
      valid: false,
      error: "Invalid YouTube URL. Use youtube.com/watch?v=... or youtu.be/...",
    };
  }

  return { valid: true, videoId };
}
