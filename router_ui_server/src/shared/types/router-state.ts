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
  };
}

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

export type RouterStatePatch = DeepPartial<RouterState>;