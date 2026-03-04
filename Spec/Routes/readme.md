### Routes (<span style="color:#1f77b4;">Laurin</span>)

High-level plan for frontend routes and their connection to backend APIs. This file focuses on **URLs, responsibilities, and data flow**, not implementation. Owned by <span style="color:#1f77b4;">Laurin</span>.

---

## 1. Goals

- Define clear URLs for the dashboard pages.
- Specify which backend endpoints each route uses.
- Keep it simple for now: local development URLs, later possible domains like `icicles.ch` or `icicles.online`.

---

## 2. Frontend Routes

Local development base URL: `http://localhost:<port>`.

- `/` – **Dashboard**
  - Shows live data (fuel, RPM, temperature) and connection status.
  - Uses backend endpoint: `GET /api/live`.

- `/recordings` – **Recordings list**
  - Shows list of available recordings.
  - Uses backend endpoint: `GET /api/recordings`.

- `/recordings/:id` – **Recording detail / replay**
  - Shows details and replay controls for a specific recording.
  - Uses backend endpoints:
    - `GET /api/recordings/:id`
    - `POST /api/recordings/:id/replay`

- `/settings` – **Settings**
  - Shows polling interval, interface mode (simulator/hardware), logging options.
  - Uses backend endpoints:
    - `GET /api/settings` (optional, can be added later)
    - `POST /api/settings` to change simple options (later).

---

## 3. Backend Integration Choices

- **Transport**
  - For v1, use **HTTP polling** from the client to the backend (simpler than WebSockets).
  - Poll `GET /api/live` at a safe interval; WebSockets can be considered later if needed.

- **Error handling**
  - Backend should respond with JSON errors in the form:
    - `{ "error": { "code": "SOME_CODE", "message": "Human readable message" } }`.
  - Frontend should show simple, understandable messages (e.g. “Backend not reachable”, “No recordings found”).

- **Hostnames**
  - Development: `http://localhost:<port>`.
  - Future idea: `https://icicles.ch` or `https://icicles.online` as public hostnames.

---

## 4. Tasks for <span style="color:#1f77b4;">Laurin</span>

- [ ] Confirm and document the final list of routes and what each page shows.
- [ ] Define the exact shapes of responses for `GET /api/live`, `GET /api/recordings`, `GET /api/recordings/:id`.
- [ ] Decide and document the HTTP status codes and error JSON format for common failure cases.
- [ ] Plan the polling strategy for live data (interval, backoff on errors).
- [ ] Add notes on how domain names (e.g. `icicles.ch`) would point to the dashboard in a later phase.

---

#### Navigation

- [Home](../../README.md)
- [Client spec](../Client/readme.md)
- [Backend spec](../Backend/server.md)
- [CLI spec](../../Features/cli.md)
- [Tasks: routes](../../Tasks/routes.md)
