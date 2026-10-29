import { APIRequestContext, expect } from "@playwright/test";
import { RouterState } from "../../../router_ui_server/src/shared/types/router-state";

export const ROUTERS = ["router-a", "router-b", "router-c", "router-d"] as const;
export type RouterId = (typeof ROUTERS)[number];

export async function resetRouter(
  req: APIRequestContext,
  id: string
): Promise<RouterState> {
  const r = await req.post(`/api/routers/${id}/reset`);
  expect(r.ok(), `reset ${id}`).toBeTruthy();
  const body = (await r.json()) as { state: RouterState };
  return body.state;
}

export async function getState(
  req: APIRequestContext,
  id: string
): Promise<RouterState> {
  const r = await req.get(`/api/routers/${id}/state`);
  expect(r.ok(), `getState ${id}`).toBeTruthy();
  return (await r.json()) as RouterState;
}

export async function patchState(
  req: APIRequestContext,
  id: string,
  patch: object
): Promise<RouterState> {
  const r = await req.patch(`/api/routers/${id}/state`, { data: patch });
  expect(r.ok(), `patchState ${id}`).toBeTruthy();
  const body = (await r.json()) as { state: RouterState };
  return body.state;
}

export interface HistoryEntry {
  timestamp: string;
  action: "update" | "reset";
  patch?: object;
  state: RouterState;
}

export async function getHistory(
  req: APIRequestContext,
  id: string
): Promise<HistoryEntry[]> {
  const r = await req.get(`/api/routers/${id}/history`);
  expect(r.ok(), `getHistory ${id}`).toBeTruthy();
  const body = (await r.json()) as { entries: HistoryEntry[] };
  return body.entries;
}