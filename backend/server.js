const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Middleware for JSON (needed for potential POST later)
app.use(express.json());

// Enable CORS for frontend development
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-api-key");
  next();
});

// API key middleware for /api/* routes
app.use('/api', (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== 'csh-secure-v1') {
    return res.status(401).json({ error: 'Unauthorized: missing or invalid x-api-key header' });
  }
  next();
});

// Simulation state with realistic incremental changes
let simState = {
  rpm: 900,
  temperature: 78,
  fuel_liters: 45.0,
  speed_kmh: 0,
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

// Update simulation values with smooth incremental changes
setInterval(() => {
  simState.rpm = clamp(
    Math.round(simState.rpm + randomInRange(-150, 150)),
    700, 4500
  );
  simState.temperature = clamp(
    Math.round(simState.temperature + randomInRange(-1, 1)),
    65, 110
  );
  simState.fuel_liters = clamp(
    Number((simState.fuel_liters + randomInRange(-0.1, 0.05)).toFixed(1)),
    1, 55
  );
  simState.speed_kmh = clamp(
    Math.round(simState.speed_kmh + randomInRange(-5, 5)),
    0, 180
  );
}, 1000);

// API Endpoints
app.get('/api/live', (req, res) => {
  res.json({
    rpm: simState.rpm,
    temperature: simState.temperature,
    fuel_liters: simState.fuel_liters,
    speed_kmh: simState.speed_kmh,
    connected: false,
    read_interval_ms: 1000,
    mode: "simulator",
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/status', (req, res) => {
  res.json({ backend: "OK", bus: "SIMULATED" });
});

app.get('/api/recordings', (req, res) => {
  res.json({ recordings: [] });
});

// Serve client files (after API routes so API paths take priority)
app.use(express.static(path.join(__dirname, '..', 'client')));

app.listen(port, () => {
  console.log(`Backend listening at http://localhost:${port}`);
  console.log(`Dashboard: http://localhost:${port}`);
  console.log(`Live data: http://localhost:${port}/api/live`);
});
