---
name: cinema-theme
description: >
  Apply the Cinema Dark Mode design system to any Vue component.
  Use this skill when styling UI for the Cinema Song Request website —
  every page, component, and animation must follow this theme.
  Provides the full color palette, typography, responsive breakpoints,
  reusable Tailwind utility patterns, component recipes (form, projector,
  navbar, message card, seats), and animation presets.
---

# Cinema Theme Design System

## Guiding Principles

1. **It's a cinema, not a website.** Every pixel should feel like a movie theater at night.
2. **Darkness is the canvas.** The background is deep, starry, and atmospheric — content glows against it.
3. **Projection is sacred.** The projector beam and the screen are the focal point. Nothing competes.
4. **Velvet, gold, neon.** Red velvet curtains, warm gold accents, subtle neon/glow for interactivity.
5. **Responsive but cinematic.** The projector page is full-screen immersive; the form page is accessible on any device.

---

## Color Palette

### Primary — Background (Darkness)

| Token | Hex | Tailwind Class | Usage |
|-------|-----|----------------|-------|
| `cinema-void` | `#06040a` | `bg-cinema-void` | Deepest background — page base |
| `cinema-night` | `#0d0b1a` | `bg-cinema-night` | Card backgrounds, surfaces |
| `cinema-midnight` | `#14102e` | `bg-cinema-midnight` | Elevated surfaces, hover states |
| `cinema-cloud` | `#1a1640` | `bg-cinema-cloud` | Borders, subtle dividers |

### Accent — Cinema Velvet & Gold

| Token | Hex | Tailwind Class | Usage |
|-------|-----|----------------|-------|
| `cinema-red` | `#8b1a2b` | `text-cinema-red` / `bg-cinema-red` | Curtain color, primary accent |
| `cinema-red-bright` | `#c0392b` | `text-cinema-red-bright` | Hover/active states on red |
| `cinema-gold` | `#d4a853` | `text-cinema-gold` / `bg-cinema-gold` | Headers, important text, stars |
| `cinema-gold-dim` | `#8b7340` | `text-cinema-gold-dim` | Secondary gold, less emphasis |

### Projector

| Token | Hex | Tailwind Class | Usage |
|-------|-----|----------------|-------|
| `cinema-beam` | `#f5f0e8` | `from-cinema-beam` | Projector light cone (warm tungsten) |
| `cinema-beam-fade` | `rgba(245,240,232,0)` | `to-transparent` | Cone fade-out |
| `cinema-neon` | `#ff6b6b` | `text-cinema-neon` / `bg-cinema-neon` | Subtle glow accents, errors |

### Text

| Token | Hex | Tailwind Class | Usage |
|-------|-----|----------------|-------|
| `cinema-text` | `#e8e4dc` | `text-cinema-text` | Primary body text (warm off-white) |
| `cinema-text-dim` | `#9c98a6` | `text-cinema-text-dim` | Secondary text, placeholders |
| `cinema-subtitle` | `#f5e6c8` | `text-cinema-subtitle` | Projector message text (warm white) |

---

## Typography

### Font Families

```
.font-display     → "Playfair Display", Georgia, serif    (headings, marquee)
.font-cinema      → "Cormorant Garamond", Georgia, serif  (from/to names, elegant labels)
.font-subtitle    → "Courier Prime", "IBM Plex Mono", monospace  (message text, projector)
.font-body        → "Inter", system-ui, sans-serif         (form labels, UI text)
```

**Google Fonts to import:**
```
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Courier+Prime&family=Inter:wght@300;400;500;600&family=Playfair+Display:wght@400;700;900&display=swap');
```

### Type Scale
- **Hero headings** (marquee, projector title): `text-5xl md:text-7xl lg:text-8xl font-display`
- **Section headers**: `text-2xl md:text-3xl font-cinema font-semibold text-cinema-gold`
- **Names** (from/to on projector): `text-3xl md:text-4xl font-cinema font-bold text-cinema-text`
- **Message body** (projector card): `text-xl md:text-2xl font-subtitle text-cinema-subtitle leading-relaxed`
- **Form labels**: `text-sm font-medium text-cinema-text-dim font-body uppercase tracking-wider`
- **Body text**: `text-base font-body text-cinema-text`

---

## Responsive Breakpoints

| Breakpoint | Width | Projector Behavior | Form Behavior |
|------------|-------|-------------------|---------------|
| Mobile | <640px | Simplified, stacked layout | Full width, stacked fields |
| Tablet | 640-1024px | Medium projector view | Centered card, comfortable |
| Desktop | 1024-1280px | Full cinema view, seats visible | Centered narrower card |
| Large Screen | >1280px | Full immersive cinema | Max-width card, extra margin |

```css
/* Responsive projector text scale */
@screen sm  { .projector-msg { font-size: 1.125rem; } }
@screen md  { .projector-msg { font-size: 1.5rem; } }
@screen lg  { .projector-msg { font-size: 2rem; } }
@screen xl  { .projector-msg { font-size: 2.5rem; } }
```

---

## Tailwind Configuration

Add to `tailwind.config.js` or `vite.config.js` (Tailwind v4 uses CSS-based config):

```js
// tailwind.config.js (v3) or theme extension
theme: {
  extend: {
    colors: {
      'cinema-void': '#06040a',
      'cinema-night': '#0d0b1a',
      'cinema-midnight': '#14102e',
      'cinema-cloud': '#1a1640',
      'cinema-red': '#8b1a2b',
      'cinema-red-bright': '#c0392b',
      'cinema-gold': '#d4a853',
      'cinema-gold-dim': '#8b7340',
      'cinema-beam': '#f5f0e8',
      'cinema-neon': '#ff6b6b',
      'cinema-text': '#e8e4dc',
      'cinema-text-dim': '#9c98a6',
      'cinema-subtitle': '#f5e6c8',
    },
    fontFamily: {
      'display': ['"Playfair Display"', 'Georgia', 'serif'],
      'cinema': ['"Cormorant Garamond"', 'Georgia', 'serif'],
      'subtitle': ['"Courier Prime"', '"IBM Plex Mono"', 'monospace'],
      'body': ['"Inter"', 'system-ui', 'sans-serif'],
    },
  },
}
```

---

## Shared Background Pattern — Starry Night + Projector Beam

Every page gets this base background. Apply to `<body>` or the root `<div id="app">`:

```html
<div class="min-h-screen bg-cinema-void relative overflow-hidden">
  <!-- Starfield layer (CSS-only, no JS) -->
  <div class="absolute inset-0 stars-layer opacity-40 pointer-events-none"></div>

  <!-- Subtle radial glow (projector light from top-center) -->
  <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-30%,rgba(212,168,83,0.06)_0%,transparent_60%)] pointer-events-none"></div>

  <!-- Page content -->
  <div class="relative z-10">
    <slot />
  </div>
</div>
```

**Starfield CSS** (add to global `style.css`):
```css
.stars-layer {
  background-image:
    radial-gradient(1px 1px at 10% 15%, rgba(255,255,255,0.4), transparent),
    radial-gradient(1px 1px at 25% 8%, rgba(255,255,255,0.5), transparent),
    radial-gradient(1px 1px at 40% 20%, rgba(255,255,255,0.3), transparent),
    radial-gradient(1px 1px at 55% 5%, rgba(255,255,255,0.6), transparent),
    radial-gradient(1px 1px at 70% 12%, rgba(255,255,255,0.4), transparent),
    radial-gradient(1px 1px at 85% 18%, rgba(255,255,255,0.3), transparent),
    radial-gradient(1px 1px at 15% 25%, rgba(255,255,255,0.5), transparent),
    radial-gradient(2px 2px at 35% 3%, rgba(255,255,255,0.7), transparent),
    radial-gradient(1px 1px at 60% 22%, rgba(255,255,255,0.4), transparent),
    radial-gradient(1px 1px at 78% 7%, rgba(255,255,255,0.5), transparent),
    radial-gradient(1px 1px at 92% 10%, rgba(255,255,255,0.3), transparent),
    radial-gradient(1px 1px at 5% 30%, rgba(255,255,255,0.4), transparent),
    radial-gradient(1px 1px at 48% 28%, rgba(255,255,255,0.35), transparent),
    radial-gradient(1px 1px at 80% 25%, rgba(255,255,255,0.45), transparent);
  background-size: 100% 40%;
  background-repeat: no-repeat;
}
```

---

## Component Recipes

### 1. NavBar.vue — Cinema Marquee Header

```html
<nav class="bg-cinema-night/80 backdrop-blur-md border-b border-cinema-gold-dim/30">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
    <!-- Logo / Title -->
    <router-link to="/" class="font-display text-xl md:text-2xl text-cinema-gold tracking-wider hover:text-cinema-beam transition-colors duration-300">
      🎬 Cinema Requests
    </router-link>

    <!-- Nav links -->
    <div class="flex gap-6 font-body text-sm uppercase tracking-widest">
      <router-link to="/"          class="text-cinema-text-dim hover:text-cinema-gold transition-colors duration-300">Request</router-link>
      <router-link to="/projector" class="text-cinema-text-dim hover:text-cinema-gold transition-colors duration-300">Projector</router-link>
    </div>
  </div>
</nav>
```

**Rules:**
- Always semi-transparent backdrop blur (`bg-cinema-night/80 backdrop-blur-md`)
- Bottom border in cinema-gold-dim at 30% opacity
- Logo uses `.font-display` with gold color and a cinema emoji (🎬 or 🎥)
- Nav links: uppercase, wide letter-spacing, dim text → gold on hover
- Fixed height: `h-16`

### 2. RequestForm.vue — Song Request Page

```html
<div class="min-h-screen bg-cinema-void flex items-center justify-center px-4 py-12">
  <div class="w-full max-w-lg">
    <!-- Card -->
    <div class="bg-cinema-night/60 backdrop-blur-sm border border-cinema-cloud/30 rounded-2xl p-8 shadow-2xl shadow-black/50">
      <!-- Heading -->
      <h1 class="font-display text-3xl md:text-4xl text-center text-cinema-gold mb-2">
        Request a Song
      </h1>
      <p class="text-cinema-text-dim text-center text-sm mb-8 font-body">
        Dedicate a song to someone special
      </p>

      <!-- Form fields -->
      <form @submit.prevent="handleSubmit" class="space-y-5">
        <!-- From Name -->
        <div>
          <label class="block text-sm font-body uppercase tracking-wider text-cinema-text-dim mb-1.5">Your Name</label>
          <input v-model="fromName" required
            class="w-full bg-cinema-midnight border border-cinema-cloud/40 rounded-lg px-4 py-3 text-cinema-text font-body placeholder:text-cinema-text-dim/50 focus:border-cinema-gold focus:ring-1 focus:ring-cinema-gold/30 outline-none transition-all duration-300"
            placeholder="Enter your name" />
        </div>

        <!-- To Name -->
        <div>
          <label class="block text-sm font-body uppercase tracking-wider text-cinema-text-dim mb-1.5">For Whom</label>
          <input v-model="toName" required
            class="w-full bg-cinema-midnight border border-cinema-cloud/40 rounded-lg px-4 py-3 text-cinema-text font-body placeholder:text-cinema-text-dim/50 focus:border-cinema-gold focus:ring-1 focus:ring-cinema-gold/30 outline-none transition-all duration-300"
            placeholder="Your beloved one's name" />
        </div>

        <!-- YouTube URL -->
        <div>
          <label class="block text-sm font-body uppercase tracking-wider text-cinema-text-dim mb-1.5">YouTube URL</label>
          <input v-model="youtubeUrl" required type="url"
            class="w-full bg-cinema-midnight border border-cinema-cloud/40 rounded-lg px-4 py-3 text-cinema-text font-body placeholder:text-cinema-text-dim/50 focus:border-cinema-gold focus:ring-1 focus:ring-cinema-gold/30 outline-none transition-all duration-300"
            placeholder="https://youtube.com/watch?v=..." />
        </div>

        <!-- Message -->
        <div>
          <label class="block text-sm font-body uppercase tracking-wider text-cinema-text-dim mb-1.5">Your Message</label>
          <textarea v-model="message" required rows="3" maxlength="300"
            class="w-full bg-cinema-midnight border border-cinema-cloud/40 rounded-lg px-4 py-3 text-cinema-text font-body placeholder:text-cinema-text-dim/50 focus:border-cinema-gold focus:ring-1 focus:ring-cinema-gold/30 outline-none transition-all duration-300 resize-none"
            placeholder="Why this song? What do you want to say?"></textarea>
          <p class="text-right text-xs text-cinema-text-dim/60 mt-1">{{ message.length }}/300</p>
        </div>

        <!-- Honeypot (hidden) -->
        <input name="website" style="opacity:0;position:absolute;left:-9999px" tabindex="-1" autocomplete="off" />

        <!-- Submit -->
        <button type="submit"
          class="w-full bg-cinema-red hover:bg-cinema-red-bright text-white font-body font-semibold py-3.5 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-cinema-red/20 active:scale-[0.98] uppercase tracking-widest text-sm">
          🎵 Dedicate This Song
        </button>
      </form>
    </div>

    <!-- Daily counter -->
    <p class="text-center text-cinema-text-dim/50 text-xs mt-6 font-body">
      {{ remainingSlots }} of 10 song requests remaining today
    </p>
  </div>
</div>
```

**Rules:**
- Card: `bg-cinema-night/60 backdrop-blur-sm` with subtle border, rounded corners
- All inputs: dark background (`bg-cinema-midnight`), subtle border, gold focus ring
- Labels: uppercase, tracked-wide, dim text
- Submit button: cinema-red, bold, uppercase, with hover glow
- Honeypot field: always present, invisible, absolute positioned off-screen
- Max-width `max-w-lg` for the card — never stretches too wide
- Character counter on message textarea (max 300)

### 3. Projector.vue — Cinema Projector Page (Full Screen)

```html
<div class="h-screen w-screen bg-cinema-void relative overflow-hidden flex flex-col">
  <!-- Starfield -->
  <div class="absolute inset-0 stars-layer opacity-30 pointer-events-none"></div>

  <!-- Projector beam cone (top-center) -->
  <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[60vh] pointer-events-none"
       style="background: radial-gradient(ellipse at 50% 0%, rgba(245,240,232,0.08) 0%, rgba(245,240,232,0.03) 40%, transparent 70%);">
  </div>

  <!-- Projector lens glow dot -->
  <div class="absolute top-8 left-1/2 -translate-x-1/2 w-3 h-3 bg-cinema-beam rounded-full blur-sm opacity-60 pointer-events-none animate-pulse"></div>

  <!-- Screen area (where messages/videos appear) -->
  <div class="flex-1 flex items-center justify-center px-4 md:px-12">
    <!-- Content slot: MessageCard or VideoPlayer -->
    <slot />
  </div>

  <!-- Cinema seats silhouette (bottom) -->
  <CinemaSeats />
</div>
```

**Rules:**
- Full viewport: `h-screen w-screen` — the projector is immersive
- Starfield at 30% opacity (dimmer behind the bright projection)
- Projector beam: radial gradient from top-center, warm tungsten color
- Tiny glowing dot at the top (the "projector lens")
- Content area: flex-1 centered — this is where MessageCard and VideoPlayer render
- Always shows CinemaSeats at the bottom

### 4. MessageCard.vue — Cinema Message Display

```html
<div class="w-full max-w-3xl mx-auto text-center animate-fade-in-up">
  <!-- From/To (like opening credits) -->
  <div class="mb-8 space-y-2">
    <p class="font-cinema text-2xl md:text-3xl text-cinema-gold-dim italic">From</p>
    <p class="font-display text-4xl md:text-6xl lg:text-7xl text-cinema-beam font-bold tracking-wide">{{ fromName }}</p>
  </div>

  <!-- Divider -->
  <div class="w-24 h-px bg-cinema-gold/40 mx-auto my-8"></div>

  <!-- To -->
  <div class="mb-10 space-y-2">
    <p class="font-cinema text-2xl md:text-3xl text-cinema-gold-dim italic">To</p>
    <p class="font-display text-4xl md:text-6xl lg:text-7xl text-cinema-beam font-bold tracking-wide">{{ toName }}</p>
  </div>

  <!-- Message (subtitle style, monospace) -->
  <div class="bg-cinema-night/40 backdrop-blur-sm border border-cinema-cloud/20 rounded-xl px-8 py-6 max-w-2xl mx-auto">
    <p class="font-subtitle text-xl md:text-2xl lg:text-3xl text-cinema-subtitle leading-relaxed">
      "{{ message }}"
    </p>
  </div>

  <!-- Countdown -->
  <p class="mt-8 text-cinema-text-dim/50 text-sm font-body">
    Music begins in {{ countdown }}s...
  </p>
</div>
```

**Rules:**
- Maximum width `max-w-3xl` — keeps text readable on giant screens
- "From" and "To" use `.font-cinema` in italic gold-dim (elegant, understated)
- Names: `.font-display` large, cinema-beam color, bold — they GLOW on screen
- Message: `.font-subtitle` (Courier Prime monospace) — feels like subtitles/film credits
- Message box: subtle backdrop blur background, soft border
- Countdown timer at the bottom, dim and small
- Fade-in-up animation on entry

### 5. VideoPlayer.vue — YouTube Embed Screen

```html
<div class="w-full h-full flex items-center justify-center">
  <div class="relative w-full" style="max-width: min(90vw, calc(90vh * 16/9));">
    <!-- Aspect ratio container -->
    <div class="relative w-full" style="padding-bottom: 56.25%;">
      <iframe
        :src="embedUrl"
        class="absolute inset-0 w-full h-full rounded-lg shadow-2xl shadow-black/60 border border-cinema-cloud/20"
        allow="autoplay; encrypted-media"
        allowfullscreen
        frameborder="0">
      </iframe>
    </div>
  </div>
</div>
```

**Rules:**
- Center the video, maintain 16:9 aspect ratio
- Max dimensions: 90vw wide, or 90vh tall (whichever limits first)
- Subtle border and deep shadow — video floats in darkness
- iframe takes full container with `absolute inset-0`

### 6. CinemaSeats.vue — Decorative Seats Silhouette

```html
<div class="relative w-full h-24 md:h-32 lg:h-40 pointer-events-none">
  <!-- SVG row of seats -->
  <svg viewBox="0 0 1200 120" class="w-full h-full" preserveAspectRatio="none">
    <!-- Row 1 (back) -->
    <rect x="50" y="10" width="60" height="0" rx="0" fill="#1a1640" opacity="0.6" />
    <!-- ... use repeating small seat shapes ... -->
    <!-- Seats as small trapezoids/shapes -->
    <g fill="#1a1640" opacity="0.5">
      <!-- Back row -->
      <path d="M40,30 Q70,20 100,30 L95,55 Q70,65 45,55 Z" />
      <path d="M120,30 Q150,20 180,30 L175,55 Q150,65 125,55 Z" />
      <!-- repeat for full row width... -->
    </g>
  </svg>
</div>
```

**Rules:**
- Fixed height bar at the very bottom of the projector screen
- Dark silhouettes in `cinema-midnight` (same as the night theme)
- Non-interactive (`pointer-events-none`)
- Creates the illusion of sitting in a theater looking at the screen
- Responsive height: `h-24 md:h-32 lg:h-40`
- Never gets in the way of content

### 7. ToastNotification.vue — Feedback Toast

```html
<Transition name="toast-slide">
  <div v-if="visible"
    :class="[
      'fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl font-body text-sm shadow-2xl backdrop-blur-md border transition-all duration-300',
      type === 'success' ? 'bg-green-900/80 border-green-600/40 text-green-100' :
      type === 'error'   ? 'bg-cinema-red/80 border-cinema-red-bright/40 text-white' :
                           'bg-cinema-night/80 border-cinema-gold-dim/30 text-cinema-text'
    ]"
  >
    <p>{{ message }}</p>
  </div>
</Transition>
```

**Animation CSS:**
```css
.toast-slide-enter-active { transition: all 0.4s ease-out; }
.toast-slide-leave-active { transition: all 0.3s ease-in; }
.toast-slide-enter-from   { opacity: 0; transform: translate(-50%, 20px); }
.toast-slide-leave-to     { opacity: 0; transform: translate(-50%, 10px); }
```

---

## Animations

### Global Animation Presets (add to `style.css`)

```css
/* Fade in + slide up (for message card, content reveals) */
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(30px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up {
  animation: fade-in-up 0.8s ease-out forwards;
}

/* Slow pulse glow (for projector lens, stars) */
@keyframes pulse-glow {
  0%, 100% { opacity: 0.4; }
  50%      { opacity: 0.8; }
}
.animate-pulse-glow {
  animation: pulse-glow 3s ease-in-out infinite;
}

/* Slow fade in (for ambient elements) */
@keyframes fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
.animate-fade-in {
  animation: fade-in 1.5s ease-out forwards;
}

/* Curtain reveal (for projector transitions) */
@keyframes curtain-reveal {
  from { clip-path: inset(0 50% 0 50%); }
  to   { clip-path: inset(0 0 0 0); }
}
.animate-curtain-reveal {
  animation: curtain-reveal 1s ease-in-out forwards;
}

/* Subtle float (for idle waiting state) */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-8px); }
}
.animate-float {
  animation: float 4s ease-in-out infinite;
}
```

### Transition Timing (Tailwind `duration-*` classes)
- Hover transitions: `duration-300` (fast, responsive)
- Page/component transitions: `duration-500` (smooth, deliberate)
- Projector scene changes: `duration-1000` (cinematic)

---

## Responsive Rules

### Form Page (RequestForm)
```
Mobile (<640px):
  - Card: full-width, less padding (p-6)
  - Title: text-2xl
  - Inputs: full-width, comfortable tap targets (h-12)
  - Submit: full-width, large tap target

Desktop (≥640px):
  - Card: max-w-lg, centered, p-8+
  - Title: text-3xl md:text-4xl
  - Inputs: same width, just more whitespace
  - Submit: full-width, with hover effects
```

### Projector Page
```
Mobile (<640px):
  - Names: text-2xl
  - Message: text-lg
  - Seats: h-16 (thin strip)
  - Video: full-width, constrained to screen

Tablet (640-1024px):
  - Names: text-4xl
  - Message: text-xl
  - Seats: h-24

Desktop (≥1024px):
  - Names: text-6xl lg:text-7xl
  - Message: text-2xl lg:text-3xl
  - Seats: h-32 lg:h-40
  - Prominent projector beam
  - Full starfield visible
```

### NavBar
- Always `h-16` — fixed height
- Links: hidden on very small screens (<360px), visible otherwise
- Title: smaller on mobile, full on desktop

---

## Do's and Don'ts

### ✅ DO
- Use `bg-cinema-void` as the page base background
- Use `font-display` for hero text, `font-subtitle` for messages
- Use gold for emphasis, red for primary actions
- Keep the projector page immersive (no nav clutter, no scrollbars)
- Add the starfield layer to every page background
- Use semi-transparent backgrounds (`bg-cinema-night/60`) + backdrop-blur for cards
- Use uppercase tracking-widest for labels and buttons
- Test on mobile — the form must work on phones

### ❌ DON'T
- Don't use pure white (#fff) — always cinema-text (#e8e4dc) or cinema-beam (#f5f0e8)
- Don't use bright saturated colors except cinema-red for primary actions
- Don't add scrollbars on the projector page — it must fit 100vh
- Don't use default browser fonts — always pick from the cinema font stack
- Don't use flat, opaque backgrounds — prefer transparency + blur
- Don't forget the honeypot field in the form
- Don't use system-default blue links — use cinema-gold or cinema-red
