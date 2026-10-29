import { RouterState } from "@shared/types/router-state";

const API_BASE = "/api/routers";

export async function listRouters(): Promise<string[]> {
  const r = await fetch(API_BASE);
  if (!r.ok) throw new Error(`listRouters: ${r.status}`);
  const body = (await r.json()) as { routers: string[] };
  return body.routers;
}

export async function getState(routerId: string): Promise<RouterState> {
  const r = await fetch(`${API_BASE}/${routerId}/state`);
  if (!r.ok) throw new Error(`getState(${routerId}): ${r.status}`);
  return (await r.json()) as RouterState;
}

export async function patchState(
  routerId: string,
  patch: object
): Promise<RouterState> {
  const r = await fetch(`${API_BASE}/${routerId}/state`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!r.ok) {
    const errBody = await r.text();
    throw new Error(`patchState(${routerId}): ${r.status} — ${errBody}`);
  }
  const body = (await r.json()) as { state: RouterState };
  return body.state;
}

export async function resetRouter(routerId: string): Promise<RouterState> {
  const r = await fetch(`${API_BASE}/${routerId}/reset`, { method: "POST" });
  if (!r.ok) throw new Error(`resetRouter(${routerId}): ${r.status}`);
  const body = (await r.json()) as { state: RouterState };
  return body.state;
}