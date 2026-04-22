const pageTitleEl = document.querySelector("#page-title");
const pageSubtitleEl = document.querySelector("#page-subtitle");
const statusBannerEl = document.querySelector("#status-banner");
const viewEl = document.querySelector("#view");

const PAGE_META = {
  "/": {
    title: "Dashboard",
    subtitle: "Live-Werte, Verbindungsstatus und Polling-Intervall",
  },
  "/recordings": {
    title: "Aufnahmen",
    subtitle: "Gespeicherte Sessions mit Metadaten",
  },
  "/recordings/:id": {
    title: "Replay",
    subtitle: "Aufnahme ansehen und Wiederholung steuern",
  },
  "/settings": {
    title: "Settings",
    subtitle: "Polling, Interface und Logging verwalten",
  },
};

const state = {
  route: { path: "/", params: {} },
  api: {
    backendReachable: null,
    liveFailures: 0,
    recordingsFailures: 0,
  },
  liveData: null,
  recordings: [],
  lastLiveUpdate: null,
  settings: {
    pollIntervalMs: 1000,
    interface: "simulator",
    logging: true,
  },
  replay: {
    selectedRecordingId: null,
    playing: false,
    progressPercent: 0,
    timerId: null,
    seriesCache: {},
  },
  timers: {
    livePollingId: null,
    recordingsPollingId: null,
    activeLiveIntervalMs: null,
  },
};

window.addEventListener("hashchange", onRouteChange);
viewEl.addEventListener("click", onViewClick);
viewEl.addEventListener("submit", onViewSubmit);

init();

function init() {
  if (!window.location.hash) {
    window.location.hash = "#/";
  }
  onRouteChange();
  refreshLiveData();
  refreshRecordings();
  ensureLivePolling(state.settings.pollIntervalMs);
  startRecordingsPolling();
}

function onRouteChange() {
  state.route = parseRoute(window.location.hash);
  if (state.route.path !== "/recordings/:id") {
    stopReplayTimer();
  } else {
    state.replay.selectedRecordingId = state.route.params.id;
  }
  render();
}

function parseRoute(hashValue) {
  const hashWithoutMarker = (hashValue || "#/").replace(/^#/, "") || "/";
  const [path] = hashWithoutMarker.split("?");
  if (path === "/" || path === "") return { path: "/", params: {} };
  if (path === "/recordings") return { path: "/recordings", params: {} };
  if (path.startsWith("/recordings/")) {
    const id = decodeURIComponent(path.split("/")[2] || "");
    return { path: "/recordings/:id", params: { id } };
  }
  if (path === "/settings") return { path: "/settings", params: {} };
  return { path: "/", params: {} };
}

function render() {
  const meta = PAGE_META[state.route.path] || PAGE_META["/"];
  pageTitleEl.textContent = meta.title;
  pageSubtitleEl.textContent = meta.subtitle;
  highlightActiveNav();
  renderStatusBanner();
  renderRouteContent();
}

function highlightActiveNav() {
  const navLinks = document.querySelectorAll("[data-nav]");
  navLinks.forEach((link) => {
    const linkRoute = link.getAttribute("data-nav");
    const isActive =
      linkRoute === state.route.path ||
      (linkRoute === "/recordings/:id" && state.route.path === "/recordings/:id");
    link.classList.toggle("active", isActive);
  });
}

function renderStatusBanner() {
  const banner = resolveBannerData();
  statusBannerEl.className = `status-banner ${banner.kind}`;
  statusBannerEl.textContent = banner.message;
}

function resolveBannerData() {
  if (!state.liveData && state.api.backendReachable === null) {
    return { kind: "waiting", message: "Warte auf erste Daten vom Backend …" };
  }
  if (state.api.backendReachable === false) {
    return {
      kind: "warning",
      message:
        "Backend nicht erreichbar – der Client zeigt simulierte Daten an.",
    };
  }
  if (!state.liveData) {
    return {
      kind: "error",
      message: "Keine Live-Daten verfügbar.",
    };
  }
  if (state.liveData.connected) {
    return {
      kind: "ok",
      message: `Verbunden (${state.liveData.mode || "hardware"}) · Polling ${formatMs(
        state.liveData.read_interval_ms
      )}`,
    };
  }
  return {
    kind: "warning",
    message: `Keine Fahrzeugverbindung · Modus ${state.liveData.mode || "simulator"} · Polling ${formatMs(
      state.liveData.read_interval_ms
    )}`,
  };
}

function renderRouteContent() {
  if (state.route.path === "/") {
    viewEl.innerHTML = renderDashboardView();
    return;
  }
  if (state.route.path === "/recordings") {
    viewEl.innerHTML = renderRecordingsView();
    return;
  }
  if (state.route.path === "/recordings/:id") {
    viewEl.innerHTML = renderReplayView(state.route.params.id);
    return;
  }
  if (state.route.path === "/settings") {
    viewEl.innerHTML = renderSettingsView();
    return;
  }
  viewEl.innerHTML = "";
}

function renderDashboardView() {
  const live = state.liveData || {};
  const connectionLabel = state.api.backendReachable
    ? live.connected
      ? "Connected"
      : "Disconnected"
    : "Simulation";

  return `
    <section class="grid-3">
      <article class="card">
        <p class="kpi-label">Motor RPM</p>
        <p class="kpi-value">${formatNumber(live.rpm)}</p>
        <p class="subtle">U/min</p>
      </article>
      <article class="card">
        <p class="kpi-label">Motor Temperatur</p>
        <p class="kpi-value">${formatNumber(live.temperature)}</p>
        <p class="subtle">°C</p>
      </article>
      <article class="card">
        <p class="kpi-label">Fuel Level</p>
        <p class="kpi-value">${formatDecimal(live.fuel_liters)}</p>
        <p class="subtle">Liter</p>
      </article>
    </section>
    <article class="card">
      <p class="kpi-label">Status</p>
      <p class="kpi-value">${escapeHtml(connectionLabel)}</p>
      <p class="subtle">
        Letztes Update: ${formatDateTime(state.lastLiveUpdate)} ·
        Polling: ${formatMs(live.read_interval_ms || state.settings.pollIntervalMs)}
      </p>
    </article>
  `;
}

function renderRecordingsView() {
  if (!state.recordings.length) {
    return `
      <article class="empty-state">
        Noch keine Aufnahmen gefunden.
      </article>
    `;
  }

  const rows = state.recordings
    .map(
      (recording) => `
      <tr>
        <td>${escapeHtml(recording.name)}</td>
        <td>${formatDateTime(recording.finished_at)}</td>
        <td>${formatBytes(recording.size_bytes)}</td>
        <td class="button-row">
          <button data-action="open-recording" data-recording-id="${escapeHtml(
            recording.id
          )}">Öffnen</button>
          <button data-action="export-recording" data-recording-id="${escapeHtml(
            recording.id
          )}">Export JSON</button>
        </td>
      </tr>
    `
    )
    .join("");

  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Beendet</th>
            <th>Größe</th>
            <th>Aktion</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function renderReplayView(recordingId) {
  const recording = state.recordings.find((item) => item.id === recordingId);
  if (!recording) {
    return `
      <article class="empty-state">
        Aufnahme nicht gefunden. Bitte zuerst in der Aufnahmen-Liste auswählen.
      </article>
      <div class="button-row">
        <button data-action="go-recordings">Zurück zur Liste</button>
      </div>
    `;
  }

  const points = getReplaySeries(recording.id);
  const index = Math.min(
    points.length - 1,
    Math.floor((state.replay.progressPercent / 100) * (points.length - 1))
  );
  const currentPoint = points[index] || {};

  return `
    <article class="card">
      <p class="kpi-label">Aufnahme</p>
      <p class="kpi-value">${escapeHtml(recording.name)}</p>
      <p class="subtle">
        ${formatDateTime(recording.finished_at)} · ${formatBytes(recording.size_bytes)}
      </p>
    </article>
    <article class="card">
      <p class="kpi-label">Replay Fortschritt</p>
      <div class="progress">
        <div style="width: ${state.replay.progressPercent}%"></div>
      </div>
      <p class="subtle">${state.replay.progressPercent.toFixed(0)}%</p>
      <div class="button-row">
        <button class="primary" data-action="toggle-replay">
          ${state.replay.playing ? "Pause" : "Play"}
        </button>
        <button data-action="reset-replay">Reset</button>
        <button data-action="go-recordings">Zur Liste</button>
      </div>
    </article>
    <section class="grid-3">
      <article class="card">
        <p class="kpi-label">Replay RPM</p>
        <p class="kpi-value">${formatNumber(currentPoint.rpm)}</p>
      </article>
      <article class="card">
        <p class="kpi-label">Replay Temperatur</p>
        <p class="kpi-value">${formatNumber(currentPoint.temperature)} °C</p>
      </article>
      <article class="card">
        <p class="kpi-label">Replay Fuel</p>
        <p class="kpi-value">${formatDecimal(currentPoint.fuel_liters)} L</p>
      </article>
    </section>
  `;
}

function renderSettingsView() {
  return `
    <article class="card">
      <form id="settings-form" class="form-grid">
        <label>
          Polling-Intervall (ms)
          <input name="pollIntervalMs" type="number" min="250" max="10000" step="50" value="${state.settings.pollIntervalMs}" />
        </label>
        <label>
          Interface
          <select name="interfaceMode">
            <option value="simulator" ${
              state.settings.interface === "simulator" ? "selected" : ""
            }>simulator</option>
            <option value="hardware" ${
              state.settings.interface === "hardware" ? "selected" : ""
            }>hardware</option>
          </select>
        </label>
        <label>
          Logging
          <select name="logging">
            <option value="true" ${state.settings.logging ? "selected" : ""}>enabled</option>
            <option value="false" ${!state.settings.logging ? "selected" : ""}>disabled</option>
          </select>
        </label>
        <div class="button-row">
          <button class="primary" type="submit">Settings anwenden</button>
          <button type="button" data-action="refresh-now">Daten jetzt aktualisieren</button>
        </div>
      </form>
      <p class="subtle">
        Der Client verwendet bevorzugt: <code>GET /api/live</code> und <code>GET /api/recordings</code>.
        Falls diese Endpunkte fehlen, wird automatisch auf Simulation umgestellt.
      </p>
    </article>
  `;
}

function onViewClick(event) {
  const target = event.target.closest("[data-action]");
  if (!target) return;
  const action = target.getAttribute("data-action");

  if (action === "open-recording") {
    const recordingId = target.getAttribute("data-recording-id");
    if (recordingId) {
      window.location.hash = `#/recordings/${encodeURIComponent(recordingId)}`;
    }
    return;
  }

  if (action === "export-recording") {
    const recordingId = target.getAttribute("data-recording-id");
    if (recordingId) {
      exportRecording(recordingId);
    }
    return;
  }

  if (action === "toggle-replay") {
    toggleReplay();
    render();
    return;
  }

  if (action === "reset-replay") {
    stopReplayTimer();
    state.replay.progressPercent = 0;
    render();
    return;
  }

  if (action === "go-recordings") {
    window.location.hash = "#/recordings";
    return;
  }

  if (action === "refresh-now") {
    refreshLiveData();
    refreshRecordings();
  }
}

function onViewSubmit(event) {
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) return;
  if (form.id !== "settings-form") return;

  event.preventDefault();
  const formData = new FormData(form);

  const nextInterval = normalizeInterval(
    Number(formData.get("pollIntervalMs")) || state.settings.pollIntervalMs
  );
  const nextInterface = String(formData.get("interfaceMode") || "simulator");
  const nextLogging = String(formData.get("logging") || "true") === "true";

  state.settings.pollIntervalMs = nextInterval;
  state.settings.interface = nextInterface;
  state.settings.logging = nextLogging;
  ensureLivePolling(nextInterval);
  refreshLiveData();
  render();
}

async function refreshLiveData() {
  try {
    const payload = await fetchJson("/api/live", 1200);
    const live = normalizeLiveData(payload);
    state.liveData = live;
    state.api.backendReachable = true;
    state.api.liveFailures = 0;
    state.settings.pollIntervalMs = normalizeInterval(
      live.read_interval_ms || state.settings.pollIntervalMs
    );
    state.settings.interface = live.mode || state.settings.interface;
    ensureLivePolling(state.settings.pollIntervalMs);
  } catch (_error) {
    state.api.liveFailures += 1;
    state.api.backendReachable = false;
    state.liveData = generateSimulatedLiveData(state.liveData);
  } finally {
    state.lastLiveUpdate = Date.now();
    render();
  }
}

async function refreshRecordings() {
  try {
    const payload = await fetchJson("/api/recordings", 1200);
    const recordings = normalizeRecordings(payload);
    if (recordings.length) {
      state.recordings = recordings;
    } else if (!state.recordings.length) {
      state.recordings = getFallbackRecordings();
    }
    state.api.recordingsFailures = 0;
  } catch (_error) {
    state.api.recordingsFailures += 1;
    if (!state.recordings.length) {
      state.recordings = getFallbackRecordings();
    }
  } finally {
    render();
  }
}

function startRecordingsPolling() {
  if (state.timers.recordingsPollingId) {
    clearInterval(state.timers.recordingsPollingId);
  }
  state.timers.recordingsPollingId = setInterval(refreshRecordings, 15000);
}

function ensureLivePolling(intervalMs) {
  const normalized = normalizeInterval(intervalMs);
  if (
    state.timers.livePollingId &&
    state.timers.activeLiveIntervalMs === normalized
  ) {
    return;
  }
  if (state.timers.livePollingId) {
    clearInterval(state.timers.livePollingId);
  }
  state.timers.activeLiveIntervalMs = normalized;
  state.timers.livePollingId = setInterval(refreshLiveData, normalized);
}

function toggleReplay() {
  if (state.replay.playing) {
    stopReplayTimer();
    return;
  }
  if (!state.replay.selectedRecordingId) {
    return;
  }
  state.replay.playing = true;
  state.replay.timerId = setInterval(() => {
    const next = state.replay.progressPercent + 1;
    if (next >= 100) {
      state.replay.progressPercent = 100;
      stopReplayTimer();
      render();
      return;
    }
    state.replay.progressPercent = next;
    render();
  }, 150);
}

function stopReplayTimer() {
  if (state.replay.timerId) {
    clearInterval(state.replay.timerId);
    state.replay.timerId = null;
  }
  state.replay.playing = false;
}

function getReplaySeries(recordingId) {
  if (state.replay.seriesCache[recordingId]) {
    return state.replay.seriesCache[recordingId];
  }
  const series = Array.from({ length: 120 }, (_, index) => {
    const rpm = Math.round(900 + Math.sin(index / 7) * 500 + randomInRange(-80, 80));
    const temperature = Math.round(75 + Math.sin(index / 18) * 10 + randomInRange(-2, 2));
    const fuel = Number((44 - index * 0.04 + randomInRange(-0.15, 0.15)).toFixed(1));
    return {
      rpm: clamp(rpm, 700, 3500),
      temperature: clamp(temperature, 60, 120),
      fuel_liters: clamp(fuel, 2, 55),
    };
  });
  state.replay.seriesCache[recordingId] = series;
  return series;
}

function exportRecording(recordingId) {
  const recording = state.recordings.find((item) => item.id === recordingId);
  if (!recording) {
    return;
  }

  const payload = {
    exported_at: new Date().toISOString(),
    recording,
    samples: getReplaySeries(recording.id),
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${recording.id}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function fetchJson(url, timeoutMs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

function normalizeLiveData(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid /api/live payload");
  }

  const rpm = toNumber(payload.rpm);
  const temperature = toNumber(payload.temperature ?? payload.motor_temp);
  const fuelLiters = toNumber(
    payload.fuel_liters ?? payload.fuel_l ?? payload.fuelLevelLiters
  );
  const connected =
    typeof payload.connected === "boolean"
      ? payload.connected
      : String(payload.status || "").toLowerCase() === "connected";
  const intervalMs = normalizeInterval(
    toNumber(payload.read_interval_ms ?? payload.poll_interval_ms) ||
      state.settings.pollIntervalMs
  );
  const mode = String(
    payload.mode ?? payload.interface ?? (connected ? "hardware" : "simulator")
  );

  return {
    rpm: rpm ?? 0,
    temperature: temperature ?? 0,
    fuel_liters: fuelLiters ?? 0,
    connected,
    read_interval_ms: intervalMs,
    mode,
  };
}

function normalizeRecordings(payload) {
  const list = Array.isArray(payload) ? payload : payload?.recordings;
  if (!Array.isArray(list)) return [];

  return list
    .map((item, index) => {
      const id = String(item.id ?? `recording-${index + 1}`);
      const name = String(item.name ?? `Recording ${index + 1}`);
      const finishedAt = item.finished_at ?? item.finishedAt ?? new Date().toISOString();
      const sizeBytes = Number(item.size_bytes ?? item.sizeBytes ?? 0);
      return {
        id,
        name,
        finished_at: finishedAt,
        size_bytes: Number.isFinite(sizeBytes) ? sizeBytes : 0,
      };
    })
    .filter((item) => item.id);
}

function getFallbackRecordings() {
  return [
    {
      id: "demo-001",
      name: "Stadtfahrt Morgen",
      finished_at: "2026-03-10T07:42:00Z",
      size_bytes: 1_824_112,
    },
    {
      id: "demo-002",
      name: "Landstraße Abend",
      finished_at: "2026-03-09T18:13:00Z",
      size_bytes: 2_906_345,
    },
    {
      id: "demo-003",
      name: "Werkstatt Testlauf",
      finished_at: "2026-03-08T11:05:00Z",
      size_bytes: 965_440,
    },
  ];
}

function generateSimulatedLiveData(previousLiveData) {
  const prev = previousLiveData || {
    rpm: 900,
    temperature: 78,
    fuel_liters: 43,
  };
  return {
    rpm: clamp(Math.round(prev.rpm + randomInRange(-120, 120)), 700, 3200),
    temperature: clamp(
      Math.round(prev.temperature + randomInRange(-1.5, 1.5)),
      65,
      108
    ),
    fuel_liters: clamp(
      Number((prev.fuel_liters + randomInRange(-0.15, 0.1)).toFixed(1)),
      1,
      55
    ),
    connected: false,
    read_interval_ms: state.settings.pollIntervalMs,
    mode: "simulator",
  };
}

function toNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function normalizeInterval(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 1000;
  return clamp(Math.round(number), 250, 10000);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

function formatNumber(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("de-DE", {
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function formatDecimal(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(Number(value));
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("de-DE", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatMs(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return "—";
  return `${Math.round(num)} ms`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
}
