import fs from 'fs';
import path from 'path';
import type { PartialCarState } from '../carState';
import type { BusAdapter } from './types';

/** Feed live data from a JSON array file (one object per line or JSON array). */
export class ReplayFileAdapter implements BusAdapter {
  private filePath: string;
  private samples: PartialCarState[] = [];
  private index = 0;
  private lastError: string | null = null;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  getId() {
    return 'replay_file' as const;
  }

  getCapabilities() {
    return {
      label: 'Recorded file replay',
      needsSerialPath: false,
      isHardware: false,
    };
  }

  async open(): Promise<void> {
    this.lastError = null;
    const resolved = path.resolve(this.filePath);
    if (!fs.existsSync(resolved)) {
      this.lastError = `Replay file not found: ${resolved}`;
      this.samples = [];
      return;
    }
    const raw = fs.readFileSync(resolved, 'utf8').trim();
    try {
      if (raw.startsWith('[')) {
        this.samples = JSON.parse(raw) as PartialCarState[];
      } else {
        this.samples = raw
          .split('\n')
          .filter(Boolean)
          .map((line) => JSON.parse(line) as PartialCarState);
      }
      this.index = 0;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.lastError = `Invalid replay file: ${msg}`;
      this.samples = [];
    }
  }

  async close(): Promise<void> {
    this.samples = [];
    this.index = 0;
  }

  async readLive(): Promise<PartialCarState> {
    if (!this.samples.length) {
      return { timestamp: new Date().toISOString() };
    }
    const sample = this.samples[this.index % this.samples.length];
    this.index += 1;
    return { ...sample, timestamp: new Date().toISOString() };
  }

  getLastError(): string | null {
    return this.lastError;
  }

  isConnected(): boolean {
    return this.samples.length > 0 && !this.lastError;
  }
}
