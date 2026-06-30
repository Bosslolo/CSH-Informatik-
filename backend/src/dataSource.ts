import type { BusAdapter, SessionConfig } from './adapters/types';

export type DataSourceTrust =
  | 'verified'
  | 'recorded'
  | 'synthetic'
  | 'demo'
  | 'degraded';

export interface DataSourceDescriptor {
  kind: string;
  label: string;
  trust: DataSourceTrust;
  is_real_vehicle: boolean;
  detail: string | null;
}

const TRUST_BY_PROFILE: Record<
  string,
  { trust: DataSourceTrust; is_real_vehicle: boolean }
> = {
  hardware_elm327: { trust: 'verified', is_real_vehicle: true },
  replay_file: { trust: 'recorded', is_real_vehicle: false },
  simulation: { trust: 'synthetic', is_real_vehicle: false },
};

export const DEMO_CATALOG_DATA_SOURCE: DataSourceDescriptor = {
  kind: 'demo_catalog',
  label: 'Demo recordings',
  trust: 'demo',
  is_real_vehicle: false,
  detail: null,
};

/** Build canonical data_source metadata for live/status API responses. */
export function buildDataSource(
  adapter: BusAdapter,
  config: SessionConfig,
  lastError?: string | null
): DataSourceDescriptor {
  const kind = adapter.getId();
  const caps = adapter.getCapabilities();
  const mapping = TRUST_BY_PROFILE[kind] ?? {
    trust: 'synthetic' as const,
    is_real_vehicle: false,
  };

  let detail: string | null = null;
  if (kind === 'hardware_elm327' && config.serial_path) {
    detail = config.serial_path;
  } else if (kind === 'replay_file' && config.replay_file) {
    detail = config.replay_file;
  }

  const connected = adapter.isConnected();
  const error = lastError ?? adapter.getLastError();

  let trust = mapping.trust;
  if (kind === 'replay_file' && (!connected || error)) {
    trust = 'degraded';
    detail = error || detail;
  } else if (kind === 'hardware_elm327' && (!connected || error)) {
    trust = 'degraded';
    detail = error || detail;
  }

  return {
    kind,
    label:
      kind === 'replay_file' && connected
        ? 'Live bus replay stream'
        : caps.label,
    trust,
    is_real_vehicle: mapping.is_real_vehicle && connected && !error,
    detail,
  };
}
