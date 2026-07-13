import express from 'express';
import cors from 'cors';
import path from 'path';
import { listAdapterProfiles } from './adapters/registry';
import { DEMO_CATALOG_DATA_SOURCE } from './dataSource';
import { SessionManager } from './sessionManager';
import { CarSynthesis } from './synthesis';

const app = express();
const port = process.env.PORT || 4000;
const synthesis = new CarSynthesis();
const session = new SessionManager(synthesis);

const API_KEY = process.env.CSH_API_KEY ?? '';

app.use(express.static(path.join(__dirname, '../../client')));
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  const key = req.headers['x-api-key'];
  if (!API_KEY || key !== API_KEY) {
    return res.status(403).json({ error: 'Forbidden: Invalid API Key' });
  }
  next();
});

const DEMO_RECORDINGS = [
  {
    id: 'demo-001',
    name: 'Morning City Drive',
    finished_at: '2026-03-10T07:42:00Z',
    size_bytes: 1_824_112,
    source_kind: 'demo',
  },
  {
    id: 'demo-002',
    name: 'Evening Country Road',
    finished_at: '2026-03-09T18:13:00Z',
    size_bytes: 2_906_345,
    source_kind: 'demo',
  },
  {
    id: 'demo-003',
    name: 'Workshop Test Run',
    finished_at: '2026-03-08T11:05:00Z',
    size_bytes: 965_440,
    source_kind: 'demo',
  },
];

app.get('/api/live', async (_req, res) => {
  try {
    const payload = await session.readLive();
    res.json(payload);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: msg });
  }
});

app.get('/api/status', (_req, res) => {
  res.json({
    backend: 'OK',
    bus: session.getStatus().connected ? 'CONNECTED' : 'SIMULATED',
    ...session.getStatus(),
  });
});

app.get('/api/recordings', (_req, res) => {
  res.json({
    data_source: DEMO_CATALOG_DATA_SOURCE,
    recordings: DEMO_RECORDINGS,
  });
});

app.get('/api/adapters', (_req, res) => {
  res.json({ adapters: listAdapterProfiles() });
});

app.get('/api/session', (_req, res) => {
  res.json(session.getConfig());
});

app.post('/api/simulation/controls', (req, res) => {
  const body = req.body || {};
  synthesis.setControls(Boolean(body.gas), Boolean(body.brake));
  res.json({ ok: true, gas: Boolean(body.gas), brake: Boolean(body.brake) });
});

app.post('/api/session', async (req, res) => {
  try {
    const body = req.body || {};
    const profile =
      body.profile === 'hardware' || body.interface === 'hardware'
        ? 'hardware_elm327'
        : body.profile === 'simulator' || body.interface === 'simulator'
          ? 'simulation'
          : body.profile;

    const updated = await session.updateConfig({
      ...(profile ? { profile } : {}),
      ...(body.serial_path !== undefined
        ? { serial_path: String(body.serial_path) }
        : {}),
      ...(body.replay_file !== undefined
        ? { replay_file: String(body.replay_file) }
        : {}),
      ...(body.read_interval_ms !== undefined
        ? { read_interval_ms: Number(body.read_interval_ms) }
        : {}),
    });
    res.json(updated);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(400).json({ error: msg });
  }
});

app.listen(port, () => {
  console.log(`\n🚗 CSH Auto Data backend is running`);
  console.log(`- Dashboard: http://localhost:${port}`);
  console.log(`- Live API:  http://localhost:${port}/api/live`);
  console.log(`- Profile:   ${session.getConfig().profile}\n`);
});
