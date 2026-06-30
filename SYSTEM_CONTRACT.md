# AI SYSTEM CONTRACT (CSH-Auto-Data)

Context for AI tools extending this project.

## Security

All HTTP API calls **must** include:

- **Header:** `x-api-key`
- **Value:** `csh-secure-v1`

## Base URL

`http://localhost:4000`

## Bus profiles

| Profile | Description |
|---------|-------------|
| `simulation` | Built-in `CarSynthesis` (default) |
| `hardware_elm327` | ELM327 USB serial OBD-II |
| `replay_file` | JSON/JSONL file playback |

Environment: `BUS_PROFILE`, `SERIAL_PATH`, `REPLAY_FILE`.

## Endpoints

### `GET /api/live`

Canonical live payload (flat JSON):

```json
{
  "rpm": 820,
  "speed_kmh": 0,
  "fuel_liters": 45.5,
  "motor_temp": 88,
  "gear": 1,
  "battery_voltage": 12.4,
  "throttle_percent": 0,
  "intake_air_temp": 22,
  "timestamp": "2026-05-20T12:00:00.000Z",
  "temperature": 88,
  "connected": true,
  "mode": "simulation",
  "profile": "simulation",
  "read_interval_ms": 1000,
  "last_error": null
}
```

`temperature` is an alias of `motor_temp` for the client.

### `GET /api/status`

```json
{
  "backend": "OK",
  "bus": "CONNECTED",
  "status": "online",
  "profile": "simulation",
  "connected": true,
  "mode": "simulation",
  "engine_running": true,
  "last_error": null,
  "serial_path": null
}
```

### `GET /api/recordings`

```json
{
  "recordings": [
    {
      "id": "demo-001",
      "name": "Morning City Drive",
      "finished_at": "2026-03-10T07:42:00Z",
      "size_bytes": 1824112
    }
  ]
}
```

### `GET /api/adapters`

Lists available profiles for the settings UI.

### `GET /api/session` / `POST /api/session`

Session body:

```json
{
  "profile": "simulation",
  "serial_path": "",
  "replay_file": "",
  "read_interval_ms": 1000
}
```

POST accepts `interface`: `simulator` | `hardware` (mapped to profiles).

## Development rules

1. New sensors: add to `carState.ts` and `synthesis.ts` first; extend ELM327 PID map for hardware.
2. New cables: new `BusAdapter` in `backend/src/adapters/`, register in `registry.ts`.
3. Update this contract and `Spec/api-contract.json` after API changes.
4. Protect all `/api/*` routes with the API key middleware.
