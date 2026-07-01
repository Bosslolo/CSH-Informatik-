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

// adapter-registry:v1 part=adapter digest=c2U6IG1haW4qKiBhbmQgKipjb21wYXJlOiBzdHVkZW50J3MgYnJhbmNoKioKNC4gQ2xpY2sgKipDcmVhdGUgcHVsbCByZXF1ZXN0KioKNS4gQ2xpY2sgKipNZXJnZSBwdWxsIHJlcXVlc3QqKiwgdGhlbiAqKkNvbmZpcm0gbWVyZ2UqKgo2LiBCYWNrIGluIEdpdEh1YiBEZXNrdG9wOiBzd2l0Y2ggdG8gKiptYWluKiosIHRoZW4gY2xpY2sgKipQdWxsIG9yaWdpbioqIHRvIHN5bmMgbG9jYWxseQoKIyMgVmVyaWZpY2F0aW9uIGNoZWNrbGlzdAoKQWZ0ZXIgZWFjaCBzdGVwLCBjb25maXJtIHdpdGggdGhlIHN0dWRlbnQ6Ci0gR2l0SHViIERlc2t0b3Agc2hvd3MgdGhlIGNvcnJlY3QgKipDdXJyZW50IEJyYW5jaCoqCi0gQWZ0ZXIgY29tbWl0OiAqKkNoYW5nZXMqKiB0YWIgaXMgZW1wdHkgKGNvbW1pdCBzdWNjZWVkZWQpCi0gQWZ0ZXIgcHVzaDogbm8gIlB1c2ggb3JpZ2luIiBidXR0b24gcGVuZGluZwotIEFmdGVyIFBSIG1lcmdlOiAqKm1haW4qKiBvbiB0aGUgd2Vic2l0ZSBzaG93cyB0aGVpciBjaGFuZ2U7IERlc2t0b3AgKipQdWxsIG9yaWdpbioqIG9uIG1haW4gdXBkYXRlcyBsb2NhbGx5CgojIyBUcm91Ymxlc2hvb3RpbmcKCnwgUHJvYmxlbSB8IEZpeCAoRGVza3RvcCAvIHdlYikgfAp8LS0tLS0tLS0tfC0tLS0tLS0tLS0tLS0tLS0tLS0tLXwKfCBDYW5ub3QgcHVzaCB8IFB1bGwgb24gbWFpbiBmaXJzdCwgdGhlbiBvbiBicmFuY2ggdHJ5IFB1c2ggYWdhaW47IG9yIGFzayB0ZWFtbWF0ZSBpZiBtYWluIG1vdmVkIHwKfCBDb21taXR0ZWQgb24gbWFpbiBieSBtaXN0YWtlIHwgQnJhbmNoIOKGkiBOZXcgYnJhbmNoIChrZWVwcyBjaGFuZ2VzKSwgY29tbWl0IHRoZXJlIGluc3RlYWQgfAp8IE5vIENvbXBhcmUgJiBwdWxsIHJlcXVlc3QgYmFubmVyIHwgUHVsbCByZXF1ZXN0cyDihpIgTmV3IOKGkiBwaWNrIGJhc2UgbWFpbiBhbmQgdGhlaXIgYnJhbmNoIHwKfCBQcmUtcHVzaCBob29rIGZhaWxlZCB8IFVuY2hlY2sgLmVudiBvciBzZWNyZXQgZmlsZXMgZnJvbSB0aGUgY29tbWl0IHwKfCBXcm9uZyBicmFuY2ggc2VsZWN0ZWQgfCBCcmFuY2ggbWVudSDihpIgc3dpdGNoIHRvIHRoZSBjb3JyZWN0IGJyYW5jaCB8CgojIyBUZWFjaGluZyBzdHlsZQoKLSBVc2UgR2l0SHViIERlc2t0b3AgYnV0dG9uIG5hbWVzIGFuZCBHaXRIdWIgd2Vic2l0ZSBsYWJlbHMg4oCUIG5vdCBiYXNoIGNvbW1hbmRzCi0gRXhwbGFpbiBlYWNoIGNsaWNrIGluIG9uZSBzZW50ZW5jZSBiZWZvcmUgdGhlIHN0dWRlbnQgZG9lcyBpdAotIElmIHN0dWRlbnQgaXMgc3R1Y2ssIHRlbGwgdGhlbSBleGFjdGx5IHdoaWNoIGJ1dHRvbiBvciBtZW51IGl0ZW0gdG8gdXNlCi0gQ2VsZWJyYXRlIHdoZW4gYWxsIGZpdmUgc3RlcHMgY29tcGxldGUgc3VjY2Vzc2Z1bGx5Cg==
