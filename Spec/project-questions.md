## How to use this file

- Answer **directly under each question** as plain text or short bullets.
- Keep questions as `- [ ]` items; when you agree/decide, you can check them off as `- [x]`.
- This file is the **single source of truth** for preparation answers; later we will copy the final decisions into `project-preparation.md`.

---

## 1. Product & Scope

- [ ] What is the **minimum v1** of the dashboard we want to ship?  
      _Answer:_ Visual html, Backend planned
- [ ] Which **product scenarios** from `README.md` are in scope for v1? Which are **explicitly out of scope**?  
      _Answer:_ not working yet, Visual working, not built only planned to detail
- [ ] Which **car/bus interface** are we targeting first (OBD, CAN, simulator, other)?  
      _Answer:_ simulate first, then cable to car
- [ ] On which **OS / environment** do we expect the app to run (Windows, macOS, Linux)? 
      _Answer:_ MacOS Windows

---

## 2. Client (Tim – HTML / Frontend)

- [ ] Which **pages/routes** do we implement in v1? (e.g. Dashboard, Recordings list, Replay, Settings)  
      _Answer:_ as much as possbile, pose it as a task clear, built by tim
- [ ] For each page, which **data fields** must be visible and in what form (value, table, chart, status icon)?  
      _Answer:_ first only visualize data, then adjustable 
- [ ] What is the **basic layout and navigation** (sidebar, top nav, tabs, single-page sections)?  
      _Answer:_ sidebar for navigation, sections to divide into similar categories
- [ ] Which **reusable components** do we want (e.g. `LiveDataPanel`, `RecordingList`, `ReplayControls`, `StatusBanner`)?  
      _Answer:_ live data panel, recorded data, status, replay
- [ ] How should the UI show **connection status** and **read frequency** clearly?  
      _Answer:_ design choice by tim
- [ ] Are there any **accessibility** or **offline** behavior requirements we care about from day one?  
      _Answer:_ replay old data, recorded data

---

## 3. Routes (Laurin – Routing / API surface)

- [ ] What **frontend routes (URLs)** do we need, and which **main component** loads on each?  
      _Answer:_ url (icicles.ch) (icicles.online)
- [ ] For each route, what **backend endpoints** are needed (HTTP or WebSocket)?  
      _Answer:_ http (whats a websocket) use icicles.online or .ch /gas for example
- [ ] How is **live data** fetched: polling endpoint, WebSocket, or something else?  
      _Answer:_ polling or better option
- [ ] How is **historical / recording data** fetched (list of sessions, single session, replay stream)?  
      _Answer:_ local data/ saved data on server
- [ ] What are the primary **request/response shapes** for key endpoints (e.g. `GET /api/live`, `GET /api/recordings/:id`)?  
      _Answer:_ not understood
- [ ] How are **errors** from the backend surfaced to the frontend (HTTP codes, JSON error payloads, messages)?  
      _Answer:_ json error, simple
 
---

## 4. Backend (Jana – Backend services)

- [ ] How will we **connect to the bus** for v1 (real hardware adapter, virtual device, prerecorded files)?  
      _Answer:_ real hardware adapter
- [ ] What are the main **backend modules** (e.g. bus adapter, queue manager, API layer, data store) and their responsibilities?  
      _Answer:_ bus adapter to car, all needed to display on http, api
- [ ] What **data store** do we use initially (JSON files, SQLite, other), and what are the key tables/files and fields?  
      _Answer:_ files stored json or whatever is most efficient
- [ ] What is the model for **recordings** (one file per drive, metadata, naming scheme, max size)?  
      _Answer:_ as many files as needed per drive, one folder per drive, named after the finish point date and exact time, max size 5gb per drive, overall max 50gb
- [ ] How do we implement **rate limiting** and **validation** to avoid overloading the bus and crashing the app?  
      _Answer:_ measure limits, adjust accordingly, create automatic save if overloading or almost
- [ ] How do we support **replay** of recorded bus data without a connected car?  
      _Answer:_ simulate the data, better options?

---

## 5. CLI

- [ ] What is the **main CLI command name** (e.g. `auto-data`, `csh-auto`) to start the system?  
      _Answer:_ csh-auto-data-machine, short adm
- [ ] Which **flags/options** do we support in v1 (port, polling interval, bus interface, log level, data directory)?  
      _Answer:_ as much as possbile, specify yourself ai
- [ ] What should the CLI **print on startup** (clear steps, URLs, success messages, errors)?  
      _Answer:_ clear old stuck data, clean visible if working
- [ ] How does the CLI ensure **backend and client** are both running and reachable before saying “ready”?  
      _Answer:_ two tests, one from cli to backend and other way round
- [ ] How does the user **stop** everything cleanly (Ctrl+C behavior, shutdown messages)?  
      _Answer:_ emergency is ctrl-c normal shutdown as option/button

---

## 6. Non-functional Requirements

- [ ] What **performance constraints** do we care about (max acceptable latency, minimum safe polling interval)?  
      _Answer:_ max latency should never be more than 5000, polling interval as low as possible
- [ ] What is our **logging strategy** (log levels, format, where logs are stored, rotation)?  
      _Answer:_ folder logs, errors stored as .txt
- [ ] What level of **stability** do we aim for in v1 (acceptable failure modes, what must never break)?  
      _Answer:_ visual and backend should kinda work
- [ ] What **testing approach** is realistic for the team (unit tests, manual test checklist, replay-based tests)?  
      _Answer:_ manual chhecklist tested with fake replay

---

## 7. Collaboration & Responsibilities

- [ ] For v1, which **feature areas** does each person own (Tim, Laurin, Jana)?  
      _Answer:_ tim cli, laurin routes, jana backend
- [ ] How will you handle **cross-cutting tasks** (e.g. error flows that touch frontend + backend + CLI)? 
      _Answer:_ laurin
- [ ] How often will you **sync as a team** and update the task list (daily standup, weekly planning, ad-hoc)?  
      _Answer:_ weekly
- [ ] Where will you **track tasks** and decisions (GitHub issues, markdown checklist, project board)?  
      _Answer:_ Github