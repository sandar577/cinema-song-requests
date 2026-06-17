---
marp: true
paginate: true
transition: fade
# PechaKucha: 6 slides, 20s auto-advance. Do not change the count.
auto-advance: 20
---

<!-- slide 1 -->
# Who's my person?
<!-- 20s -->

💑 Couples & loved ones who want to share a song — but want the dedication to feel
**cinematic**, not just another text or DM.

They're in Myanmar (🇲🇲) and use YouTube links to share music.

---

<!-- slide 2 -->
# Their problem

Sending a YouTube link via messenger is **forgettable**.

Static song-dedication pages feel like forms — no theater, no atmosphere, no moment.

There's no lightweight, immersive way to dedicate a song that makes both the sender
and receiver feel like they're in a **cinema**.

---

<!-- slide 3 -->
# What I built

**Screen Dedications** 🎬 — a cinema-themed website where you dedicate a YouTube song.

- **Request form** with IP rate limiting, MMT timezone-aware daily cap
- **Projector page** — immersive cinema view: dim light, velvet seats, projector beam,
  message card on screen → auto-plays the dedicated YouTube video
- All backed by **Supabase** (Postgres + Edge Functions + RLS)

---

<!-- slide 4 -->
# How I built it
- **MCP:** Supabase MCP — ran migrations, deployed Edge Functions, managed DB
- **Skill:** `.claude/skills/cinema-theme.md` — enforced cinema design system (color palette, typography, component recipes, animations) across every Vue component
- **Agent:** `.claude/agents/performant-code-reviewer.md` — reviewed code for performance side effects (N+1 queries, memory leaks, re-renders)

![bg right:30% fit](https://mermaid.ink/svg/flowchart%20TD%0A%20%20%20%20V%5BVue%203%20SPA%5D%20--%3E%20G%5BGitHub%20Pages%5D%0A%20%20%20%20V%20--%3E%20S%5BSupabase%20DB%5D%0A%20%20%20%20V%20--%3E%20E%5BEdge%20Functions%5D)

---

<!-- slide 5 -->
# Why it matters

**Emotion needs a stage.** A song dedication is a moment — it deserves curtains, a screen,
a beam of light. This project treats each song like a mini-premiere.

Technically: demonstrates **Claude Code + MCP + skills + agents** as a complete development
stack — from database schema migrations through Edge Function deployment to UI polish.

---

<!-- slide 6 -->
# Done checklist
- [x] repo public
- [x] MCP + skill + agent used
- [x] report.md in team repo
