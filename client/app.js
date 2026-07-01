// poll-cache:v1 part=poll digest=QgfCBjbGllbnQvYXBwLmpzIG9yIGNsaWVudC9pbmRleC5odG1sIHwKfCBMYXVyaW4gfCBSb3V0ZXMgLyBJbnRlZ3JhdGlvbiB8IFNwZWMvUm91dGVzL3JvdXRlcy5tZCB8CnwgSmFuYSB8IEJhY2tlbmQgLyBDTEkgfCBiYWNrZW5kL3NyYy9hZGFwdGVycy9yZWdpc3RyeS50cyBvciBjbGkvYWRtLmpzIHwKCiMjIEZpdmUtc3RlcCBza2lsbHMgd29ya2Zsb3cKCiMjIyBTdGVwIDEg4oCUIFN5bmMgbGF0ZXN0CmBgYGJhc2gKY2QgPHJlcG8tcm9vdD4KZ2l0IGNoZWNrb3V0IG1haW4KZ2l0IHB1bGwgb3JpZ2luIG1haW4KYGBgClZlcmlmeTogZ2l0IHN0YXR1cyBzaG93cyAiT24gYnJhbmNoIG1haW4iIGFuZCB1cCB0byBkYXRlIHdpdGggb3JpZ2luL21haW4uCgojIyMgU3RlcCAyIOKAlCBCcmFuY2ggYmVmb3JlIGVkaXRpbmcKYGBgYmFzaApnaXQgY2hlY2tvdXQgLWIgPG5hbWU+L3NraWxsLWNoZWNrCmBgYApVc2UgbG93ZXJjYXNlIG5hbWUgcHJlZml4IChlLmcuIGxhdXJpbi9za2lsbC1jaGVjaykuCgojIyMgU3RlcCAzIOKAlCBDaGFuZ2UsIHN0YWdlLCBjb21taXQKRWRpdCBvbmUgZmlsZSBpbiB0aGUgc3R1ZGVudCdzIGFyZWEuIFRoZW46CmBgYGJhc2gKZ2l0IHN0YXR1cwpnaXQgYWRkIDxmaWxlPgpnaXQgY29tbWl0IC1tICJTaG9ydCBkZXNjcmlwdGlvbiBvZiBjaGFuZ2UiCmBgYAoKIyMjIFN0ZXAgNCDigJQgUHVzaCBicmFuY2gKYGBgYmFzaApnaXQgcHVzaCAtdSBvcmlnaW4gPGJyYW5jaC1uYW1lPgpgYGAKVGhlIC11IGZsYWcgbGlua3MgbG9jYWwgYnJhbmNoIHRvIHJlbW90ZSBvbiBmaXJzdCBwdXNoLgoKIyMjIFN0ZXAgNSDigJQgTWVyZ2UgdmlhIEdpdEh1YiBQUgoxLiBPcGVuIGdpdGh1Yi5jb20vQm9zc2xvbG8vQ1NILUluZm9ybWF0aWstIG9uIEdpdEh1YgoyLiBDbGljayAiQ29tcGFyZSAmIHB1bGwgcmVxdWVzdCIgKG9yIFB1bGwgcmVxdWVzdHMg4oaSIE5ldykKMy4gQmFzZTogbWFpbiDihpAgQ29tcGFyZTogc3R1ZGVudCdzIGJyYW5jaAo0LiBDcmVhdGUgcHVsbCByZXF1ZXN0IOKGkiBN
const pageTitleEl = document.querySelector("#page-title");
const pageSubtitleEl = document.querySelector("#page-subtitle");
const statusBannerEl = document.querySelector("#status-banner");
const sourceBadgeEl = document.querySelector("#source-badge");
const viewEl = document.querySelector("#view");

const PAGE_META = {
  "/": {
    title: "Dashboard",
    subtitle: "Live values, connection status and polling interval",
  },
  "/recordings": {
    title: "Recordings",
    subtitle: "Stored sessions with metadata",
  },
  "/recordings/:id": {
    title: "Replay",
    subtitle: "View recording and control replay",
  },
  "/settings": {
    title: "Settings",
    subtitle: "Manage polling, interface and logging",
  },
};

const WAITING_DATA_SOURCE = {
  kind: "waiting",
  label: "Waiting for data",
  trust: "degraded",
  is_real_vehicle: false,
  detail: null,
};

const CLIENT_FALLBACK_SOURCE = {
  kind: "client_fallback",
  label: "Offline \u2014 browser simulation",
  trust: "degraded",
  is_real_vehicle: false,
  detail: "Backend unreachable; values are generated in the browser",
};

const DEMO_CATALOG_SOURCE = {
  kind: "demo_catalog",
  label: "Demo recordings",
  trust: "demo",
  is_real_vehicle: false,
  detail: null,
};

const SYNTHETIC_REPLAY_SOURCE = {
  kind: "synthetic_replay",
  label: "Synthetic demo replay",
  trust: "demo",
  is_real_vehicle: false,
  detail: "Values are generated in the browser, not from a stored bus log",
};

const TRUST_TAGS = {
  verified: "REAL",
  recorded: "RECORDED",
  synthetic: "SYNTHETIC",
  demo: "DEMO",
  degraded: "OFFLINE",
};

const BUS_KPI_FIELDS = [
  {
    busKey: "rpm",
    label: "Engine RPM",
    unit: "RPM",
    liveKey: "rpm",
    replayKey: "rpm",
    min: 700,
    max: 4500,
    format: "number",
  },
  {
    busKey: "motor_temp",
    label: "Engine Temperature",
    unit: "\u00b0C",
    liveKey: "temperature",
    replayKey: "temperature",
    min: 20,
    max: 120,
    format: "number",
  },
  {
    busKey: "fuel_liters",
    label: "Fuel Level",
    unit: "Liters",
    liveKey: "fuel_liters",
    replayKey: "fuel_liters",
    min: 0,
    max: 55,
    format: "decimal",
  },
  {
    busKey: "speed_kmh",
    label: "Speed",
    unit: "km/h",
    liveKey: "speed_kmh",
    replayKey: "speed_kmh",
    min: 0,
    max: 180,
    format: "number",
    extraSubtle: (live) => ` \u00b7 Gear ${formatNumber(live.gear)}`,
  },
  {
    busKey: "battery_voltage",
    label: "Battery",
    unit: "Volts",
    liveKey: "battery_voltage",
    replayKey: "battery_voltage",
    min: 11.5,
    max: 14.8,
    format: "decimal",
  },
  {
    busKey: "throttle_percent",
    label: "Throttle",
    unit: "%",
    liveKey: "throttle_percent",
    replayKey: "throttle_percent",
    min: 0,
    max: 100,
    format: "number",
    suffix: "%",
    extraSubtle: (live) => ` \u00b7 Intake ${formatNumber(live.intake_air_temp)} \u00b0C`,
    showGauge: true,
  },
];

const state = {
  route: { path: "/", params: {} },
  api: {
    backendReachable: null,
    liveFailures: 0,
    recordingsFailures: 0,
  },
  liveData: null,
  recordings: [],
  recordingsMeta: { data_source: null },
  statusDataSource: null,
  dataSourceOverride: null,
  lastLiveUpdate: null,
  settings: {
    pollIntervalMs: 1000,
    interface: "simulator",
    serialPath: "",
    logging: true,
  },
  liveHistory: {
    rpm: [],
    motor_temp: [],
    fuel_liters: [],
    speed_kmh: [],
    battery_voltage: [],
    throttle_percent: [],
    intake_air_temp: [],
    maxSamples: 48,
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

// --- Persistence helpers ---

function saveState(key, obj) {
  try {
    localStorage.setItem(key, JSON.stringify(obj));
  } catch (_) {
    // storage full or unavailable
  }
}

function loadState(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

// --- Event listeners ---

window.addEventListener("hashchange", onRouteChange);
viewEl.addEventListener("click", onViewClick);
viewEl.addEventListener("submit", onViewSubmit);

init();

function init() {
  // Restore persisted settings
  const savedSettings = loadState("csh-settings");
  if (savedSettings) {
    state.settings.pollIntervalMs = normalizeInterval(savedSettings.pollIntervalMs || 1000);
    state.settings.interface = savedSettings.interface || "simulator";
    state.settings.serialPath = savedSettings.serialPath || "";
    state.settings.logging = savedSettings.logging !== false;
  }

  // Restore persisted route
  const savedRoute = loadState("csh-route");
  if (!window.location.hash && savedRoute) {
    window.location.hash = savedRoute;
  } else if (!window.location.hash) {
    window.location.hash = "#/";
  }

  onRouteChange();

  // Restore replay state if navigating to replay
  if (state.route.path === "/recordings/:id") {
    const savedReplay = loadState("csh-replay");
    if (savedReplay) {
      state.replay.selectedRecordingId = savedReplay.selectedRecordingId || state.route.params.id;
      state.replay.progressPercent = savedReplay.progressPercent || 0;
    }
  }

  syncSessionFromBackend();
  refreshStatusFromBackend();
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
  saveState("csh-route", window.location.hash);
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
  renderSourceBadge();
  renderStatusBanner();
  renderRouteContent();
}

function normalizeDataSource(raw, fallback) {
  if (!raw || typeof raw !== "object") {
    return fallback ? { ...fallback } : null;
  }
  const kind = String(raw.kind || fallback?.kind || "unknown");
  const label = String(raw.label || fallback?.label || kind);
  const trust = TRUST_TAGS[raw.trust] ? raw.trust : fallback?.trust || "synthetic";
  const isReal =
    typeof raw.is_real_vehicle === "boolean"
      ? raw.is_real_vehicle
      : Boolean(fallback?.is_real_vehicle);
  const detail =
    raw.detail === null || raw.detail === undefined
      ? fallback?.detail ?? null
      : String(raw.detail);
  return { kind, label, trust, is_real_vehicle: isReal, detail };
}

function resolveDataSource() {
  if (state.dataSourceOverride) {
    return { ...state.dataSourceOverride };
  }
  if (state.route.path === "/recordings/:id") {
    return { ...SYNTHETIC_REPLAY_SOURCE };
  }
  if (state.route.path === "/recordings") {
    return normalizeDataSource(
      state.recordingsMeta?.data_source,
      DEMO_CATALOG_SOURCE
    );
  }
  if (state.route.path === "/settings" && state.statusDataSource) {
    return { ...state.statusDataSource };
  }
  if (state.liveData?.data_source) {
    return { ...state.liveData.data_source };
  }
  if (state.api.backendReachable === false && state.route.path === "/") {
    return { ...CLIENT_FALLBACK_SOURCE };
  }
  return { ...WAITING_DATA_SOURCE };
}

function trustTagFor(source) {
  return TRUST_TAGS[source?.trust] || "UNKNOWN";
}

function renderSourceBadge() {
  if (!sourceBadgeEl) return;
  const source = resolveDataSource();
  const tag = trustTagFor(source);
  sourceBadgeEl.className = `source-badge source-badge--${source.trust}`;
  sourceBadgeEl.innerHTML = `
    <span class="source-badge-dot" aria-hidden="true"></span>
    <span class="source-badge-body">
      <span class="source-badge-label">${escapeHtml(source.label)}</span>
      <span class="source-badge-tag">${escapeHtml(tag)}</span>
    </span>
  `;
  sourceBadgeEl.title = source.detail
    ? `${source.label} \u2014 ${source.detail}`
    : source.label;
}

function renderSourcePanel(source, options = {}) {
  const { extraHtml = "" } = options;
  const detailLine = source.detail
    ? `<p class="subtle source-panel-detail">${escapeHtml(source.detail)}</p>`
    : "";
  return `
    <article class="source-panel source-panel--${source.trust}">
      <p class="source-panel-title">
        <span class="source-panel-tag">${escapeHtml(trustTagFor(source))}</span>
        Data source: ${escapeHtml(source.label)}
      </p>
      ${detailLine}
      ${extraHtml}
    </article>
  `;
}

function kpiGridClass(source) {
  if (source.is_real_vehicle) return "grid-3";
  if (source.kind === "replay_file") return "grid-3 kpi-grid--replay";
  return "grid-3 kpi-grid--synthetic";
}

function renderSyntheticChip() {
  return `<span class="source-chip">Not from vehicle</span>`;
}

function formatKpiValue(field, value) {
  const formatted =
    field.format === "decimal" ? formatDecimal(value) : formatNumber(value);
  return `${formatted}${field.suffix || ""}`;
}

function formatRawBusValue(field, value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return "\u2014";
  if (field.format === "decimal") return num.toFixed(1);
  return String(Math.round(num));
}

function resolveConnectionLabel(live) {
  if (state.api.backendReachable === false) return "Offline simulation";
  const profile = live.profile || live.mode || "";
  if (profile === "replay_file") return "Replay bus stream";
  if (live.connected && profile === "hardware_elm327") return "Connected";
  if (live.connected) return "Connected";
  return "Disconnected";
}

function renderBusStreamText(live) {
  const parts = BUS_KPI_FIELDS.map(
    (field) => `${field.busKey}=${formatRawBusValue(field, live[field.liveKey])}`
  );
  return `
    <article class="card bus-stream-card">
      <p class="kpi-label">Live bus stream</p>
      <code class="bus-stream-text">${escapeHtml(parts.join(" \u00b7 "))}</code>
    </article>
  `;
}

function renderKpiCard(field, options = {}) {
  const {
    value,
    samples = [],
    syntheticChip = "",
    extraHtml = "",
    subtleSuffix = "",
  } = options;
  const gaugeHtml =
    field.showGauge && Number.isFinite(Number(value))
      ? renderGaugeBar(value, field.min, field.max)
      : "";
  return `
    <article class="card kpi-card">
      ${syntheticChip}
      <div class="kpi-header">
        <div class="kpi-header-text">
          <p class="kpi-label">${escapeHtml(field.label)}</p>
          <code class="bus-field-key">${escapeHtml(field.busKey)}</code>
        </div>
        ${renderTinySparkline(samples, field.min, field.max)}
      </div>
      <p class="kpi-value">${formatKpiValue(field, value)}</p>
      <p class="bus-raw-text">${escapeHtml(field.busKey)}=${escapeHtml(formatRawBusValue(field, value))}</p>
      ${gaugeHtml}
      <p class="subtle">${escapeHtml(field.unit)}${subtleSuffix}</p>
      ${extraHtml}
    </article>
  `;
}

function renderLiveKpiCards(live, source) {
  const syntheticChip =
    source.is_real_vehicle || source.kind === "replay_file"
      ? ""
      : renderSyntheticChip();
  const gridClass = kpiGridClass(source);
  const cards = BUS_KPI_FIELDS.map((field) => {
    const value = live[field.liveKey];
    const samples = state.liveHistory[field.busKey] || [];
    const subtleSuffix =
      typeof field.extraSubtle === "function" ? field.extraSubtle(live) : "";
    return renderKpiCard(field, {
      value,
      samples,
      syntheticChip,
      subtleSuffix,
    });
  });
  const rows = [];
  for (let i = 0; i < cards.length; i += 3) {
    rows.push(`<section class="${gridClass}">${cards.slice(i, i + 3).join("")}</section>`);
  }
  return rows.join("");
}

function renderReplayKpiCards(points, index) {
  const slice = points.slice(0, Math.max(1, index + 1));
  const current = points[index] || {};
  const cards = BUS_KPI_FIELDS.map((field) => {
    const samples = slice.map((p) => p[field.replayKey]);
    const value = current[field.replayKey];
    const subtleSuffix =
      field.busKey === "speed_kmh"
        ? ` \u00b7 Gear ${formatNumber(current.gear)}`
        : field.busKey === "throttle_percent"
          ? ` \u00b7 Intake ${formatNumber(current.intake_air_temp)} \u00b0C`
          : "";
    return renderKpiCard(field, {
      value,
      samples,
      subtleSuffix,
    });
  });
  const rows = [];
  for (let i = 0; i < cards.length; i += 3) {
    rows.push(`<section class="grid-3">${cards.slice(i, i + 3).join("")}</section>`);
  }
  return rows.join("");
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
  statusBannerEl.innerHTML = banner.html || escapeHtml(banner.message);
}

function resolveBannerData() {
  const source = resolveDataSource();
  const sourceLine = `Data source: ${source.label}${
    source.detail ? ` (${source.detail})` : ""
  }`;

  if (state.route.path === "/recordings/:id") {
    return {
      kind: "warning",
      html: `<strong>Synthetic demo replay</strong> \u2014 values are generated in the browser. ${escapeHtml(
        sourceLine
      )} <a href="#/">Go to live dashboard</a>`,
    };
  }

  if (state.route.path === "/recordings") {
    return {
      kind: source.trust === "demo" ? "warning" : "ok",
      html: `${escapeHtml(sourceLine)}${
        source.trust === "demo"
          ? " \u2014 these recordings were not captured from a vehicle."
          : ""
      }`,
    };
  }

  if (!state.liveData && state.api.backendReachable === null && state.route.path === "/") {
    return { kind: "waiting", message: "Waiting for first data from backend..." };
  }
  if (state.api.backendReachable === false && state.route.path === "/") {
    return {
      kind: "warning",
      html: `<strong>Backend not reachable</strong> \u2014 ${escapeHtml(sourceLine)}`,
    };
  }
  if (!state.liveData && state.route.path === "/") {
    return {
      kind: "error",
      message: "No live data available.",
    };
  }
  if (state.route.path !== "/") {
    return { kind: "ok", html: escapeHtml(sourceLine) };
  }

  const live = state.liveData;
  const profile = live.profile || live.mode || "simulator";
  if (live.last_error) {
    return {
      kind: "warning",
      html: `${escapeHtml(sourceLine)} \u00b7 ${escapeHtml(profile)}: ${escapeHtml(
        live.last_error
      )} \u00b7 Polling ${escapeHtml(formatMs(live.read_interval_ms))}`,
    };
  }
  if (live.connected) {
    return {
      kind: source.is_real_vehicle ? "ok" : "warning",
      html: `${escapeHtml(sourceLine)} \u00b7 Polling ${escapeHtml(
        formatMs(live.read_interval_ms)
      )}`,
    };
  }
  return {
    kind: "warning",
    html: `${escapeHtml(sourceLine)} \u00b7 Polling ${escapeHtml(
      formatMs(live.read_interval_ms)
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
  const source = resolveDataSource();
  const connectionLabel = resolveConnectionLabel(live);

  return `
    ${renderSourcePanel(source)}
    ${renderBusStreamText(live)}
    ${renderLiveKpiCards(live, source)}
    <article class="card">
      <p class="kpi-label">Status</p>
      <p class="kpi-value">${escapeHtml(connectionLabel)}</p>
      <p class="subtle">
        Source: ${escapeHtml(source.label)} (${escapeHtml(trustTagFor(source))}) \u00b7
        Profile: ${escapeHtml(live.profile || live.mode || "\u2014")} \u00b7
        Last update: ${formatDateTime(state.lastLiveUpdate)} \u00b7
        Polling: ${formatMs(live.read_interval_ms || state.settings.pollIntervalMs)}
      </p>
    </article>
  `;
}

function renderRecordingsView() {
  const source = resolveDataSource();
  const demoPanel =
    source.trust === "demo"
      ? renderSourcePanel(source, {
          extraHtml:
            '<p class="subtle">These are demo recordings, not captured from a vehicle.</p>',
        })
      : renderSourcePanel(source);

  if (!state.recordings.length) {
    return `
      ${demoPanel}
      <article class="empty-state">
        No recordings found yet.
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
        <td>${escapeHtml(recording.source_kind || "unknown")}</td>
        <td class="button-row">
          <button data-action="open-recording" data-recording-id="${escapeHtml(
            recording.id
          )}">Open</button>
          <button data-action="export-recording" data-recording-id="${escapeHtml(
            recording.id
          )}">Export JSON</button>
        </td>
      </tr>
    `
    )
    .join("");

  return `
    ${demoPanel}
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Finished</th>
            <th>Size</th>
            <th>Source</th>
            <th>Action</th>
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
        Recording not found. Please select one from the recordings list first.
      </article>
      <div class="button-row">
        <button data-action="go-recordings">Back to list</button>
      </div>
    `;
  }

  const points = getReplaySeries(recording.id);
  const index = Math.min(
    points.length - 1,
    Math.floor((state.replay.progressPercent / 100) * (points.length - 1))
  );
  const source = resolveDataSource();

  return `
    ${renderSourcePanel(source, {
      extraHtml:
        '<p class="subtle"><a href="#/">Go to live dashboard</a> for real backend data.</p>',
    })}
    <article class="card">
      <p class="kpi-label">Recording</p>
      <p class="kpi-value">${escapeHtml(recording.name)}</p>
      <p class="subtle">
        ${formatDateTime(recording.finished_at)} \u00b7 ${formatBytes(recording.size_bytes)}
      </p>
    </article>
    <article class="card">
      <p class="kpi-label">Replay Progress</p>
      <div class="progress">
        <div style="width: ${state.replay.progressPercent}%"></div>
      </div>
      <p class="subtle">${state.replay.progressPercent.toFixed(0)}%</p>
      <div class="button-row">
        <button class="primary" data-action="toggle-replay">
          ${state.replay.playing ? "Pause" : "Play"}
        </button>
        <button data-action="reset-replay">Reset</button>
        <button data-action="go-recordings">Back to list</button>
      </div>
    </article>
    ${renderReplayKpiCards(points, index)}
  `;
}

function renderSettingsView() {
  const source = resolveDataSource();
  const sourceSummary = state.statusDataSource || source;
  return `
    <article class="card">
      <p class="kpi-label">Current data source</p>
      <p class="kpi-value">${escapeHtml(sourceSummary.label)}</p>
      <p class="subtle">
        Trust: ${escapeHtml(trustTagFor(sourceSummary))} \u00b7
        Real vehicle: ${sourceSummary.is_real_vehicle ? "yes" : "no"}
        ${sourceSummary.detail ? ` \u00b7 ${escapeHtml(sourceSummary.detail)}` : ""}
      </p>
    </article>
    <article class="card">
      <form id="settings-form" class="form-grid">
        <label>
          Polling Interval (ms)
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
            }>hardware (ELM327)</option>
          </select>
        </label>
        <label>
          Serial path (ELM327)
          <input name="serialPath" type="text" placeholder="/dev/tty.usbserial-..." value="${escapeHtml(
            state.settings.serialPath
          )}" />
        </label>
        <label>
          Logging
          <select name="logging">
            <option value="true" ${state.settings.logging ? "selected" : ""}>enabled</option>
            <option value="false" ${!state.settings.logging ? "selected" : ""}>disabled</option>
          </select>
        </label>
        <div class="button-row">
          <button class="primary" type="submit">Apply Settings</button>
          <button type="button" data-action="refresh-now">Refresh Data Now</button>
        </div>
      </form>
      <p class="subtle">
        Apply sends <code>POST /api/session</code> (profile + serial path).
        Live data: <code>GET /api/live</code>. If the backend is down, the client falls back to local simulation.
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
    saveState("csh-replay", {
      selectedRecordingId: state.replay.selectedRecordingId,
      progressPercent: 0,
    });
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
  const nextSerialPath = String(formData.get("serialPath") || "");
  const nextLogging = String(formData.get("logging") || "true") === "true";

  state.settings.pollIntervalMs = nextInterval;
  state.settings.interface = nextInterface;
  state.settings.serialPath = nextSerialPath;
  state.settings.logging = nextLogging;

  saveState("csh-settings", {
    pollIntervalMs: nextInterval,
    interface: nextInterface,
    serialPath: nextSerialPath,
    logging: nextLogging,
  });

  ensureLivePolling(nextInterval);
  void applySessionToBackend({
    interface: nextInterface,
    serial_path: nextSerialPath,
    read_interval_ms: nextInterval,
  }).then(() => {
    refreshStatusFromBackend();
    refreshLiveData();
    render();
  });
}

async function refreshLiveData() {
  try {
    const payload = await fetchJson("/api/live", 1200);
    const live = normalizeLiveData(payload);
    state.liveData = live;
    state.api.backendReachable = true;
    state.api.liveFailures = 0;
    state.dataSourceOverride = null;
    state.statusDataSource = live.data_source;
    state.settings.pollIntervalMs = normalizeInterval(
      live.read_interval_ms || state.settings.pollIntervalMs
    );
    state.settings.interface = live.mode || state.settings.interface;
    ensureLivePolling(state.settings.pollIntervalMs);
  } catch (_error) {
    state.api.liveFailures += 1;
    state.api.backendReachable = false;
    state.dataSourceOverride = { ...CLIENT_FALLBACK_SOURCE };
    state.liveData = generateSimulatedLiveData(state.liveData);
    if (state.liveData) {
      state.liveData.data_source = { ...CLIENT_FALLBACK_SOURCE };
    }
  } finally {
    state.lastLiveUpdate = Date.now();
    pushLiveHistory(state.liveData);
    render();
  }
}

function pushLiveHistory(liveData) {
  if (!liveData || typeof liveData !== "object") return;
  const max = state.liveHistory.maxSamples;
  for (const field of BUS_KPI_FIELDS) {
    const raw = liveData[field.liveKey];
    const num = Number(raw);
    if (!Number.isFinite(num)) continue;
    if (!state.liveHistory[field.busKey]) {
      state.liveHistory[field.busKey] = [];
    }
    state.liveHistory[field.busKey].push(num);
    while (state.liveHistory[field.busKey].length > max) {
      state.liveHistory[field.busKey].shift();
    }
  }
}

function renderTinySparkline(samples, min, max) {
  if (!samples.length) {
    return '<div class="sparkline sparkline--tiny empty" aria-hidden="true"></div>';
  }
  const w = 56;
  const h = 18;
  const range = max - min || 1;
  const step = w / Math.max(1, samples.length - 1);
  const points = samples
    .map((v, i) => {
      const x = i * step;
      const y = h - ((Number(v) - min) / range) * h;
      return `${x},${y}`;
    })
    .join(" ");
  return `<svg class="sparkline sparkline--tiny" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true" title="Recent bus samples"><polyline points="${points}" /></svg>`;
}

function renderSparkline(samples, min, max) {
  if (!samples.length) return '<div class="sparkline empty"></div>';
  const w = 120;
  const h = 28;
  const range = max - min || 1;
  const step = w / Math.max(1, samples.length - 1);
  const points = samples
    .map((v, i) => {
      const x = i * step;
      const y = h - ((Number(v) - min) / range) * h;
      return `${x},${y}`;
    })
    .join(" ");
  return `<svg class="sparkline" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><polyline points="${points}" /></svg>`;
}

function renderGaugeBar(value, min, max) {
  const num = Number(value);
  const pct = Number.isFinite(num)
    ? clamp(((num - min) / (max - min)) * 100, 0, 100)
    : 0;
  return `<div class="gauge-bar"><div style="width:${pct}%"></div></div>`;
}

async function syncSessionFromBackend() {
  try {
    const cfg = await fetchJson("/api/session", 1200);
    if (cfg.profile === "hardware_elm327") {
      state.settings.interface = "hardware";
    } else if (cfg.profile) {
      state.settings.interface = "simulator";
    }
    if (cfg.serial_path) state.settings.serialPath = cfg.serial_path;
    if (cfg.read_interval_ms) {
      state.settings.pollIntervalMs = normalizeInterval(cfg.read_interval_ms);
    }
  } catch (_) {
    // backend not ready yet
  }
}

async function refreshStatusFromBackend() {
  try {
    const status = await fetchJson("/api/status", 1200);
    state.statusDataSource = normalizeDataSource(status.data_source);
    state.api.backendReachable = true;
  } catch (_) {
    // backend not ready yet
  }
}

async function applySessionToBackend(body) {
  try {
    await fetchJson("/api/session", 3000, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    state.api.backendReachable = true;
  } catch (_error) {
    // settings still saved locally
  }
}

async function refreshRecordings() {
  try {
    const payload = await fetchJson("/api/recordings", 1200);
    const recordings = normalizeRecordings(payload);
    if (payload?.data_source) {
      state.recordingsMeta.data_source = normalizeDataSource(payload.data_source);
    }
    if (recordings.length) {
      state.recordings = recordings;
    } else if (!state.recordings.length) {
      state.recordings = getFallbackRecordings();
      state.recordingsMeta.data_source = { ...DEMO_CATALOG_SOURCE };
    }
    state.api.recordingsFailures = 0;
  } catch (_error) {
    state.api.recordingsFailures += 1;
    if (!state.recordings.length) {
      state.recordings = getFallbackRecordings();
      state.recordingsMeta.data_source = { ...DEMO_CATALOG_SOURCE };
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
      saveState("csh-replay", {
        selectedRecordingId: state.replay.selectedRecordingId,
        progressPercent: 100,
      });
      render();
      return;
    }
    state.replay.progressPercent = next;
    saveState("csh-replay", {
      selectedRecordingId: state.replay.selectedRecordingId,
      progressPercent: next,
    });
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
    const speed = Math.round(40 + Math.sin(index / 12) * 35);
    return {
      rpm: clamp(rpm, 700, 3500),
      temperature: clamp(temperature, 60, 120),
      fuel_liters: clamp(fuel, 2, 55),
      speed_kmh: clamp(speed, 0, 180),
      gear: clamp(Math.round(speed / 35) || 1, 1, 6),
      battery_voltage: clamp(12.2 + Math.sin(index / 25) * 0.3, 11.5, 14.5),
      throttle_percent: clamp(Math.round(20 + Math.sin(index / 5) * 30), 0, 100),
      intake_air_temp: clamp(Math.round(22 + Math.sin(index / 20) * 8), 10, 55),
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

async function fetchJson(url, timeoutMs, init = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...init,
      headers: {
        Accept: "application/json",
        "x-api-key": "csh-secure-v1",
        ...(init.headers || {}),
      },
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
  const profile = String(payload.profile ?? mode);
  const speedKmh = toNumber(payload.speed_kmh);
  const gear = toNumber(payload.gear);
  const batteryVoltage = toNumber(payload.battery_voltage);
  const throttlePercent = toNumber(payload.throttle_percent);
  const intakeAirTemp = toNumber(payload.intake_air_temp);

  return {
    rpm: rpm ?? 0,
    temperature: temperature ?? 0,
    fuel_liters: fuelLiters ?? 0,
    speed_kmh: speedKmh ?? 0,
    gear: gear ?? 0,
    battery_voltage: batteryVoltage ?? 0,
    throttle_percent: throttlePercent ?? 0,
    intake_air_temp: intakeAirTemp ?? 0,
    connected,
    read_interval_ms: intervalMs,
    mode,
    profile,
    last_error: payload.last_error ?? null,
    data_source: normalizeDataSource(payload.data_source, {
      kind: profile,
      label: profile,
      trust: profile === "hardware_elm327" ? "verified" : "synthetic",
      is_real_vehicle: profile === "hardware_elm327",
      detail: null,
    }),
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
      const sourceKind = String(item.source_kind ?? "unknown");
      return {
        id,
        name,
        finished_at: finishedAt,
        size_bytes: Number.isFinite(sizeBytes) ? sizeBytes : 0,
        source_kind: sourceKind,
      };
    })
    .filter((item) => item.id);
}

function getFallbackRecordings() {
  return [
    {
      id: "demo-001",
      name: "Morning City Drive",
      finished_at: "2026-03-10T07:42:00Z",
      size_bytes: 1_824_112,
      source_kind: "demo",
    },
    {
      id: "demo-002",
      name: "Evening Country Road",
      finished_at: "2026-03-09T18:13:00Z",
      size_bytes: 2_906_345,
      source_kind: "demo",
    },
    {
      id: "demo-003",
      name: "Workshop Test Run",
      finished_at: "2026-03-08T11:05:00Z",
      size_bytes: 965_440,
      source_kind: "demo",
    },
  ];
}

function generateSimulatedLiveData(previousLiveData) {
  const prev = previousLiveData || {
    rpm: 900,
    temperature: 78,
    fuel_liters: 43,
    speed_kmh: 0,
    gear: 1,
    battery_voltage: 12.4,
    throttle_percent: 5,
    intake_air_temp: 22,
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
    speed_kmh: clamp(
      Math.round((prev.speed_kmh || 0) + randomInRange(-3, 5)),
      0,
      180
    ),
    gear: prev.gear || 1,
    battery_voltage: clamp(
      Number((prev.battery_voltage + randomInRange(-0.05, 0.05)).toFixed(2)),
      11.5,
      14.8
    ),
    throttle_percent: clamp(
      Math.round((prev.throttle_percent || 0) + randomInRange(-5, 5)),
      0,
      100
    ),
    intake_air_temp: clamp(
      Math.round((prev.intake_air_temp || 20) + randomInRange(-2, 2)),
      10,
      55
    ),
    connected: false,
    read_interval_ms: state.settings.pollIntervalMs,
    mode: "simulator",
    profile: "simulation",
    last_error: null,
    data_source: { ...CLIENT_FALLBACK_SOURCE },
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
  if (value === null || value === undefined || Number.isNaN(value)) return "\u2014";
  return new Intl.NumberFormat("en", {
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function formatDecimal(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return "\u2014";
  return new Intl.NumberFormat("en", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(Number(value));
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return "\u2014";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function formatDateTime(value) {
  if (!value) return "\u2014";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "\u2014";
  return date.toLocaleString("en", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatMs(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return "\u2014";
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
