# Routes & integration

**Owner: Laurin**

## What you own

- **Frontend routes** — which URL shows which page (`#/`, `#/recordings`, etc.)
- **API wiring** — how the client talks to the backend (polling, headers, error handling)
- **Data contract** — what JSON shape each route expects from Jana's API

Implementation lives in [`../../client/app.js`](../../client/app.js) (hash router, `refreshLiveData`, `normalizeLiveData`, settings POST).

## Route map

| Hash route | Page | Backend endpoints |
|------------|------|-------------------|
| `/` | Live dashboard | `GET /api/live` (polled) |
| `/recordings` | Recording list | `GET /api/recordings` |
| `/recordings/:id` | Replay | `GET /api/recordings/:id`, replay controls |
| `/settings` | Settings | `GET/POST /api/session` |

Base URL: `http://localhost:4000` · Header: `x-api-key: csh-secure-v1`

## Your files

| File | Purpose |
|------|---------|
| This README | Route design and API mapping |
| [`routes.md`](routes.md) | Task checklist |
| [`../../client/app.js`](../../client/app.js) | Where routes are implemented |

## Specs

- [`../client/README.md`](../client/README.md) — Tim's UI spec
- [`../backend/server.md`](../backend/server.md) — Jana's API spec
- [`../api-contract.json`](../api-contract.json) — example JSON payloads
- [`../system-contract.md`](../system-contract.md) — canonical API rules

## Navigation

- [Repo home](../../README.md)
- [Docs index](../README.md)
- [Client folder](../../client/)
