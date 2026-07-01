# Data — replay samples

**Owner: Jana**

## What this folder is

Local files for the `replay_file` bus profile. Not uploaded anywhere — stays on disk.

| File | Purpose |
|------|---------|
| [`bus-replay.jsonl`](bus-replay.jsonl) | Sample bus lines for testing replay without a car |

## Usage

```bash
REPLAY_FILE=./data/bus-replay.jsonl BUS_PROFILE=replay_file npm start
```

Or set the path in the dashboard **Settings** page after switching profile via API.

## Notes

- Recordings captured from real drives will eventually live here or a `recordings/` directory (gitignored when added)
- JSONL = one JSON object per line, easy to stream
