import express from 'express';
import cors from 'cors';
import { CarSynthesis } from './synthesis';

const app = express();
const port = process.env.PORT || 3000;
const car = new CarSynthesis();

app.use(cors());
app.use(express.json());

/**
 * Common Interface: Live Data Endpoint
 * Returns realistic synthesized car data.
 */
app.get('/api/live', (req, res) => {
  const data = car.getLiveState();
  res.json({
    ...data,
    connected: true, // In simulation mode, always "connected"
    read_interval_ms: 1000,
  });
});

/**
 * Health Check Endpoint for CLI
 */
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    mode: 'simulation',
    engine_running: true,
    timezone: 'UTC', // Explicitly stating we use UTC
  });
});

app.listen(port, () => {
  console.log(`\n🚗 Car Synthesis Tool is Running`);
  console.log(`- API URL: http://localhost:${port}/api/live`);
  console.log(`- Status: http://localhost:${port}/api/status`);
  console.log(`- Timezone: UTC (ISO 8601)\n`);
});