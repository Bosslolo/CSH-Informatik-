import { CarSynthesis } from '../synthesis';
import { Elm327Adapter } from './elm327';
import { ReplayFileAdapter } from './replayFile';
import { SimulationAdapter } from './simulation';
import type { BusAdapter, BusProfileId, SessionConfig } from './types';

const PROFILE_IDS: BusProfileId[] = [
  'simulation',
  'hardware_elm327',
  'replay_file',
];

export function listAdapterProfiles() {
  return [
    {
      id: 'simulation' as const,
      label: 'Built-in simulator',
      needs_serial_path: false,
      is_hardware: false,
    },
    {
      id: 'hardware_elm327' as const,
      label: 'ELM327 USB OBD cable',
      needs_serial_path: true,
      is_hardware: true,
    },
    {
      id: 'replay_file' as const,
      label: 'Recorded file replay',
      needs_serial_path: false,
      needs_replay_file: true,
      is_hardware: false,
    },
  ];
}

export function isValidProfile(id: string): id is BusProfileId {
  return PROFILE_IDS.includes(id as BusProfileId);
}

export function createAdapter(
  config: SessionConfig,
  synthesis: CarSynthesis
): BusAdapter {
  switch (config.profile) {
    case 'hardware_elm327':
      return new Elm327Adapter(config.serial_path);
    case 'replay_file':
      return new ReplayFileAdapter(config.replay_file || '');
    case 'simulation':
    default:
      return new SimulationAdapter(synthesis);
  }
}
