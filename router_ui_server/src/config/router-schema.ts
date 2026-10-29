import { z } from "zod";

const bandSchema = z.object({
  enabled: z.boolean(),
  channel: z.string(),
});

export const routerStateSchema = z.object({
  device: z.object({
    id: z.string(),
    manufacturer: z.string(),
    model: z.string(),
    hostname: z.string(),
    firmware: z.string(),
  }),
  wireless: z.object({
    enabled: z.boolean(),
    ssid: z.string().min(1).max(32),
    password: z.string().min(8).max(63),
    security: z.enum(["OPEN", "WPA2-PSK", "WPA3-PSK", "WPA2/WPA3"]),
    broadcast: z.boolean(),
    bands: z.object({
      "2.4GHz": bandSchema,
      "5GHz": bandSchema,
    }),
  }),
  lan: z.object({
    ipAddress: z.string().regex(/^(\d{1,3}\.){3}\d{1,3}$/, "Invalid IPv4 address"),
    subnetMask: z.string().regex(/^(\d{1,3}\.){3}\d{1,3}$/, "Invalid subnet mask"),
    dhcp: z.object({
      enabled: z.boolean(),
      startAddress: z.string(),
      endAddress: z.string(),
      leaseTime: z.number().int().positive(),
    }),
  }),
  guestNetwork: z.object({
    enabled: z.boolean(),
    ssid: z.string().min(1).max(32),
    security: z.string(),
  }),
  system: z.object({
    adminUsername: z.string(),
    timezone: z.string(),
    rebootRequired: z.boolean(),
  }),
});

// Deep-partial: every nested field optional at any depth, but each provided
// field still individually validated against its original constraints.
export const routerStatePatchSchema = z.deepPartial(routerStateSchema);

export type RouterStatePatchInput = z.infer<typeof routerStatePatchSchema>;