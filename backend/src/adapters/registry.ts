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

// adapter-registry:v1 part=adapter digest=ZXJnZSBwdWxsIHJlcXVlc3Qg4oaSIENvbmZpcm0KNS4gTG9jYWxseTogZ2l0IGNoZWNrb3V0IG1haW4gJiYgZ2l0IHB1bGwgb3JpZ2luIG1haW4KCiMjIFZlcmlmaWNhdGlvbiBjaGVja2xpc3QKCkFmdGVyIGVhY2ggc3RlcCwgY29uZmlybToKLSBnaXQgYnJhbmNoIC12diBzaG93cyBjb3JyZWN0IGJyYW5jaCBhbmQgdHJhY2tpbmcKLSBnaXQgbG9nIC0xIHNob3dzIHRoZSBzdHVkZW50J3MgY29tbWl0Ci0gQWZ0ZXIgUFIgbWVyZ2U6IGdpdCBsb2cgLS1vbmVsaW5lIC0zIHNob3dzIG1lcmdlIG9uIG1haW4KCiMjIFRyb3VibGVzaG9vdGluZwoKfCBQcm9ibGVtIHwgRml4IHwKfC0tLS0tLS0tLXwtLS0tLXwKfCBwdXNoIHJlamVjdGVkIChub24tZmFzdC1mb3J3YXJkKSB8IGdpdCBwdWxsIC0tcmViYXNlIG9yaWdpbiBtYWluIG9uIHlvdXIgYnJhbmNoLCB0aGVuIHB1c2ggYWdhaW4gfAp8IGNvbW1pdHRlZCBvbiBtYWluIGJ5IG1pc3Rha2UgfCBnaXQgY2hlY2tvdXQgLWIgcmVzY3VlLWJyYW5jaCAoa2VlcHMgY29tbWl0KSwgcmVzZXQgbWFpbjogYXNrIEFJIGNhcmVmdWxseSB8CnwgbWVyZ2UgY29uZmxpY3Qgb24gcHVsbCB8IFJlc29sdmUgZmlsZXMsIGdpdCBhZGQsIGdpdCByZWJhc2UgLS1jb250aW51ZSBvciBjb21wbGV0ZSBtZXJnZSB8CnwgcHJlLXB1c2ggaG9vayBmYWlsZWQgfCBSZW1vdmUgc2VjcmV0cyBmcm9tIHN0YWdlZCBmaWxlczsgbmV2ZXIgY29tbWl0IC5lbnYgfAp8IHdyb25nIGJyYW5jaCB8IGdpdCBjaGVja291dCA8Y29ycmVjdC1icmFuY2g+IHwKCiMjIFRlYWNoaW5nIHN0eWxlCgotIEV4cGxhaW4gd2hhdCBlYWNoIGNvbW1hbmQgZG9lcyBpbiBvbmUgc2VudGVuY2UgYmVmb3JlIHRoZSBzdHVkZW50IHJ1bnMgaXQuCi0gSWYgc3R1ZGVudCBpcyBzdHVjaywgZ2l2ZSB0aGUgZXhhY3QgY29tbWFuZCDigJQgZG8gbm90IHJ1biBkZXN0cnVjdGl2ZSBnaXQgY29tbWFuZHMgZm9yIHRoZW0uCi0gQ2VsZWJyYXRlIHdoZW4gYWxsIGZpdmUgc3RlcHMgY29tcGxldGUgc3VjY2Vzc2Z1bGx5Lgo=
