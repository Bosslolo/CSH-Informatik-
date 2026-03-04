## CLI Tasks (<span style="color:#ff0000;">Tim</span> + <span style="color:#ff69b4;">Jana</span>)

High-level tasks for the **CLI command** that launches the local webapp and backend.

### Summary

The CLI should:

- Offer a single command (`csh-auto-data-machine` / `adm`) to start backend and dashboard.
- Clean up old/stuck data if needed.
- Run health checks before declaring the system **READY**.
- Support useful flags for port, polling interval, interface mode, data directory, and log level.

### Tasks

#### <span style="color:#ff0000;">Tim</span> (UX / messages)

- **Messages & UX**
  - [ ] Draft clear startup messages (what is starting, which URLs to open, which mode is used).
  - [ ] Define the exact text for the final READY message (include URL, mode, poll interval).
  - [ ] Plan error messages for common failures (backend not starting, status check failing).

- **Help & documentation**
  - [ ] Design the structure of the CLI help output (`adm --help`).
  - [ ] List and describe all flags:
    - `--port`
    - `--poll-interval-ms`
    - `--interface`
    - `--data-dir`
    - `--log-level`

#### <span style="color:#ff69b4;">Jana</span> (Process & checks)

- **Process management**
  - [ ] Decide how the CLI starts the backend (child process, script, etc.).
  - [ ] Plan how to start or open the dashboard (serve static files or open browser).
  - [ ] Define what state must be cleaned on startup (temp dirs, stale PID files, etc.).

- **Health checks**
  - [ ] Specify the `/api/status` response shape used for health checks.
  - [ ] Plan the two checks:
    - CLI → Backend (HTTP status and JSON).
    - Backend’s internal check for bus adapter/simulator.
  - [ ] Decide timeouts and retry behavior before giving up.

- **Shutdown**
  - [ ] Describe how `Ctrl+C` should propagate to child processes.
  - [ ] Define an optional “graceful stop” flow (CLI command or dashboard button) and what it triggers in the backend.
  - [ ] Decide what logs are written on shutdown and where.

---

#### Navigation

- [Home](../README.md)
- [CLI spec](../Features/cli.md)
- [Tasks overview](overview.md)
- [Backend tasks](backend.md)
