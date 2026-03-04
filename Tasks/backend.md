## Backend Tasks (<span style="color:#ff69b4;">Jana</span>)

High-level tasks for **bus adapter, queue manager, API layer, and storage**.

### Summary

The backend should (owner: <span style="color:#ff69b4;">Jana</span>):

- Start with a **simulation mode**, then support a real hardware adapter.
- Provide stable HTTP endpoints for live data, recordings, and replay.
- Store recordings as **files/folders on disk** with clear limits and naming.
- Protect the system from overload via rate limiting and validation.

### Tasks

- **Architecture & modules**
  - [ ] Write a short description of each module:
    - Bus adapter.
    - Queue/stream manager.
    - API layer.
    - Data store.
  - [ ] Draw a simple diagram or text flow: bus → queue → data store & live snapshot → API → client.

- **Simulation vs hardware**
  - [ ] Define how simulation mode works (where simulated data comes from, how it’s configured).
  - [ ] Describe the requirements for the real hardware adapter (port, protocol, any libraries).
  - [ ] Plan a configuration mechanism to switch between `simulator` and `hardware`.

- **Recording model & limits**
  - [ ] Finalize folder naming convention: `YYYY-MM-DD_HH-mm-ss_<label>` for each drive.
  - [ ] Decide exact file formats (e.g. `meta.json`, `raw.jsonl`, `decoded.jsonl`).
  - [ ] Document how to enforce:
    - Max 5 GB per drive folder.
    - Max 50 GB overall.
  - [ ] Specify what happens when limits are hit (stop recording, log warning, inform client).

- **Rate limiting & overload protection**
  - [ ] Define safe default polling interval (e.g. 1000 ms).
  - [ ] List metrics to monitor (e.g. frames per second, queue length).
  - [ ] Plan actions when thresholds are exceeded (reduce rate, stop recording, write warning logs).

- **Replay**
  - [ ] Describe how replay reads `decoded.jsonl` (or similar) and turns it into a replay stream.
  - [ ] Decide whether replay should respect original timing or use a fixed speed in v1.
  - [ ] Note how the backend tells the client about replay status (starting, running, finished).

- **API contracts**
  - [ ] Align the backend’s JSON structures and endpoints with `Tasks/routes.md`.
  - [ ] Ensure `/api/status` returns enough info for CLI health checks (e.g. mode, adapter status).

---

#### Navigation

- [Home](../README.md)
- [Backend spec](../Spec/Backend/server.md)
- [Tasks overview](overview.md)
- [Client tasks](client.md)
- [Routes tasks](routes.md)
