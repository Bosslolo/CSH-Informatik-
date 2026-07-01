# CLI — App launcher

**Owner: Jana** (process) · **Tim** (user-facing messages, see spec)

## What this folder is

One script that starts the backend and opens the dashboard in your browser.

| File | Purpose |
|------|---------|
| [`adm.js`](adm.js) | Spawns `npm run dev` in `backend/`, waits for `/api/status`, opens `http://localhost:4000` |

## What Jana owns

- Start/stop backend child process
- Health check loop until API responds
- Exit cleanly on `Ctrl+C`

## Usage

From repo root:

```bash
cd package
npm start
```

Or double-click **`package/Start CSH Auto Data.command`** (macOS).

## Spec

[`../docs/cli/spec.md`](../docs/cli/spec.md)

## Flow

```
npm start / node cli/adm.js
    → backend npm run dev (port 4000)
    → poll GET /api/status
    → open browser → client served by backend
```
