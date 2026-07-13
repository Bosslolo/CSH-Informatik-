# CSH-Informatik — Auto Data WebApp

Shared repo for the IT class. Local dashboard that reads car bus data (or simulates it) on your laptop — no cloud.

## Team

| Person | Area | Folder |
|--------|------|--------|
| **Tim** | Client / UI | [`client/`](client/) |
| **Laurin** | Routes / API wiring | [`client/app.js`](client/app.js) + [`docs/routes/`](docs/routes/) |
| **Jana** | Backend / CLI / data | [`backend/`](backend/), [`cli/`](cli/), [`data/`](data/) |

## Quick start

**One click (macOS):** open [`package/`](package/) → double-click **`Start CSH Auto Data.command`**.

Or terminal:

```bash
cd package && npm start
```

## Repository map

```
CSH-Informatik-/
├── README.md       ← you are here
├── package/        ← one-click launcher (first package)
├── client/         Tim — dashboard UI
├── backend/        Jana — HTTP API + bus adapters
├── cli/            Jana — launcher script
├── data/           Jana — replay samples
└── docs/           specs and guides
```

| Folder | README |
|--------|--------|
| **Package (start here)** | [`package/README.md`](package/README.md) |
| Client (Tim) | [`client/README.md`](client/README.md) |
| Backend (Jana) | [`backend/README.md`](backend/README.md) |
| CLI (Jana) | [`cli/README.md`](cli/README.md) |
| Routes (Laurin) | [`docs/routes/README.md`](docs/routes/README.md) |
| Documentation | [`docs/README.md`](docs/README.md) |

## Git workflow (class test)

Use **GitHub Desktop** + **github.com** for pull → branch → commit → push → merge PR.  
Ask your AI: *"I'm [Tim/Laurin/Jana] — help me with the team sync workflow."*

All rights reserved. CSH School Final 2026.
