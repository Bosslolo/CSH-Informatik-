## Project Preparation Summary

High-level preparation based on `project-questions.md`. This is a planning document only – it defines what v1 should look like and who owns which areas.

---

## 1. Scope & Non-Goals

- **In-scope for v1**
  - Visual HTML dashboard that shows simulated and then real car data.
  - Basic backend planned and sketched (no need to fully implement everything yet).
  - Focus on planning each aspect in detail (client, routes, backend, CLI) across multiple files.
  - Support for **simulation first**, then connection to a real hardware adapter.
  - Runs on **macOS and Windows**.

- **Explicit non-goals for v1**
  - No production-grade cloud deployment (local-only).
  - No complex real-time optimizations (simple HTTP polling is enough).
  - No advanced user management, authentication, or permissions.
  - Not all pages need to be fully functional – high-quality specs and structure are more important.

---

## 2. Architecture & Data Flow

### 2.1 High-level components

- **Client (dashboard webapp)**
  - Sidebar-based navigation with sections for live data, recordings, replay, and status/settings.
  - Initially focuses on **visualizing data** (numbers, simple charts/values), later adding adjustments and controls.
  - Shows connection status, read frequency, and allows the user to switch between live and replay modes.

- **Backend services**
  - Bus adapter talks to the real hardware adapter (after v1 simulation phase).
  - Queue/stream manager controls polling frequency and protects from overload.
  - HTTP API layer exposes live data, recordings list, and replay endpoints.
  - File-based data store persists raw and decoded data as JSON or similar efficient format.

- **Bus interface & recordings**
  - Start with **simulated data** for development and testing.
  - Move to a real cable-to-car adapter once the core flow is stable.
  - Each drive is recorded into its own **folder**, named with finish date and exact time.
  - Limit: max ~5 GB per drive folder, max ~50 GB overall for all recordings.

### 2.2 Data flow (text description)

1. User plugs in adapter (or starts simulation).
2. User runs the CLI command, which starts backend and dashboard.
3. Backend uses the bus adapter (simulation/real) to poll data at a safe interval.
4. Data flows into a queue/stream, then into:
   - A **live snapshot** that the client polls via HTTP (e.g. `GET /api/live`).
   - **Recording files** on disk for drives that are being recorded.
5. Client polls for live data and status, and can request lists of recordings and start replays.
6. For replay, backend reads recorded files and serves data via the same or similar endpoints as live, but from disk.

---

## 3. Routes & APIs

### 3.1 Frontend routes

- `/` – Dashboard (live data view, connection status, read frequency) – **Owner: Tim**
- `/recordings` – List of previous recordings, basic metadata – **Owner: Tim + Laurin**
- `/recordings/:id` – Recording detail and replay controls – **Owner: Tim + Laurin**
- `/settings` – Polling interval, interface selection, logging toggle – **Owner: Tim**

The project can be reachable under domains like `icicles.ch` or `icicles.online` later; for now, we assume `http://localhost:<port>` for development.

### 3.2 Backend endpoints

Use simple HTTP endpoints first; WebSockets are an optional future improvement.

- `GET /api/live`
  - Returns the latest live values (fuel level, RPM, motor temp, etc.) plus connection status and read frequency.
  - Response: JSON object with fields like `{ rpm, temperature, fuel_liters, connected, read_interval_ms }`.
- `GET /api/recordings`
  - Returns a list of recordings found in the recordings directory.
  - Response: array of `{ id, name, finished_at, size_bytes }`.
- `GET /api/recordings/:id`
  - Returns metadata and possibly a small preview of data for a single recording.
- `POST /api/recordings/:id/replay`
  - Starts a replay session from stored files.
  - May return a simple `{ status: "started" }` JSON.
- `GET /api/status`
  - Health/status endpoint used by the CLI to confirm backend and bus connection are OK.

**Error format (better option):** always return JSON like `{ "error": { "code": "SOME_CODE", "message": "Human readable message" } }` with appropriate HTTP status codes.

---

## 4. Data Model & Storage

- **Storage type**
  - File-based, using JSON or another efficient text/binary format.
  - Directory for all recordings, with one **folder per drive**.

- **Recording structure**
  - Folder name: `YYYY-MM-DD_HH-mm-ss_<optional_label>` (finish date and exact time).
  - Contains:
    - `meta.json` – duration, car info, average speed, etc.
    - `raw.jsonl` or similar – raw bus frames (one per line).
    - `decoded.jsonl` – decoded, human-friendly data points.

- **Limits**
  - Max ~5 GB per drive folder.
  - Overall limit ~50 GB; if near the limit, newer recordings trigger warnings or cleanup (planned behavior).

- **Live snapshot**
  - Kept in memory and refreshed from the polling loop.
  - Optionally mirrored to a small file for debugging.

---

## 5. CLI Behavior

- Main command name: `csh-auto-data-machine` with a short alias `adm`.
- Responsibilities:
  - Start backend server.
  - Start frontend (or open browser pointing to it).
  - Run **two health checks**:
    - CLI → Backend (`GET /api/status`).
    - Backend confirms bus adapter connection or simulation readiness.
  - Only print “READY” when both checks pass.

- Expected startup behavior:
  - Clear any stuck temporary data if needed.
  - Print clear lines for:
    - Backend URL.
    - Dashboard URL.
    - Current polling interval.
    - Data directory for recordings and logs.

- Stopping:
  - Emergency: `Ctrl+C` terminates all processes.
  - Normal: provide a CLI option or dashboard button that triggers a graceful shutdown endpoint.

- Planned flags (v1):
  - `--port` (dashboard/backend port).
  - `--poll-interval-ms` (polling interval; default safe value, e.g. 500–1000 ms).
  - `--interface` (e.g. `simulator`, `hardware`).
  - `--data-dir` (where recordings are stored).
  - `--log-level` (`info`, `debug`, `error`).

---

## 6. Non-functional Requirements

- **Performance**
  - Max acceptable latency target: under 5000 ms between bus update and UI update.
  - Polling interval as low as possible without overloading hardware; start with ~1000 ms and measure.

- **Logging**
  - Logs directory `logs/`.
  - Errors stored as `.txt` files or structured log files.
  - Option to switch log level via CLI flag or settings.

- **Stability**
  - Visual dashboard and backend should “kinda work” even in early versions:
    - UI should not crash on missing data – show friendly fallback messages.
    - Backend should attempt to auto-recover or safely stop on overload.
  - Automatic safeguard: if read rate or data size grows too fast, pause recording and write a warning log.

- **Testing**
  - Manual checklist-based testing using fake replay data.
  - Replay recorded sessions to validate UI flows and backend stability.

---

## 7. Task Breakdown by Person

### 7.1 <span style="color:#ff0000;">Tim</span> (Client / UI + CLI UX)

- [ ] Design sidebar layout with sections for live, recordings, replay, settings.
- [ ] Implement dashboard wireframes (HTML/CSS) focusing on visualizing live data.
- [ ] Add basic components: live data panel, recordings list, replay controls, status banner.
- [ ] Define how connection status and read frequency are displayed (icons, colors, text).
- [ ] Draft CLI user experience: startup messages, “ready” text, error formatting.

### 7.2 <span style="color:#1f77b4;">Laurin</span> (Routes / Integration)

- [ ] Define concrete frontend routes and ensure navigation matches them.
- [ ] Specify mapping from each route to backend endpoints (`/api/live`, `/api/recordings`, etc.).
- [ ] Decide and document polling strategy for live data (intervals, endpoints).
- [ ] Specify how errors from backend are turned into simple JSON error objects and shown in the UI.
- [ ] Plan URL structure for future public hosting (e.g. `icicles.ch`, `icicles.online`) while keeping local dev simple.

### 7.3 <span style="color:#ff69b4;">Jana</span> (Backend / Storage / CLI internals)

- [ ] Sketch backend modules: bus adapter, queue manager, API layer, file-based data store.
- [ ] Define file/folder layout for recordings and logs (names, size limits, where saved).
- [ ] Plan rate limiting, overload detection, and automatic safe save/stop behavior.
- [ ] Specify simulation mode vs. real hardware mode for the bus adapter.
- [ ] Define CLI health-check behavior and backend `/api/status` contract.


