### Client (Tim)

High-level plan for the dashboard webapp. This file describes **what** the client should do and which tasks belong to Tim. It does not contain implementation yet.

---

## 1. Goals

- Provide a **visual HTML dashboard** for car data.
- Work first with **simulated data**, then with real hardware via the backend.
- Make it obvious whether the app is connected and how often data is read.

---

## 2. Pages & Navigation

Navigation style: **sidebar** with sections, plus clear headings on each page.

Planned routes (see also `project-preparation.md`):

- `/` – **Dashboard (Live)**
  - Shows key live data: fuel level (L), RPM, motor temperature.
  - Shows connection status and current polling interval.
- `/recordings` – **Recordings list**
  - Lists previous drives with name, finish date/time, approximate size.
  - Actions: open a recording, maybe delete (later).
- `/recordings/:id` – **Replay**
  - Shows replay controls (play/pause, progress).
  - Visualizes recorded values over time.
- `/settings` – **Settings**
  - Shows current polling interval, interface type (simulator/hardware), logging toggle.

---

## 3. Components (reusable building blocks)

Tim should design these as reusable HTML/JS components:

- `LiveDataPanel`
  - Displays key values (RPM, temperature, fuel) in a simple, readable layout.
- `StatusBanner`
  - Shows connection status (connected / disconnected / simulation) and polling interval.
- `RecordingList`
  - Renders a list of recordings with basic metadata.
- `ReplayControls`
  - Simple controls for starting/stopping replay and seeing progress.

---

## 4. Data Display & Behavior

- **First phase**
  - Focus on **displaying data** from the backend (no complex controls yet).
  - If data is missing, show placeholders (“no data yet”) instead of breaking the page.

- **Later phase**
  - Add simple adjustments (e.g. pick which fields to show, basic filters).
  - Add better visualizations (charts) once the basic views are stable.

- **Offline / replay**
  - UI must allow switching to replay views when the car is not connected.
  - Replay uses the same or similar components as live data, but fed from recorded data.

---

## 5. Tasks for Tim

- [ ] Design the sidebar layout and basic page structure for `/`, `/recordings`, `/recordings/:id`, `/settings`.
- [ ] Create static HTML mockups for each page using sample data.
- [ ] Define the look & feel of `LiveDataPanel`, `StatusBanner`, `RecordingList`, and `ReplayControls`.
- [ ] Decide and document how connection status and polling interval are visually represented.
- [ ] Ensure that all pages degrade gracefully when backend data is missing or delayed.

---

Nav  
[Home](../../README.md)
