import fs from "fs/promises";
import path from "path";
import {
  RouterState,
  RouterStatePatch,
  DeepPartial,
} from "../../shared/types/router-state";
import { routerStateSchema } from "../../config/router-schema";

const DATA_DIR: string = path.join(process.cwd(), "data");
const INITIAL_DIR: string = path.join(DATA_DIR, ".initial");
const HISTORY_DIR: string = path.join(DATA_DIR, ".history");

const writeQueues = new Map<string, Promise<unknown>>();

function enqueue<T>(routerId: string, task: () => Promise<T>): Promise<T> {
  const prev: Promise<unknown> = writeQueues.get(routerId) ?? Promise.resolve();
  const next: Promise<T> = prev.then(task, task);
  writeQueues.set(routerId, next.catch((): undefined => undefined));
  return next;
}

function statePath(routerId: string): string {
  return path.join(DATA_DIR, `${routerId}.json`);
}

function initialPath(routerId: string): string {
  return path.join(INITIAL_DIR, `${routerId}.json`);
}

function historyPath(routerId: string): string {
  return path.join(HISTORY_DIR, `${routerId}.jsonl`);
}

export interface HistoryEntry {
  timestamp: string;
  action: "update" | "reset" | "tick";
  patch?: RouterStatePatch;
  state: RouterState;
}

export async function ensureDirs(): Promise<void> {
  await fs.mkdir(INITIAL_DIR, { recursive: true });
  await fs.mkdir(HISTORY_DIR, { recursive: true });
}

export async function loadState(routerId: string): Promise<RouterState> {
  const raw: string = await fs.readFile(statePath(routerId), "utf-8");
  return JSON.parse(raw) as RouterState;
}

export async function saveState(
  routerId: string,
  state: RouterState
): Promise<void> {
  const validated: RouterState = routerStateSchema.parse(state);
  await fs.writeFile(
    statePath(routerId),
    JSON.stringify(validated, null, 2),
    "utf-8"
  );
}

async function recordHistory(
  entry: HistoryEntry,
  routerId: string
): Promise<void> {
  await fs.appendFile(historyPath(routerId), JSON.stringify(entry) + "\n", "utf-8");
}

export function updateState(
  routerId: string,
  patch: RouterStatePatch
): Promise<RouterState> {
  return enqueue(routerId, async (): Promise<RouterState> => {
    const current: RouterState = await loadState(routerId);
    const merged: RouterState = deepMerge<RouterState>(current, patch);
    const validated: RouterState = routerStateSchema.parse(merged);
    await saveState(routerId, validated);
    await recordHistory(
      {
        timestamp: new Date().toISOString(),
        action: "update",
        patch,
        state: validated,
      },
      routerId
    );
    return validated;
  });
}

export function resetState(routerId: string): Promise<RouterState> {
  return enqueue(routerId, async (): Promise<RouterState> => {
    const raw: string = await fs.readFile(initialPath(routerId), "utf-8");
    const initial: RouterState = JSON.parse(raw) as RouterState;
    const validated: RouterState = routerStateSchema.parse(initial);
    await saveState(routerId, validated);
    await recordHistory(
      {
        timestamp: new Date().toISOString(),
        action: "reset",
        state: validated,
      },
      routerId
    );
    return validated;
  });
}

export async function readHistory(
  routerId: string,
  limit?: number
): Promise<HistoryEntry[]> {
  let raw: string;
  try {
    raw = await fs.readFile(historyPath(routerId), "utf-8");
  } catch (e: unknown) {
    if (isErrnoException(e) && e.code === "ENOENT") return [];
    throw e;
  }
  const lines: string[] = raw
    .split("\n")
    .filter((l: string): boolean => l.length > 0);
  const entries: HistoryEntry[] = lines.map(
    (l: string): HistoryEntry => JSON.parse(l) as HistoryEntry
  );
  return limit !== undefined ? entries.slice(-limit) : entries;
}

export async function listRouters(): Promise<string[]> {
  const files: string[] = await fs.readdir(DATA_DIR);
  return files
    .filter((f: string): boolean => f.endsWith(".json"))
    .map((f: string): string => f.replace(/\.json$/, ""));
}

function isErrnoException(err: unknown): err is NodeJS.ErrnoException {
  return err instanceof Error && "code" in err;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function deepMerge<T>(target: T, source: DeepPartial<T>): T {
  if (isPlainObject(target) && isPlainObject(source)) {
    const targetObj: Record<string, unknown> = target;
    const sourceObj: Record<string, unknown> = source;
    const out: Record<string, unknown> = { ...targetObj };

    for (const key of Object.keys(sourceObj)) {
      const sv: unknown = sourceObj[key];
      const tv: unknown = targetObj[key];

      if (sv === undefined) continue;

      if (isPlainObject(sv) && isPlainObject(tv)) {
        out[key] = deepMerge(tv, sv as DeepPartial<Record<string, unknown>>);
      } else {
        out[key] = sv;
      }
    }
    return out as T;
  }
  return source as unknown as T;
}

export function tickState(
  routerId: string,
  increment: number
): Promise<RouterState> {
  if (!Number.isInteger(increment) || increment <= 0) {
    throw new Error("increment must be a positive integer");
  }
  return enqueue(routerId, async (): Promise<RouterState> => {
    const current = await loadState(routerId);
    const nextTick = current.system.simulationTick + increment;
    const next: RouterState = {
      ...current,
      system: { ...current.system, simulationTick: nextTick },
    };
    const validated = routerStateSchema.parse(next);
    await saveState(routerId, validated);
    await recordHistory(
      {
        timestamp: new Date().toISOString(),
        action: "tick",
        state: validated,
      },
      routerId
    );
    return validated;
  });
}