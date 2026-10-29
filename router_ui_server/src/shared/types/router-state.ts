export interface ConnectedDevice {
  mac: string;          // "aa:bb:cc:dd:ee:ff"
  ip: string;           // "192.168.1.105"
  hostname: string;     // "Eugene-Laptop"
  interface: "wired" | "2.4GHz" | "5GHz";
  lastSeen: string;     // ISO 8601 timestamp
  joinedAtTick: number;
  leftAtTick: number | null;
}

export interface RouterState {
  device: {
    id: string;
    manufacturer: string;
    model: string;
    hostname: string;
    firmware: string;
  };
  wireless: {
    enabled: boolean;
    ssid: string;
    password: string;
    security: string;
    broadcast: boolean;
    bands: {
      "2.4GHz": { enabled: boolean; channel: string };
      "5GHz": { enabled: boolean; channel: string };
    };
  };
  lan: {
    ipAddress: string;
    subnetMask: string;
    dhcp: {
      enabled: boolean;
      startAddress: string;
      endAddress: string;
      leaseTime: number;
    };
  };
  guestNetwork: {
    enabled: boolean;
    ssid: string;
    security: string;
  };
  system: {
    adminUsername: string;
    timezone: string;
    rebootRequired: boolean;
    simulationTick: number;
  };
  connectedDevices: ConnectedDevice[]
}

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

export type RouterStatePatch = DeepPartial<RouterState>;

export function isDevicePresent(device: ConnectedDevice, tick: number): boolean {
  if (tick < device.joinedAtTick) return false;
  if (device.leftAtTick !== null && tick >= device.leftAtTick) return false;
  return true;
}