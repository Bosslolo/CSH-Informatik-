# CSH-Informatik — Auto Data WebApp

Shared repo for the IT class. Local dashboard that reads car bus data (or simulates it) on your laptop — no cloud.

## Team

| Person | Area | Folder |
|--------|------|--------|
| **Tim** | Client / UI | [`client/`](client/) |
| **Laurin** | Routes / API wiring | [`client/app.js`](client/app.js) + [`docs/routes/`](docs/routes/) |
| **Jana** | Backend / CLI / data | [`backend/`](backend/), [`cli/`](cli/), [`data/`](data/) |

## Quick start

**One click (macOS):** double-click **`Start CSH Auto Data.command`** in the repo root (or in [`package/`](package/)).

Or terminal:

```bash
node start-dashboard.js
```

The launcher starts **testing mode** (simulator) by default, or **real mode** if an ELM327 OBD cable is detected and connects successfully.

## Dashboard controls (testing mode)

On the live dashboard (`#/`), when the bus is running in simulation:

| Control | Action |
|---------|--------|
| **km/h / mph** toggle (under Speed) | Switch speed display between metric and imperial |
| **W** | Gas — accelerate the simulated vehicle |
| **S** | Brake — slow down; brake pressure shows on the Throttle card (red gauge) |

Speed can exceed 180 km/h in simulation. Display is converted for imperial; raw bus data stays in km/h.

Unit preference is also available under **Settings → Speed units** and is saved in the browser.

## Quick start (package folder)

```bash
cd package && npm start
```

## Repository map

```
CSH-Informatik-/
├── README.md       ← you are here
├── Start CSH Auto Data.command  ← root launcher (testing or real mode)
├── start-dashboard.js             ← launcher script
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
