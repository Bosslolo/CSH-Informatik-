import { CarSynthesis } from '../synthesis';
import type { PartialCarState } from '../carState';
import type { BusAdapter } from './types';

/** Wraps CarSynthesis — default when no OBD cable is plugged in. */
export class SimulationAdapter implements BusAdapter {
  private synthesis: CarSynthesis;
  private lastError: string | null = null;

  constructor(synthesis: CarSynthesis) {
    this.synthesis = synthesis;
  }

  getId() {
    return 'simulation' as const;
  }

  getCapabilities() {
    return {
      label: 'Built-in simulator',
      needsSerialPath: false,
      isHardware: false,
    };
  }

  async open(): Promise<void> {
    this.lastError = null;
  }

  async close(): Promise<void> {
    this.lastError = null;
  }

  async readLive(): Promise<PartialCarState> {
    return this.synthesis.getLiveState();
  }

  getLastError(): string | null {
    return this.lastError;
  }

  isConnected(): boolean {
    return true;
  }
}
