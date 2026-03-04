# CLI Feature (Tim + Jana)

High-level plan for the CLI that launches the local webapp and backend.

---

## 1. Goals

- Provide a single command to start everything needed:
  - Backend server.
  - Dashboard webapp.
- Clean up any **old/stuck temporary data** on startup if needed.
- Make it obvious when the system is **ready** or when something is wrong.

---

## 2. Command Name & Aliases

- Main command: `csh-auto-data-machine`
- Short alias: `adm`

Example:

```bash
adm --interface simulator
```

---

## 3. Flags / Options (v1)

- `--port <number>`
  - Port for the dashboard/backend (default e.g. `3000`).

- `--poll-interval-ms <number>`
  - Polling interval in milliseconds (default safe value, e.g. `1000`).

- `--interface <simulator|hardware>`
  - Whether to use simulated data or the real hardware adapter.

- `--data-dir <path>`
  - Directory where recordings and logs are stored.

- `--log-level <error|info|debug>`
  - Controls verbosity of logs.

These flags give you “as much as possible” control without being overwhelming.

---

## 4. Startup Behavior

On startup the CLI should:

1. Optionally clean old temporary or stuck state (e.g. temp files).
2. Start the backend process (with the chosen flags).
3. Start or open the dashboard in the browser.
4. Run **two tests**:
   - CLI → Backend (`GET /api/status`).
   - Backend confirms bus adapter/simulator is OK.
5. Only then print a clear **READY** message with:
   - Dashboard URL.
   - Current interface (simulator/hardware).
   - Current polling interval and data directory.

---

## 5. Shutdown Behavior

- **Emergency:** `Ctrl+C` immediately stops CLI and attempts to stop child processes.
- **Normal shutdown:** provide an explicit option (e.g. `adm stop`) or a button in the dashboard that calls a shutdown endpoint.
- Before shutdown:
  - Flush any remaining buffers.
  - Write a final log entry indicating clean stop.

---

## 6. Tasks for CLI

### Tim (UX / messages)

- [ ] Design the text of startup and error messages so they are easy to understand.
- [ ] Decide how to present URLs and current configuration after startup.
- [ ] Plan the layout/content of any CLI help output (`adm --help`).

### Jana (Process & checks)

- [ ] Define how the CLI spawns backend and frontend processes.
- [ ] Specify the `/api/status` contract used for health checks.
- [ ] Describe how the CLI detects failures and exits with appropriate codes.
- [ ] Plan how cleanup of old/stuck data works on startup.

