# Backend — API & bus adapters

**Owner: Jana**

## What this folder is

TypeScript Express server on **port 4000**. Reads car bus data (or simulates it) and exposes JSON over HTTP.

| Path | Purpose |
|------|---------|
| [`src/server.ts`](src/server.ts) | Express app, routes, API-key middleware |
| [`src/carState.ts`](src/carState.ts) | Shape of live vehicle values |
| [`src/synthesis.ts`](src/synthesis.ts) | Built-in car simulator |
| [`src/sessionManager.ts`](src/sessionManager.ts) | Active profile, serial path, poll interval |
| [`src/dataSource.ts`](src/dataSource.ts) | Trust labels for data origin |
| [`src/adapters/`](src/adapters/) | Bus profiles: simulation, ELM327, replay file |

## What Jana owns

- Serial / OBD communication (`hardware_elm327`)
- Queueing and stable streaming to `/api/live`
- Simulation when no car is connected (`simulation`)
- Replay from JSONL files (`replay_file`)
- Recordings list (demo catalog for now)
- Session API: `GET/POST /api/session`

## Commands

```bash
cd backend
npm install          # once
npm run dev          # development (ts-node)
npm run build && npm start   # production build
```

## Environment variables

| Variable | Values | Purpose |
|----------|--------|---------|
| `BUS_PROFILE` | `simulation`, `hardware_elm327`, `replay_file` | Data source |
| `SERIAL_PATH` | e.g. `/dev/tty.usbserial-*` | ELM327 port |
| `REPLAY_FILE` | path to `.jsonl` | File replay |

## Security

All `/api/*` routes require header `x-api-key: csh-secure-v1`.

## Specs

- [`../docs/backend/server.md`](../docs/backend/server.md)
- [`../docs/backend/backend.md`](../docs/backend/backend.md)
- [`../docs/system-contract.md`](../docs/system-contract.md)
- [`../docs/api-contract.json`](../docs/api-contract.json)

## Adding a sensor

1. `carState.ts` + `synthesis.ts`
2. ELM327 PID in `adapters/elm327.ts` if needed
3. Value appears on `GET /api/live` automatically
4. Tim/Laurin show it in `client/app.js` (`BUS_KPI_FIELDS`)

## Adding an adapter

1. New class implementing `BusAdapter` in `src/adapters/`
2. Register in `src/adapters/registry.ts`
