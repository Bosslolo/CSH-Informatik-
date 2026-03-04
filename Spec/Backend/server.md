### Backend (<span style="color:#ff69b4;">Jana</span>)

High-level plan for backend services: bus adapter, queue manager, API, and storage. Language/stack can be TypeScript/Node or Python – this file focuses on **behavior and structure**, not the exact tech. Owned by <span style="color:#ff69b4;">Jana</span>.

---

## 1. Goals

- Connect (eventually) to a **real hardware adapter** attached to the car.
- Provide a simple HTTP API for the client and CLI.
- Safely **poll**, **record**, and **replay** bus data without overloading the car or the laptop.

---

## 2. Main Modules

- **Bus adapter**
  - Talks to the car bus or to a **simulator** during early development.
  - Knows how to open/close the serial connection or simulation source.

- **Queue / stream manager**
  - Polls data at a configured interval (e.g. 500–1000 ms).
  - Ensures that load stays under safe limits (detects when too many frames arrive).

- **API layer**
  - Exposes HTTP endpoints like `/api/live`, `/api/recordings`, `/api/recordings/:id`, `/api/status`.
  - Wraps all errors into a simple JSON error format.

- **Data store**
  - Saves recordings to disk (JSON or similar formats).
  - Organizes recordings into one **folder per drive** with metadata and raw/decoded data.

---

## 3. Recording Model & Limits

- **Per drive**
  - One folder per drive, named by finish date and exact time (e.g. `2026-03-03_17-45-10`).
  - Content:
    - `meta.json` – metadata about the drive.
    - `raw.jsonl` – raw frames from the bus.
    - `decoded.jsonl` – decoded, user-friendly values.

- **Limits**
  - Max **5 GB per drive** folder.
  - Max **50 GB total** across all recordings.
  - When approaching limits, backend should log warnings and may stop new recordings safely.

---

## 4. Rate Limiting & Validation

- Measure real behavior of the bus and adjust polling interval accordingly.
- Start with a conservative interval (e.g. 1000 ms) and only reduce when stable.
- Validate incoming frames (correct length, valid fields).
- If overload is detected:
  - Automatically **save state**, flush buffers safely.
  - Temporarily stop recording or lower polling rate.

---

## 5. Replay Support

- Read recorded files and feed them back through the same or similar path as live data.
- Keep replay behavior simple:
  - Option 1: just step through data at a fixed speed.
  - Option 2 (later): respect original timestamps for more realism.
- Backend should not require a car connection when replaying.

---

## 6. Tasks for <span style="color:#ff69b4;">Jana</span>

- [ ] Define the internal interfaces between bus adapter, queue manager, API layer, and data store.
- [ ] Specify how the backend chooses between **simulation mode** and **real hardware mode**.
- [ ] Write down the expected JSON shapes for live data and recordings metadata.
- [ ] Plan the logic for rate limiting and overload protection (what thresholds, what actions).
- [ ] Describe in detail how replay reads files and pushes data to the client.

---

#### Navigation

- [Home](../../README.md)
- [Client spec](../Client/readme.md)
- [Routes spec](../Routes/readme.md)
- [CLI spec](../../Features/cli.md)
- [Tasks: backend](../../Tasks/backend.md)
