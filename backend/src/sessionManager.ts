import {
  DEFAULT_CAR_STATE,
  mergeCarState,
  toLivePayload,
  type CarState,
} from './carState';
import { createAdapter, isValidProfile } from './adapters/registry';
import type { BusAdapter, SessionConfig } from './adapters/types';
import { buildDataSource } from './dataSource';
import { CarSynthesis } from './synthesis';
import path from 'path';
import fs from 'fs';

export const DEFAULT_REPLAY_FILE = path.join(
  __dirname,
  '../../data/bus-replay.jsonl'
);

function envProfile(): SessionConfig['profile'] {
  const raw = process.env.BUS_PROFILE || 'simulation';
  return isValidProfile(raw) ? raw : 'simulation';
}

function needsReplayFallback(
  config: SessionConfig,
  adapter: BusAdapter
): boolean {
  if (adapter.isConnected()) return false;
  if (config.profile === 'hardware_elm327') return true;
  if (config.profile === 'replay_file') {
    if (!config.replay_file) return true;
    const resolved = path.resolve(config.replay_file);
    if (!fs.existsSync(resolved)) return true;
    if (!adapter.isConnected()) return true;
  }
  return false;
}

function replayFallbackConfig(config: SessionConfig): SessionConfig {
  return {
    ...config,
    profile: 'replay_file',
    replay_file: config.replay_file || DEFAULT_REPLAY_FILE,
  };
}

export class SessionManager {
  private synthesis: CarSynthesis;
  private config: SessionConfig;
  private adapter: BusAdapter;
  private carState: CarState = { ...DEFAULT_CAR_STATE };

  constructor(synthesis: CarSynthesis) {
    this.synthesis = synthesis;
    this.config = {
      profile: envProfile(),
      serial_path: process.env.SERIAL_PATH || '',
      replay_file: process.env.REPLAY_FILE || DEFAULT_REPLAY_FILE,
      read_interval_ms: 1000,
    };
    this.adapter = createAdapter(this.config, synthesis);
    void this.switchAdapter(this.config);
  }

  getConfig(): SessionConfig {
    return { ...this.config };
  }

  async updateConfig(partial: Partial<SessionConfig>): Promise<SessionConfig> {
    const next: SessionConfig = {
      ...this.config,
      ...partial,
    };
    if (partial.profile && !isValidProfile(partial.profile)) {
      throw new Error(`Unknown profile: ${partial.profile}`);
    }
    if (next.profile) {
      await this.switchAdapter(next);
    } else {
      this.config = next;
    }
    return this.getConfig();
  }

  private async switchAdapter(config: SessionConfig): Promise<void> {
    await this.adapter.close();
    this.config = config;
    this.adapter = createAdapter(config, this.synthesis);
    try {
      await this.adapter.open();
    } catch {
      // Hardware open errors are handled inside adapters; never crash the server.
    }

    if (needsReplayFallback(config, this.adapter)) {
      const fallback = replayFallbackConfig(config);
      await this.adapter.close();
      this.config = fallback;
      this.adapter = createAdapter(this.config, this.synthesis);
      await this.adapter.open();
    }
  }

  async readLive() {
    if (needsReplayFallback(this.config, this.adapter)) {
      await this.switchAdapter(replayFallbackConfig(this.config));
    }

    const partial = await this.adapter.readLive();
    this.carState = mergeCarState(this.carState, partial);
    const connected = this.adapter.isConnected();
    const mode =
      this.adapter.getId() === 'hardware_elm327' ? 'hardware' : 'simulation';
    const lastError = this.adapter.getLastError();
    const data_source = buildDataSource(this.adapter, this.config, lastError);
    return toLivePayload(this.carState, {
      connected,
      mode,
      profile: this.adapter.getId(),
      read_interval_ms: this.config.read_interval_ms,
      last_error: lastError,
      data_source,
    });
  }

  getStatus() {
    const lastError = this.adapter.getLastError();
    const data_source = buildDataSource(this.adapter, this.config, lastError);
    return {
      status: 'online',
      profile: this.adapter.getId(),
      connected: this.adapter.isConnected(),
      mode: this.adapter.getCapabilities().isHardware ? 'hardware' : 'simulation',
      engine_running: true,
      last_error: lastError,
      serial_path: this.config.serial_path || null,
      data_source,
    };
  }
}
