import fs from "fs/promises";
import path from "path";
import { RouterState } from "../shared/types/router-state";

const DATA_DIR: string = path.join(process.cwd(), "data");
const INITIAL_DIR: string = path.join(DATA_DIR, ".initial");

interface RouterSeed {
  id: string;
  manufacturer: string;
  model: string;
}

const ROUTERS: RouterSeed[] = [
  { id: "router-a", manufacturer: "Generic", model: "Simulation Router A" },
  { id: "router-b", manufacturer: "NovaLink", model: "Simulation Router B" },
  { id: "router-c", manufacturer: "TechniCore", model: "Simulation Router C" },
  { id: "router-d", manufacturer: "HomeWave", model: "Simulation Router D" },
];

function buildState(seed: RouterSeed): RouterState {
  return {
    device: {
      id: seed.id,
      manufacturer: seed.manufacturer,
      model: seed.model,
      hostname: seed.id,
      firmware: "1.0.0",
    },
    wireless: {
      enabled: true,
      ssid: "Home Network",
      password: "example-password",
      security: "WPA2-PSK",
      broadcast: true,
      bands: {
        "2.4GHz": { enabled: true, channel: "auto" },
        "5GHz": { enabled: true, channel: "auto" },
      },
    },
    lan: {
      ipAddress: "192.168.1.1",
      subnetMask: "255.255.255.0",
      dhcp: {
        enabled: true,
        startAddress: "192.168.1.100",
        endAddress: "192.168.1.200",
        leaseTime: 86400,
      },
    },
    guestNetwork: {
      enabled: false,
      ssid: "Guest Network",
      security: "WPA2-PSK",
    },
    system: {
      adminUsername: "admin",
      timezone: "Africa/Nairobi",
      rebootRequired: false,
    },
  };
}

function isErrnoException(err: unknown): err is NodeJS.ErrnoException {
  return err instanceof Error && "code" in err;
}

async function writeIfMissing(filePath: string, content: string): Promise<void> {
  try {
    await fs.writeFile(filePath, content, { encoding: "utf-8", flag: "wx" });
    console.log(`  wrote: ${path.relative(process.cwd(), filePath)}`);
  } catch (err: unknown) {
    if (isErrnoException(err) && err.code === "EEXIST") {
      console.log(`  skip (exists): ${path.relative(process.cwd(), filePath)}`);
      return;
    }
    throw err;
  }
}

async function main(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(INITIAL_DIR, { recursive: true });

  for (const seed of ROUTERS) {
    const state: RouterState = buildState(seed);
    const json: string = JSON.stringify(state, null, 2);

    await writeIfMissing(path.join(DATA_DIR, `${seed.id}.json`), json);
    await writeIfMissing(path.join(INITIAL_DIR, `${seed.id}.json`), json);
  }

  console.log("\nSeed complete.");
  console.log("  Live files:     data/<router>.json");
  console.log("  Reset targets:  data/.initial/<router>.json");
  console.log("\nTo force-regenerate, delete the target file(s) and rerun.");
}

main().catch((e: unknown): void => {
  console.error("Seed failed:", e);
  process.exit(1);
});