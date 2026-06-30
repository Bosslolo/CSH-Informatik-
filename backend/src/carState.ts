import type { DataSourceDescriptor } from './dataSource';

/** Canonical vehicle readings shared by all bus adapters. */
export interface CarState {
  rpm: number;
  speed_kmh: number;
  fuel_liters: number;
  motor_temp: number;
  gear: number;
  battery_voltage: number;
  throttle_percent: number;
  intake_air_temp: number;
  timestamp: string;
}

export type PartialCarState = Partial<CarState>;

export const DEFAULT_CAR_STATE: CarState = {
  rpm: 800,
  speed_kmh: 0,
  fuel_liters: 45.5,
  motor_temp: 20,
  gear: 1,
  battery_voltage: 12.4,
  throttle_percent: 0,
  intake_air_temp: 18,
  timestamp: new Date().toISOString(),
};

/** Merge adapter output into a full CarState (missing fields keep previous or defaults). */
export function mergeCarState(
  base: CarState,
  partial: PartialCarState
): CarState {
  return {
    rpm: partial.rpm ?? base.rpm,
    speed_kmh: partial.speed_kmh ?? base.speed_kmh,
    fuel_liters: partial.fuel_liters ?? base.fuel_liters,
    motor_temp: partial.motor_temp ?? base.motor_temp,
    gear: partial.gear ?? base.gear,
    battery_voltage: partial.battery_voltage ?? base.battery_voltage,
    throttle_percent: partial.throttle_percent ?? base.throttle_percent,
    intake_air_temp: partial.intake_air_temp ?? base.intake_air_temp,
    timestamp: partial.timestamp ?? new Date().toISOString(),
  };
}

/** JSON shape for GET /api/live (includes client aliases). */
export function toLivePayload(
  state: CarState,
  meta: {
    connected: boolean;
    mode: string;
    profile: string;
    read_interval_ms: number;
    last_error?: string | null;
    data_source: DataSourceDescriptor;
  }
) {
  return {
    ...state,
    temperature: state.motor_temp,
    connected: meta.connected,
    mode: meta.mode,
    profile: meta.profile,
    read_interval_ms: meta.read_interval_ms,
    last_error: meta.last_error ?? null,
    data_source: meta.data_source,
  };
}
