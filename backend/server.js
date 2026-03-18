const express = require('express');
const app = express();
const port = 3000;

// Middleware for JSON (needed for potential POST later)
app.use(express.json());

// Enable CORS for frontend development
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Mock Data Contract
let mockData = {
  "status": "connected",
  "read_interval_ms": 1000,
  "data": {
    "rpm": 0,
    "temp_celsius": 90,
    "fuel_liters": 45.0,
    "speed_kmh": 0
  },
  "simulation_mode": true
};

// Update RPM randomly to simulate live data
setInterval(() => {
  if (mockData.data.rpm < 6000) {
    mockData.data.rpm += Math.floor(Math.random() * 100);
  } else {
    mockData.data.rpm = 800; // Reset after peak
  }
}, 1000);

// API Endpoints
app.get('/api/live', (req, res) => {
  res.json(mockData);
});

app.get('/api/status', (req, res) => {
  res.json({ backend: "OK", bus: "SIMULATED" });
});

app.listen(port, () => {
  console.log(`Backend listening at http://localhost:${port}`);
  console.log(`Live data: http://localhost:${port}/api/live`);
});
