#!/usr/bin/env node
const { spawn, execSync } = require("child_process");
const fs = require("fs");
const http = require("http");
const path = require("path");

const ROOT = __dirname;
const BACKEND_DIR = path.join(ROOT, "backend");
const PORT = Number(process.env.PORT || 4000);
const API_KEY = process.env.CSH_API_KEY || "csh-secure-v1";
const DASHBOARD_URL = `http://localhost:${PORT}`;

const ELM327_PATTERNS = [
  /^tty\.usbserial/i,
  /^tty\.usbmodem/i,
  /^cu\.usbserial/i,
  /^cu\.usbmodem/i,
  /^ttyUSB/i,
  /^ttyACM/i,
];

function detectElm327Port() {
  if (process.env.SERIAL_PATH) {
    return String(process.env.SERIAL_PATH);
  }

  const devRoots =
    process.platform === "win32"
      ? []
      : ["/dev"];

  for (const devRoot of devRoots) {
    try {
      const entries = fs.readdirSync(devRoot);
      for (const name of entries) {
        if (ELM327_PATTERNS.some((pattern) => pattern.test(name))) {
          return path.join(devRoot, name);
        }
      }
    } catch {
      // ignore unreadable /dev
    }
  }

  return "";
}

function ensureBackendDeps() {
  const modulesDir = path.join(BACKEND_DIR, "node_modules");
  if (fs.existsSync(modulesDir)) return;

  console.log("First run: installing backend dependencies...");
  execSync("npm install", { cwd: BACKEND_DIR, stdio: "inherit" });
  console.log("");
}

function requestJson(urlPath, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      `${DASHBOARD_URL}${urlPath}`,
      {
        method: options.method || "GET",
        headers: {
          "x-api-key": API_KEY,
          Accept: "application/json",
          ...(options.headers || {}),
        },
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => {
          let parsed = null;
          try {
            parsed = body ? JSON.parse(body) : null;
          } catch {
            parsed = null;
          }
          resolve({ statusCode: res.statusCode, body: parsed });
        });
      }
    );

    req.on("error", reject);
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function waitForBackend(maxAttempts = 60) {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      const res = await requestJson("/api/status");
      if (res.statusCode === 200) {
        return res.body;
      }
    } catch {
      // backend still starting
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("Backend did not become ready in time.");
}

async function resolveRunMode(hardwareRequested) {
  let status = await waitForBackend();

  const isReal =
    status?.profile === "hardware_elm327" &&
    status.connected &&
    status.mode === "hardware";

  if (hardwareRequested && !isReal) {
    console.log("Hardware cable not reachable — switching to testing mode...");
    await requestJson("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        interface: "simulator",
        read_interval_ms: 1000,
      }),
    });
    status = (await requestJson("/api/status")).body;
  }

  const finalIsReal =
    status?.profile === "hardware_elm327" &&
    status.connected &&
    status.mode === "hardware";

  return {
    modeLabel: finalIsReal ? "REAL MODE (hardware)" : "TESTING MODE (simulation)",
    status,
  };
}

function openDashboard() {
  const openCmd =
    process.platform === "darwin"
      ? "open"
      : process.platform === "win32"
        ? "start"
        : "xdg-open";
  spawn(openCmd, [DASHBOARD_URL], { shell: true, stdio: "ignore" });
}

function startBackend(serialPath) {
  const env = {
    ...process.env,
    CSH_API_KEY: API_KEY,
    PORT: String(PORT),
    BUS_PROFILE: serialPath ? "hardware_elm327" : "simulation",
  };

  if (serialPath) {
    env.SERIAL_PATH = serialPath;
  }

  return spawn("npm", ["run", "dev"], {
    cwd: BACKEND_DIR,
    shell: true,
    stdio: "inherit",
    env,
  });
}

async function main() {
  console.log("\nCSH Auto Data — launcher");
  console.log("========================\n");

  ensureBackendDeps();

  const serialPath = detectElm327Port();
  if (serialPath) {
    console.log(`Detected serial device: ${serialPath}`);
    console.log("Attempting REAL MODE with ELM327 hardware...\n");
  } else {
    console.log("No OBD cable detected.");
    console.log("Starting TESTING MODE with built-in simulator...\n");
  }

  const backend = startBackend(serialPath);

  backend.on("exit", (code) => {
    if (code && code !== 0) {
      process.exit(code);
    }
  });

  try {
    const { modeLabel, status } = await resolveRunMode(Boolean(serialPath));
    console.log(`\nBackend ready — ${modeLabel}`);
    if (status?.serial_path) {
      console.log(`Serial path: ${status.serial_path}`);
    }
    if (status?.last_error) {
      console.log(`Note: ${status.last_error}`);
    }
    console.log(`Dashboard: ${DASHBOARD_URL}\n`);
    openDashboard();
  } catch (err) {
    console.error(err instanceof Error ? err.message : String(err));
    backend.kill();
    process.exit(1);
  }

  process.on("SIGINT", () => {
    console.log("\n\nShutting down...");
    backend.kill();
    process.exit(0);
  });
}

main();
