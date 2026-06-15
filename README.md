# 🎬 Cinema Song Requests

A cinema-themed website where users can dedicate songs to their loved ones — the requests play on a virtual cinema projector with a starry night backdrop.

## How It Works

1. **Request a song** — fill in your name, your beloved's name, a YouTube URL, and a message
2. **Watch on the projector** — messages appear on screen for 30 seconds, then the song plays
3. **Daily refresh** — 10 requests per day, resets at midnight

## Tech Stack

- **Frontend**: Vue 3 + Vite + Tailwind CSS v4
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Deployment**: GitHub Pages (frontend) + Supabase (backend)

## Development

```bash
npm install
npm run dev
```

## Deployment

### Frontend (GitHub Pages)
Push to `main` — GitHub Actions builds and deploys automatically.

### Edge Functions (Supabase)
```bash
supabase functions deploy submit-request
supabase functions deploy todays-requests
supabase functions deploy mark-played
```

## Project Structure

```
src/
├── components/
│   ├── CinemaSeats.vue      — Decorative seat silhouette
│   ├── MessageCard.vue      — Cinema message display
│   ├── NavBar.vue           — Navigation bar
│   ├── ToastNotification.vue
│   └── VideoPlayer.vue      — YouTube embed wrapper
├── composables/
│   └── useYoutubeId.js      — YouTube URL parsing
├── lib/
│   └── api.js               — Edge function calls
├── router/
│   └── index.js
├── views/
│   ├── RequestForm.vue      — Song request form
│   └── Projector.vue        — Cinema projector page
├── App.vue
├── main.js
└── style.css                — Tailwind + cinema theme

supabase/
├── migrations/
└── functions/
    ├── submit-request/      — IP rate limiting, honeypot, insert
    ├── todays-requests/     — Fetch unplayed requests
    └── mark-played/         — Mark request as played
```

## Security

- **IP rate limiting**: 1 request per IP per day (captured server-side via `x-forwarded-for`)
- **Global daily cap**: 10 requests total per day
- **Honeypot field**: Invisible to users, catches bots
- **RLS**: All writes blocked for anonymous users — only edge functions (service_role) can modify data

## License

MIT
