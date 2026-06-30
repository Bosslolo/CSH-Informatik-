import type { PartialCarState } from '../carState';
import type { BusAdapter } from './types';

type SerialPortLike = {
  close(): Promise<void>;
  write(data: string, cb?: (err?: Error | null) => void): void;
  on(event: 'data', handler: (chunk: Buffer) => void): void;
  on(event: 'error', handler: (err: Error) => void): void;
  removeAllListeners(event: 'data'): void;
};

type SerialPortConstructor = new (options: {
  path: string;
  baudRate: number;
  autoOpen?: boolean;
}) => SerialPortLike & { open(): Promise<void> };

/**
 * ELM327-class USB OBD-II cable: AT init + standard Mode 01 PIDs.
 * Gracefully degrades when serialport is missing or the port is unavailable.
 */
export class Elm327Adapter implements BusAdapter {
  private serialPath: string;
  private port: SerialPortLike | null = null;
  private lastError: string | null = null;
  private connected = false;
  private lastRead: PartialCarState = {};
  private buffer = '';

  constructor(serialPath: string) {
    this.serialPath = serialPath;
  }

  getId() {
    return 'hardware_elm327' as const;
  }

  getCapabilities() {
    return {
      label: 'ELM327 USB OBD cable',
      needsSerialPath: true,
      isHardware: true,
    };
  }

  async open(): Promise<void> {
    this.lastError = null;
    if (!this.serialPath) {
      this.lastError = 'No serial path configured (set SERIAL_PATH or Settings).';
      this.connected = false;
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { SerialPort } = require('serialport') as {
        SerialPort: SerialPortConstructor;
      };
      const port = new SerialPort({
        path: this.serialPath,
        baudRate: 38400,
        autoOpen: false,
      });
      port.on('error', () => {
        this.connected = false;
      });
      await port.open();
      this.port = port;
      await this.sendAt('ATZ');
      await this.sendAt('ATE0');
      await this.sendAt('ATL0');
      this.connected = true;
      this.lastError = null;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.lastError = `ELM327 open failed: ${msg}`;
      this.connected = false;
      await this.close();
    }
  }

  async close(): Promise<void> {
    if (this.port) {
      try {
        await this.port.close();
      } catch {
        // ignore
      }
      this.port = null;
    }
    this.connected = false;
  }

  async readLive(): Promise<PartialCarState> {
    if (!this.connected || !this.port) {
      return { ...this.lastRead };
    }

    try {
      const rpm = await this.queryPid('010C');
      const speed = await this.queryPid('010D');
      const coolant = await this.queryPid('0105');
      const throttle = await this.queryPid('0111');
      const iat = await this.queryPid('010F');

      const partial: PartialCarState = {
        timestamp: new Date().toISOString(),
      };
      if (rpm !== null) partial.rpm = rpm;
      if (speed !== null) partial.speed_kmh = speed;
      if (coolant !== null) partial.motor_temp = coolant;
      if (throttle !== null) partial.throttle_percent = throttle;
      if (iat !== null) partial.intake_air_temp = iat;

      this.lastRead = { ...this.lastRead, ...partial };
      this.lastError = null;
      return partial;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.lastError = `ELM327 read failed: ${msg}`;
      return { ...this.lastRead };
    }
  }

  getLastError(): string | null {
    return this.lastError;
  }

  isConnected(): boolean {
    return this.connected;
  }

  private sendAt(cmd: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.port) {
        reject(new Error('Port not open'));
        return;
      }
      const timeout = setTimeout(() => {
        this.port?.removeAllListeners('data');
        reject(new Error(`Timeout: ${cmd}`));
      }, 2000);

      const onData = (chunk: Buffer) => {
        this.buffer += chunk.toString('utf8');
        if (this.buffer.includes('>') || this.buffer.includes('OK')) {
          clearTimeout(timeout);
          this.port?.removeAllListeners('data');
          const out = this.buffer;
          this.buffer = '';
          resolve(out);
        }
      };

      this.port.on('data', onData);
      this.port.write(`${cmd}\r`);
    });
  }

  private async queryPid(pid: string): Promise<number | null> {
    const raw = await this.sendAt(pid);
    return decodePid(pid, raw);
  }
}

function decodePid(pid: string, raw: string): number | null {
  const hex = raw.replace(/[^0-9A-Fa-f]/g, '').toUpperCase();
  const idx = hex.indexOf('41' + pid.slice(2));
  if (idx < 0) return null;
  const bytes = hex.slice(idx + 4);
  if (bytes.length < 2) return null;

  switch (pid) {
    case '010C': {
      const a = parseInt(bytes.slice(0, 2), 16);
      const b = parseInt(bytes.slice(2, 4) || '00', 16);
      return Math.round(((256 * a + b) / 4) * 10) / 10;
    }
    case '010D':
      return parseInt(bytes.slice(0, 2), 16);
    case '0105':
      return parseInt(bytes.slice(0, 2), 16) - 40;
    case '0111':
      return Math.round((parseInt(bytes.slice(0, 2), 16) * 100) / 255);
    case '010F':
      return parseInt(bytes.slice(0, 2), 16) - 40;
    default:
      return null;
  }
}
