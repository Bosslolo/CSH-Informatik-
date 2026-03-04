## Routes Tasks (Laurin)

High-level tasks for **frontend routing and backend API contracts**.

### Summary

Routes should:

- Provide simple, memorable URLs for dashboard, recordings, replay, and settings.
- Use **HTTP polling** to fetch live data for v1 (WebSockets can come later).
- Map each route to clear backend endpoints with well-defined JSON responses.

### Tasks

- **Define frontend routes**
  - [ ] Confirm the full list of routes: `/`, `/recordings`, `/recordings/:id`, `/settings`.
  - [ ] For each route, write a one-sentence description of what the user sees.
  - [ ] Decide how the sidebar navigation links map to these routes.

- **Specify backend endpoints**
  - [ ] For `GET /api/live`, define a concrete JSON shape, e.g.:
    - `{ rpm, temperature, fuel_liters, connected, read_interval_ms }`.
  - [ ] For `GET /api/recordings`, define fields for each recording item (id, name, finished_at, size_bytes).
  - [ ] For `GET /api/recordings/:id`, define what metadata and preview data are returned.
  - [ ] For `POST /api/recordings/:id/replay`, define the request body (if any) and the response JSON.

- **Error and status handling**
  - [ ] Choose a simple JSON error format (e.g. `{ "error": { "code", "message" } }`) and write examples.
  - [ ] Decide which HTTP status codes to use for:
    - Backend unavailable.
    - Recording not found.
    - Invalid request.

- **Polling strategy**
  - [ ] Decide on an initial polling interval for `/api/live` (e.g. 1000 ms).
  - [ ] Describe how the frontend should behave on repeated failures (e.g. back off to slower polling and show an error banner).
  - [ ] Note any differences between simulation mode and hardware mode in terms of routes or behavior (if any).

