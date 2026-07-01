# CSH-Informatik — Auto Data WebApp

Shared repo for the IT class. Local dashboard that reads car bus data (or simulates it) on your laptop — no cloud.

## Team

| Person | Area | Folder |
|--------|------|--------|
| **Tim** | Client / UI | [`client/`](client/) |
| **Laurin** | Routes / API wiring | [`client/app.js`](client/app.js) + [`docs/routes/`](docs/routes/) |
| **Jana** | Backend / CLI / data | [`backend/`](backend/), [`cli/`](cli/), [`data/`](data/) |

## Quick start

1. `cd backend && npm install && cd ..`
2. `npm start` or `node cli/adm.js`
3. Browser opens **http://localhost:4000** (API key: `x-api-key: csh-secure-v1`)

Details: [`docs/getting-started.md`](docs/getting-started.md)

## Repository map

```
CSH-Informatik-/
├── README.md          ← you are here (only doc at repo root)
├── client/            Tim — dashboard UI
├── backend/           Jana — HTTP API + bus adapters
├── cli/               Jana — launcher script
├── data/              Jana — replay sample files
└── docs/              Specs, tasks, API contract
```

| Folder | README |
|--------|--------|
| Client (Tim) | [`client/README.md`](client/README.md) |
| Backend (Jana) | [`backend/README.md`](backend/README.md) |
| CLI (Jana) | [`cli/README.md`](cli/README.md) |
| Routes (Laurin) | [`docs/routes/README.md`](docs/routes/README.md) |
| All documentation | [`docs/README.md`](docs/README.md) |

## Git workflow (class test)

Use **GitHub Desktop** + **github.com** for pull → branch → commit → push → merge PR.  
Ask your AI: *"I'm [Tim/Laurin/Jana] — help me with the team sync workflow."*
