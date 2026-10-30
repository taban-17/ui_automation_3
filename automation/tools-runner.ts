import { Page } from "playwright";
import type { PageMap, Sitemap } from "./sitemap/schema";
import type { RouterState } from "../router_ui_server/src/shared/types/router-state";

export interface ToolContext {
  page: Page;
  sitemap: Sitemap;
  router: string;
  currentPageId: () => string;
  setCurrentPageId: (id: string) => void;
  apiBase: string;
}

export interface ToolResult {
  ok: boolean;
  content: string;
}

export async function executeTool(
  name: string,
  args: Record<string, unknown>,
  ctx: ToolContext
): Promise<ToolResult> {
  try {
    switch (name) {
      case "identify_page":
        return await identifyPage(ctx);
      case "list_elements":
        return await listElements(ctx);
      case "click":
        return await click(String(args.text ?? ""), ctx);
      case "fill":
        return await fill(String(args.label ?? ""), String(args.value ?? ""), ctx);
      case "read_state":
        return await readState(ctx);
      case "navigate":
        return await navigate(String(args.pageId ?? ""), ctx);
      default:
        return { ok: false, content: `Unknown tool: ${name}` };
    }
  } catch (e) {
    return {
      ok: false,
      content: `Tool error: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
}

async function identifyPage(ctx: ToolContext): Promise<ToolResult> {
  const urlPath = new URL(ctx.page.url()).pathname;
  const match = Object.values(ctx.sitemap.routers[ctx.router].pages).find(
    (p) => p.url === urlPath
  );
  if (!match) {
    return {
      ok: false,
      content: `Unknown page at ${urlPath}. Use navigate(pageId) to go to a known page.`,
    };
  }
  ctx.setCurrentPageId(match.pageId);
  return {
    ok: true,
    content: JSON.stringify({
      pageId: match.pageId,
      title: match.title,
      headings: match.headings,
    }),
  };
}

async function listElements(ctx: ToolContext): Promise<ToolResult> {
  const pageId = ctx.currentPageId();
  const page = ctx.sitemap.routers[ctx.router].pages.find(
    (p) => p.pageId === pageId
  );
  if (!page) {
    return { ok: false, content: `Not on a known page (pageId=${pageId})` };
  }
  return {
    ok: true,
    content: JSON.stringify({
      pageId: page.pageId,
      fields: page.fields,
      elements: page.elements.map((e) => ({
        kind: e.kind,
        text: e.text,
        selector: e.selector,
        ...(e.value !== undefined ? { value: e.value } : {}),
      })),
    }),
  };
}

async function click(text: string, ctx: ToolContext): Promise<ToolResult> {
  const pageId = ctx.currentPageId();
  const pageMap = findPage(ctx, pageId);
  if (!pageMap) return { ok: false, content: `Unknown page ${pageId}` };

  const el = pageMap.elements.find(
    (e) => (e.kind === "button" || e.kind === "link") && e.text === text
  );
  if (!el) return { ok: false, content: `No clickable "${text}" on ${pageId}` };

  const locator = el.selector.startsWith("/")
    ? ctx.page.locator(`xpath=${el.selector}`)
    : ctx.page.locator(el.selector);

  await locator.click();
  await ctx.page.waitForLoadState("networkidle");
  return { ok: true, content: `Clicked "${text}" on ${pageId}` };
}

async function fill(
  label: string,
  value: string,
  ctx: ToolContext
): Promise<ToolResult> {
  const pageId = ctx.currentPageId();
  const pageMap = findPage(ctx, pageId);
  if (!pageMap) return { ok: false, content: `Unknown page ${pageId}` };

  const el = pageMap.elements.find(
    (e) => e.kind === "input" && e.text === label
  );
  if (!el) {
    return {
      ok: false,
      content: `No input labeled "${label}" on ${pageId}. Available: ${pageMap.elements
        .filter((e) => e.kind === "input")
        .map((e) => `"${e.text}"`)
        .join(", ")}`,
    };
  }

  const locator = el.selector.startsWith("/")
    ? ctx.page.locator(`xpath=${el.selector}`)
    : ctx.page.locator(el.selector);

  await locator.fill(value);

  // Verify the value actually stuck (React controlled inputs can reject fills)
  const actual = await locator.inputValue();
  if (actual !== value) {
    return {
      ok: false,
      content: `fill failed: expected "${value}", got "${actual}"`,
    };
  }

  return { ok: true, content: `Filled "${label}" = "${value}"` };
}

async function readState(ctx: ToolContext): Promise<ToolResult> {
  const res = await fetch(`${ctx.apiBase}/routers/${ctx.router}/state`);
  if (!res.ok) return { ok: false, content: `read_state: ${res.status}` };
  const state = (await res.json()) as RouterState;
  // Trim to what the agent cares about per turn
  return {
    ok: true,
    content: JSON.stringify({
      wireless: {
        ssid: state.wireless.ssid,
        password: state.wireless.password,
        enabled: state.wireless.enabled,
        broadcast: state.wireless.broadcast,
      },
      lan: { ipAddress: state.lan.ipAddress },
      guestNetwork: { enabled: state.guestNetwork.enabled },
      simulationTick: state.system.simulationTick,
    }),
  };
}

async function navigate(pageId: string, ctx: ToolContext): Promise<ToolResult> {
  const target = ctx.sitemap.routers[ctx.router].pages.find(
    (p) => p.pageId === pageId
  );
  if (!target) {
    return {
      ok: false,
      content: `Unknown pageId "${pageId}". Available: ${ctx.sitemap.routers[
        ctx.router
      ].pages.map((p) => p.pageId).join(", ")}`,
    };
  }
  const base = new URL(ctx.page.url()).origin;
  await ctx.page.goto(`${base}${target.url}`);
  await ctx.page.waitForLoadState("networkidle");
  ctx.setCurrentPageId(target.pageId);
  return { ok: true, content: `Navigated to ${pageId}` };
}

function findPage(ctx: ToolContext, pageId: string): PageMap | undefined {
  return ctx.sitemap.routers[ctx.router].pages.find((p) => p.pageId === pageId);
}