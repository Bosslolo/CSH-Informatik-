# 🤖 AI SYSTEM CONTRACT (CSH-Auto-Data)

This document provides the context and instructions for AI models (e.g., Gemini in IDX) to maintain and extend this system.

## 🔒 Security Protocol
All communication between Frontend, CLI, and Backend **MUST** include the secure interface header:
- **Header:** `x-api-key`
- **Value:** `csh-secure-v1`

## 📡 Backend Interface (Common JSON)
- **Base URL:** `http://localhost:3000`
- **Live Data (`GET /api/live`):**
    - Returns realistic synthesized car state.
    - Fields: `rpm`, `speed_kmh`, `fuel_liters`, `motor_temp`, `gear`, `timestamp`.
- **Status (\`GET /api/status\`):**
    - Returns \`status: online\`.

## 🛠️ AI Development Rules

1. When adding new sensors, add them first to `synthesis.ts` logic.
2. Update this contract after any API change.
3. Ensure all new endpoints are protected by the Security Middleware.
