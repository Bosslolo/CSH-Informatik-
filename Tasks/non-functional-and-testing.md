## Non-functional & Testing Tasks (All)

Cross-cutting tasks for **performance, logging, stability, and testing**.

### Summary

The system should:

- Keep latency from bus to UI under about **5000 ms**.
- Log important events and errors to files.
- Stay reasonably stable even when data is missing or load increases.
- Be tested using **manual checklists** and **replay of fake/recorded data**.

### Tasks

- **Performance**
  - [ ] Decide initial safe polling interval (e.g. 1000 ms) and document it.
  - [ ] Define what “too slow” means (e.g. more than 5000 ms delay between change and display).
  - [ ] Plan simple measurements (how to measure latency and throughput during tests).

- **Logging**
  - [ ] Specify the logs directory structure (e.g. `logs/app.log`, `logs/error.log`).
  - [ ] Choose a log format (timestamp, level, message).
  - [ ] Decide log rotation or cleanup behavior when logs grow too large.

- **Stability**
  - [ ] List critical paths that must not crash (core dashboard pages, recording start/stop).
  - [ ] Define fallback behaviors when backend or bus adapter is not available.
  - [ ] Plan automatic safeguards when disk space or data volume is near the limits.

- **Testing**
  - [ ] Create a **manual test checklist** for:
    - Starting the system via CLI.
    - Viewing live data and status.
    - Recording a short drive (using simulator).
    - Replaying that recording.
  - [ ] Plan how to generate and use **fake replay data** for testing without a car.
  - [ ] Decide how test results and issues are tracked (GitHub issues, markdown logs, etc.).

