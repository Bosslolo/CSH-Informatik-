# Client — Dashboard UI

**Owner: Tim** (HTML, CSS, visuals)  
**Integration: Laurin** (hash routes, API polling, data mapping in `app.js`)

## What this folder is

The browser dashboard for CSH Auto Data. Vanilla HTML/CSS/JS — no React or build step.

| File | Purpose |
|------|---------|
| [`index.html`](index.html) | Page shell: sidebar, nav links, main view container |
| [`styles.css`](styles.css) | Layout, cards, KPI grid, terminal-style live flow panels |
| [`app.js`](app.js) | Routing, polling, live data, recordings, replay, settings |

## What Tim builds here

- **Dashboard (`#/`)** — live KPI cards with a terminal-style text flow next to each value (new `busKey=value` lines as data arrives)
- **Recordings (`#/recordings`)** — table of saved sessions
- **Replay (`#/recordings/:id`)** — scrub through a recording
- **Settings (`#/settings`)** — poll interval, bus profile, serial path
- **Visual polish** — cards, badges, source trust labels, sparklines

## What Laurin wires here (same `app.js`)

- Hash routes: `/`, `/recordings`, `/recordings/:id`, `/settings`
- `GET /api/live` polling with header `x-api-key: csh-secure-v1`
- `normalizeLiveData()` — backend JSON → flat fields for the UI
- Settings → `POST /api/session`

## How to work on the UI

1. Start the app from repo root: `npm start`
2. Edit `styles.css` / dashboard markup in `app.js` (`renderDashboardView`, `renderKpiCard`)
3. Refresh the browser — no bundler

## Specs and tasks

- Design: [`../docs/client/README.md`](../docs/client/README.md)
- Task checklist: [`../docs/client/client.md`](../docs/client/client.md)

## Key UI concept: live field flow

Each KPI card shows the big formatted value **and** a small monospace panel beside it. On every poll, a new line like `rpm=820` is appended — same feel as terminal output when listing files. Decorative only; the formatted value is what users read.
