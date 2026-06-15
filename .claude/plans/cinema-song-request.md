# Cinema Song Request Website — Implementation Plan

## Tools & MCPs You'll Need

| Tool | Purpose |
|------|---------|
| **Supabase MCP** | Create tables, RLS policies, functions, manage database |
| **Bash** | Scaffold Vue/Vite, install deps, `supabase functions deploy`, run dev server |
| **Write/Edit** | Create all source files |

No special skills or subagents — Vue + Tailwind + Supabase, straightforward coding.

---

## Architecture Overview

### Tech Stack
- **Frontend**: Vue 3 (Composition API, `<script setup>`) + Vite
- **Styling**: Tailwind CSS v4
- **Routing**: Vue Router (2 routes)
- **Database**: Supabase (PostgreSQL)
- **Edge Functions**: Supabase Edge Functions (Deno) — for secure IP-based rate limiting
- **Auth**: None — fully public, no login required

### Data Flow (Submission)
```
Browser                     Edge Function                  PostgreSQL
  |                              |                              |
  |-- POST /api/submit-request ->|                              |
  |   (from, to, yt_url, msg)    |                              |
  |                              |-- read x-forwarded-for IP -->|
  |                              |-- COUNT today's requests --> |
  |                              |   WHERE ip = captured_ip     |
  |                              |   AND created_at::date = today
  |                              |                              |
  |                              |   if count >= 1 → 429        |
  |                              |   if today_total >= 10 → 429 |
  |                              |                              |
  |                              |-- INSERT request ----------> |
  |                              |<-- ok --------------------- |
  |<-- 200 { success } ---------|                              |
```

### Routes
| Path | Page | Purpose |
|------|------|---------|
| `/` | `RequestForm.vue` | Users submit song requests |
| `/projector` | `Projector.vue` | Cinema projector view — cycles through requests |

---

## Security Layer

### 1. Edge Function (Primary Defense)
**`POST /api/submit-request`** — A Supabase Edge Function in Deno that:
- Reads the real client IP from `request.headers.get("x-forwarded-for")` (server-side, can't be forged by the browser)
- Checks DB: `COUNT(*) FROM song_requests WHERE ip_address = real_ip AND created_at::date = CURRENT_DATE`
- If ≥ 1 → **rejects** (each IP gets 1 request per day)
- Also checks total daily count: if ≥ 10 → **rejects** (global cap)
- If valid → inserts the request with the captured IP
- Uses the Supabase `service_role` key (server-side only — never exposed to the browser) to bypass RLS

### 2. Honeypot Field (Bot Defense)
- A hidden form field (`<input name="website" style="opacity:0;position:absolute;left:-9999px" tabindex="-1" autocomplete="off">`)
- Bots auto-fill it, humans don't see it
- Edge function rejects any submission where `website` is non-empty
- Zero friction for real users

### 3. DB-Level Trigger (Secondary Defense)
- A Postgres `BEFORE INSERT` trigger as a last-resort check on `ip_address` count
- Acts as belt-and-suspenders in case the edge function logic has a race condition

### What This Stops
| Attack | How |
|--------|-----|
| Same user submitting 10 times | IP-based 1/day limit |
| Script/bot flooding | Honeypot catches bots; IP limit caps damage |
| IP spoofing | Edge function reads real `x-forwarded-for` header — not client-reported |
| 10 different people from same IP (NAT) | Global 10/day cap kicks in; first come first served |

---

## Database Schema

**Table: `song_requests`**
```sql
CREATE TABLE song_requests (
  id          BIGSERIAL PRIMARY KEY,
  from_name   TEXT NOT NULL,
  to_name     TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  message     TEXT NOT NULL DEFAULT '',
  ip_address  TEXT NOT NULL,           -- captured by edge function
  played      BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_song_requests_created_at ON song_requests (created_at);
CREATE INDEX idx_song_requests_ip_date ON song_requests (ip_address, created_at);
```

### RLS Policies
Since there's **no auth**, all operations go through the edge function (which uses `service_role`). The projector read is public:
- `SELECT` — public, no RLS restriction (the projector page needs to read)
- `INSERT` — restricted to `service_role` only (prevent direct client inserts that bypass the edge function)
- `UPDATE` — restricted to `service_role` only (projector marks `played = true` via the edge function or a separate edge function)
- `DELETE` — restricted to `service_role` only

Actually, simpler approach: make the `song_requests` table completely RLS-restricted for anon, and have **everything** go through edge functions. The projector reads via `GET /api/todays-requests` and marks played via `POST /api/mark-played`.

**Updated edge functions:**

| Function | Method | Purpose |
|----------|--------|---------|
| `submit-request` | POST | Validate spam limits, insert request |
| `todays-requests` | GET | Fetch today's unplayed requests (for projector) |
| `mark-played` | POST | Mark a request as played |

This keeps the `service_role` key **server-side only** and gives us full control.

---

## Daily Cleanup
- Trigger on `submit-request`: `DELETE FROM song_requests WHERE created_at::date < CURRENT_DATE` before inserting
- Keeps the table always clean — no cron needed

---

## Component Tree

```
App.vue
├── NavBar.vue              — Cinema-themed top bar with navigation
├── <RouterView>
│   ├── RequestForm.vue     — Song request submission form
│   └── Projector.vue       — Full-screen cinema projector
│       ├── MessageCard.vue  — Displays "From X → To Y" with message (30s)
│       └── VideoPlayer.vue  — YouTube iframe embed
└── ToastNotification.vue   — Success/error feedback
```

---

## Cinema Theme Design

- **Dark mode** background (#0a0a0a to #1a1a2e gradient)
- **Projector beam effect** — CSS gradient light cone from top-center
- **Cinema seats silhouette** at the bottom of the projector page
- **Red/gold accents** — cinema curtain colors and velvet textures
- **Font**: Monospace for the message cards (like subtitles), display serif font for headers
- The projector page is full-screen (100vh/100vw), meant to be displayed on a large screen

---

## Projector Page Logic (State Machine)

```
LOADING → MESSAGE (30s) → PLAYING (video duration) → MESSAGE (next request) → ...
                                                ↳ IDLE (no more requests)
```

1. Fetch oldest unplayed request via `GET /api/todays-requests`
2. Show MessageCard for 30 seconds (from/to/message on cinema screen, with dramatic fade-in)
3. Embed YouTube video, auto-play, detect when it ends
4. Call `POST /api/mark-played`
5. Repeat from step 1
6. If no requests → "Waiting for song requests..." idle screen with cinema ambiance (ambient seat lighting, faint projector glow)

---

## YouTube URL Handling

- **Accepted formats**: `youtu.be/ID`, `youtube.com/watch?v=ID`, `youtube.com/embed/ID`, `youtube.com/shorts/ID`, `m.youtube.com/watch?v=ID`
- **Extraction**: Regex `(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})`
- **Embed**: `https://www.youtube.com/embed/VIDEO_ID?autoplay=1&enablejsapi=1`
- **Validation**: Both client-side (pre-submit) and server-side (edge function)
- **Audio**: The projector page will be interacted with (navigate to it), so browser autoplay policy should allow unmuted play after user gesture.

---

## Implementation Steps

### Phase 1: Project Scaffolding
1. `npm create vite@latest . -- --template vue` — scaffold Vue 3 + Vite
2. Install dependencies: `tailwindcss`, `@tailwindcss/vite`, `vue-router`, `@supabase/supabase-js`
3. Configure Tailwind + Vite
4. Create `.env` with Supabase URL + anon key (Vite prefixes: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)

### Phase 2: Supabase Setup
5. Initialize Supabase CLI (`supabase init`)
6. Create the `song_requests` table with full schema via SQL migration
7. Set up RLS policies (anon: SELECT only; INSERT/UPDATE/DELETE: service_role only)
8. Create the cleanup trigger (delete old rows on insert)
9. Write 3 edge functions: `submit-request`, `todays-requests`, `mark-played`

### Phase 3: Core Frontend
10. Router setup with two routes
11. `RequestForm.vue` — form with validation, honeypot field, calls `submit-request` edge function
12. `Projector.vue` — state machine, calls `todays-requests` and `mark-played` edge functions
13. `NavBar.vue` — navigation, cinema-themed
14. `ToastNotification.vue` — reusable toast component
15. Composables: `useApi.js` (edge function calls), `useYoutubeId.js` (URL parsing)

### Phase 4: Cinema Theme & Polish
16. Tailwind config with cinema color palette
17. Full cinema dark mode styling
18. Projector beam CSS effect (conical gradient)
19. Cinema seat silhouettes (SVG or CSS shapes)
20. Animations: fade transitions for messages, curtain reveal effect
21. Responsive design (form works on mobile; projector fills screen)

### Phase 5: Testing & Edge Cases
22. Invalid YouTube URL rejection
23. IP limit reached → user-friendly error
24. Global daily limit reached → user-friendly error
25. Empty queue on projector → idle ambiance view
26. Network errors → retry toast

### Phase 6: GitHub Pages Deployment
27. `git init` + create GitHub repo via `gh` CLI
28. Configure hash routing (`createWebHashHistory`) for GitHub Pages compatibility
29. Set `base` in vite.config.js to `/<repo-name>/`
30. Deploy edge functions: `supabase functions deploy`
31. Create `.github/workflows/deploy.yml` — auto-build & deploy to GitHub Pages on push to main
32. Push code, verify GitHub Pages + edge functions are live

---

## Deployment Architecture

```
GitHub repo (source code)
├── push to main ──► GitHub Actions builds Vite ──► deploys to GitHub Pages
│
Supabase (remote)
├── Database: song_requests table (Postgres)
├── Edge Functions: submit-request, todays-requests, mark-played
└── Deployed separately via supabase CLI
```

**Why hash routing?** GitHub Pages doesn't support SPA history mode (no server to rewrite URLs to `index.html`). Using `createWebHashHistory()` gives us URLs like `/#/projector` — works perfectly with GitHub Pages without a 404.html hack.

**Edge functions are NOT on GitHub Pages.** They live on Supabase's infrastructure and the frontend calls them via the Supabase project URL. The frontend is purely static — the edge functions handle all server-side logic.

---

## Files to Create

```
/Users/pi/practice/AI/personal_pj/
├── index.html
├── package.json
├── vite.config.js
├── .env
├── src/
│   ├── main.js
│   ├── App.vue
│   ├── style.css                        — Tailwind + custom cinema styles
│   ├── router/
│   │   └── index.js
│   ├── lib/
│   │   └── supabase.js                  — Supabase client (anon key, for edge function calls only)
│   ├── composables/
│   │   ├── useApi.js                     — Fetch wrappers for all 3 edge functions
│   │   └── useYoutubeId.js              — YouTube ID extraction & validation
│   ├── components/
│   │   ├── NavBar.vue
│   │   ├── MessageCard.vue              — Cinema-style message display
│   │   ├── VideoPlayer.vue              — YouTube iframe wrapper
│   │   ├── ToastNotification.vue        — Toast notification system
│   │   └── CinemaSeats.vue             — Decorative seat silhouette
│   └── views/
│       ├── RequestForm.vue              — Song request form
│       └── Projector.vue               — Cinema projector page
└── supabase/
    ├── config.toml
    ├── migrations/
    │   └── 20260616000001_create_tables.sql
    └── functions/
        ├── submit-request/
        │   └── index.ts
        ├── todays-requests/
        │   └── index.ts
        └── mark-played/
            └── index.ts
└── .github/
    └── workflows/
        └── deploy.yml                        — GitHub Actions auto-deploy to Pages
```

---

## Key Design Decisions

1. **All writes go through edge functions** — the `service_role` key never touches the browser. RLS blocks anon INSERT/UPDATE/DELETE.
2. **IP captured server-side** — `x-forwarded-for` from the edge function, not from the client.
3. **1 IP = 1 request per day** — plus global 10/day cap. Two-tier rate limiting.
4. **Honeypot over CAPTCHA** — invisible to users, catches most bots, no friction.
5. **Cleanup on insert** — trigger deletes stale rows, no cron/pg_cron needed (free tier compatible).
6. **State machine on projector** — `IDLE → MESSAGE → PLAYING → MESSAGE → ...` — clean, predictable.
7. **YouTube IFrame API** — reliable embedding with JS control over playback.
8. **Hash routing for GitHub Pages** — `/#/` and `/#/projector` URLs work without server-side redirects.
9. **Edge functions deployed separately** — `supabase functions deploy` pushes to Supabase; frontend is pure static on GitHub Pages.
