# CSH Auto Data — explained simply

This project is a **local web dashboard** that shows car data (RPM, temperature, fuel, speed, and more). When no real car is connected, the backend **pretends to be a car** so you can build and test the UI anyway.

Everything runs on your laptop only — no cloud.

---

## How to start 

1. **One click:** open [`package/`](../package/) and double-click **`Start CSH Auto Data.command`**

   Or terminal:

   ```bash
   cd package
   npm start
   ```

2. Open **http://localhost:4000** if the browser did not open automatically.

First run installs backend dependencies automatically.

---

## API key (security)

Every request to the backend must send:

```
x-api-key: csh-secure-v1
```

The dashboard does this automatically. This stops random programs on your PC from reading car data without knowing the key.

---

## Folder map

| Folder | What it does |
|--------|----------------|
| `package/` | One-click launcher (`npm start`, `.command` file) |
| `client/` | Browser UI (HTML, CSS, JavaScript) |
| `backend/src/` | Fake car + real cable support + HTTP API |
| `cli/adm.js` | Starts backend and opens the dashboard |
| `docs/getting-started.md` | This guide |

---

## Cables and emulators (profiles)

The backend uses a **profile** to decide where data comes from. Set with environment variables or in **Settings** in the dashboard.

| What you plug in | Profile name | What to set |
|------------------|--------------|-------------|
| Nothing (default) | `simulation` | — |
| ELM327 USB OBD-II cable | `hardware_elm327` | `SERIAL_PATH` = your port, e.g. `/dev/tty.usbserial-1410` or `COM3` |
| A recorded JSON/JSONL file | `replay_file` | `REPLAY_FILE` = path to the file |

**Settings page:** choose *simulator* or *hardware (ELM327)* and enter the serial path, then **Apply**. That sends `POST /api/session` to the backend.

---

## Main API endpoints

| Endpoint | Purpose |
|----------|---------|
| `GET /api/live` | Current car values |
| `GET /api/status` | Backend health + active profile |
| `GET /api/recordings` | List of saved sessions (demo data for now) |
| `GET /api/adapters` | List of supported profiles |
| `GET /api/session` | Current profile and serial path |
| `POST /api/session` | Change profile / serial path |

---

## How to add a new sensor

1. Add the field to **`backend/src/carState.ts`** and the simulation tick in **`backend/src/synthesis.ts`**.
2. If the value can come from OBD, add the PID decode in **`backend/src/adapters/elm327.ts`**.
3. Expose it on **`GET /api/live`** (automatic once it is in `CarState` and adapters return it).
4. Show it in **`client/app.js`**: `normalizeLiveData`, dashboard cards, and replay series.

---

## How to add a new cable or emulator

1. Create a new class in **`backend/src/adapters/`** that implements **`BusAdapter`** (see `types.ts`).
2. Register it in **`backend/src/adapters/registry.ts`**.
3. Document the profile name and env vars in this file.
4. Optionally add a row to **`GET /api/adapters`** via `listAdapterProfiles()`.

The web client should **not** need changes if the new adapter still fills the same `/api/live` JSON shape.

---

## Troubleshooting

- **Dashboard shows “simulation” but you wanted hardware** — check serial path, cable drivers, and that you clicked Apply in Settings.
- **ELM327 errors in the banner** — `last_error` from the backend; often wrong port or car ignition off.
- **Old `backend/server.js`** — removed; use `cd backend && npm run dev` only.
