import type { CarState, PartialCarState } from '../carState';

export type BusProfileId = 'simulation' | 'hardware_elm327' | 'replay_file';

export interface AdapterCapabilities {
  /** Human-readable label for the settings UI. */
  label: string;
  /** Whether a serial device path is required. */
  needsSerialPath: boolean;
  /** Whether this profile represents real hardware. */
  isHardware: boolean;
}

/** Contract for USB cables, emulators, and synthetic BUS sources. */
export interface BusAdapter {
  /** Profile id, e.g. simulation or hardware_elm327. */
  getId(): BusProfileId;
  getCapabilities(): AdapterCapabilities;
  /** Open connection (serial port, file, etc.). */
  open(): Promise<void>;
  /** Release resources. */
  close(): Promise<void>;
  /** Read latest vehicle values (partial updates allowed). */
  readLive(): Promise<PartialCarState>;
  /** Last connection/read error, if any. */
  getLastError(): string | null;
  /** Whether the adapter considers itself connected to a data source. */
  isConnected(): boolean;
}

export interface SessionConfig {
  profile: BusProfileId;
  serial_path: string;
  replay_file?: string;
  read_interval_ms: number;
}
