## Client Tasks (Tim)

High-level tasks for the **dashboard webapp**. This is about planning UI/UX and structure, not yet coding details.

### Summary

The client should:

- Provide a **sidebar-based dashboard** with pages for live data, recordings, replay, and settings.
- Show simulated data first, then real hardware data via the backend.
- Make connection status and read frequency clearly visible.
- Handle missing or delayed data gracefully.

### Tasks

- **Page structure**
  - [ ] Sketch and document layouts for:
    - `/` (Dashboard – live data + status).
    - `/recordings` (list of recordings).
    - `/recordings/:id` (replay view).
    - `/settings` (basic configuration).
  - [ ] Decide on typography, spacing, and colors for a clean, readable dashboard.

- **Components**
  - [ ] Specify props/inputs and behavior for:
    - `LiveDataPanel` (how to display RPM, temperature, fuel).
    - `StatusBanner` (states: connected, disconnected, simulation).
    - `RecordingList` (fields: name, date/time, size).
    - `ReplayControls` (play/pause, simple progress indicator).
  - [ ] Document how components should behave if data is `null` or temporarily unavailable.

- **Data states**
  - [ ] Describe the visual states for:
    - “Waiting for backend”.
    - “Backend unreachable”.
    - “No recordings yet”.
  - [ ] Plan simple placeholders/mock data for development before backend exists.

- **Interaction with CLI/backend**
  - [ ] Note how the UI should react when CLI health checks fail (e.g. show a big status banner).
  - [ ] Define where in the UI the user can see current polling interval and interface (simulator/hardware).

