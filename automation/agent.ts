import { chromium, Page } from "playwright";
import { chat } from "./openrouter";
import type { ChatMessage, ToolCall } from "./tools";
import { TOOLS } from "./tools";
import { buildSystemPrompt, summarizeSitemap } from "./prompt";
import { loadSitemap, loadFields, mergeFields } from "./sitemap/index";
import { executeTool, ToolContext } from "./tools-runner";

import type { RouterState } from "../router_ui_server/src/shared/types/router-state";


const FRONTEND_BASE = "http://localhost:5173";
const API_BASE = "http://localhost:4000/api";

interface Scenario {
  router: string;
  entryPageId: string;
  entryUrl: string;
  instruction: string;
  expected: (state: RouterState) => void;
}

async function runScenario(
  page: Page,
  scenario: Scenario,
  sitemap: ReturnType<typeof mergeFields> extends infer T ? any : any
): Promise<{ ok: boolean; turns: number; totalCached: number; totalPrompt: number }> {
  const sessionId = `${scenario.router}-${Date.now()}`;
  const systemPrompt = buildSystemPrompt(summarizeSitemap(sitemap));
  const apiBase = API_BASE;

  let currentPageId = scenario.entryPageId;

  const ctx: ToolContext = {
    page,
    sitemap,
    router: scenario.router,
    currentPageId: () => currentPageId,
    setCurrentPageId: (id) => { currentPageId = id; },
    apiBase,
  };

  // Reset state, navigate to entry
  await fetch(`${apiBase}/routers/${scenario.router}/reset`, { method: "POST" });
  await page.goto(`${FRONTEND_BASE}${scenario.entryUrl}`);
  await page.waitForLoadState("networkidle");

  const messages: ChatMessage[] = [
    { role: "user", content: scenario.instruction },
  ];

  let totalCached = 0;
  let totalPrompt = 0;
  const MAX_TURNS = 8;
  let loopTurns = 0;

  for (let turn = 1; turn <= MAX_TURNS; turn++) {
    loopTurns = turn;
    const response = await chat({
      sessionId,
      systemPrompt,
      messages,
      tools: TOOLS,
    });

    totalCached += response.usage.cached_tokens;
    totalPrompt += response.usage.prompt_tokens;

    console.log(
      `[${scenario.router}] turn ${loopTurns}  prompt=${response.usage.prompt_tokens}  cached=${response.usage.cached_tokens}  finish=${response.finishReason}`
    );

    messages.push(response.assistant);

    if (response.toolCalls.length === 0) {
      console.log(`[${scenario.router}] agent says done: ${response.assistant.content}`);
      break;
    }

    for (const call of response.toolCalls) {
      const args = JSON.parse(call.function.arguments) as Record<string, unknown>;
      const result = await executeTool(call.function.name, args, ctx);
      console.log(
        `[${scenario.router}] ${call.function.name}(${JSON.stringify(args)}) → ${result.ok ? "ok" : "ERR"}`
      );
      messages.push({
        role: "tool",
        content: result.content,
        tool_call_id: call.id,
      });
    }
  }

  // Verify final state
  const res = await fetch(`${apiBase}/routers/${scenario.router}/state`);
  const state = await res.json();
  let ok = false;
  try {
    scenario.expected(state);
    ok = true;
  } catch (e) {
    console.error(`[${scenario.router}] assertion failed:`, (e as Error).message);
  }

  return { ok, turns: messages.length, totalCached, totalPrompt };
}

const SCENARIOS: Record<string, Scenario> = {
  // ── Router A ────────────────────────────────────────
  "t001-a": {
    router: "router-a",
    entryPageId: "router-a/wireless/basic",
    entryUrl: "/router-a/wireless/basic",
    instruction:
      "Change the SSID to Office Network. When the change is applied and confirmed, say DONE.",
    expected: (s) => {
      if (s.wireless.ssid !== "Office Network")
        throw new Error(`expected ssid=Office Network, got ${s.wireless.ssid}`);
    },
  },
  "t002-a": {
    router: "router-a",
    entryPageId: "router-a/wireless/security",
    entryUrl: "/router-a/wireless/security",
    instruction:
      "Change the Pre-Shared Key to NewStrongPass!2026. When the change is applied and confirmed, say DONE.",
    expected: (s) => {
      if (s.wireless.password !== "NewStrongPass!2026")
        throw new Error(
          `expected password=NewStrongPass!2026, got ${s.wireless.password}`
        );
    },
  },
  "t006-a": {
    router: "router-a",
    entryPageId: "router-a/lan",
    entryUrl: "/router-a/lan",
    instruction:
      "Change the LAN IP Address to 192.168.5.1. When the change is applied and confirmed, say DONE.",
    expected: (s) => {
      if (s.lan.ipAddress !== "192.168.5.1")
        throw new Error(`expected lan ip=192.168.5.1, got ${s.lan.ipAddress}`);
    },
  },

  // ── Router B ────────────────────────────────────────
  "t001-b": {
    router: "router-b",
    entryPageId: "router-b/",
    entryUrl: "/router-b",
    instruction:
      "Change the Wi-Fi Name to Office Network. When the change is applied and confirmed, say DONE.",
    expected: (s) => {
      if (s.wireless.ssid !== "Office Network")
        throw new Error(`expected ssid=Office Network, got ${s.wireless.ssid}`);
    },
  },
  "t002-b": {
    router: "router-b",
    entryPageId: "router-b/",
    entryUrl: "/router-b",
    instruction:
      "Change the Wi-Fi Password to NewStrongPass!2026. When the change is applied and confirmed, say DONE.",
    expected: (s) => {
      if (s.wireless.password !== "NewStrongPass!2026")
        throw new Error(
          `expected password=NewStrongPass!2026, got ${s.wireless.password}`
        );
    },
  },
  "t006-b": {
    router: "router-b",
    entryPageId: "router-b/",
    entryUrl: "/router-b",
    instruction:
      "Change the Router IP to 192.168.5.1. When the change is applied and confirmed, say DONE.",
    expected: (s) => {
      if (s.lan.ipAddress !== "192.168.5.1")
        throw new Error(`expected lan ip=192.168.5.1, got ${s.lan.ipAddress}`);
    },
  },

  // ── Router C ────────────────────────────────────────
  "t001-c": {
    router: "router-c",
    entryPageId: "router-c/wlan",
    entryUrl: "/router-c/wlan",
    instruction:
      "Change the WLAN SSID to Office Network. When the change is applied and confirmed, say DONE.",
    expected: (s) => {
      if (s.wireless.ssid !== "Office Network")
        throw new Error(`expected ssid=Office Network, got ${s.wireless.ssid}`);
    },
  },
  "t002-c": {
    router: "router-c",
    entryPageId: "router-c/security",
    entryUrl: "/router-c/security",
    instruction:
      "Change the WPA Pre-Shared Key to NewStrongPass!2026. When the change is applied and confirmed, say DONE.",
    expected: (s) => {
      if (s.wireless.password !== "NewStrongPass!2026")
        throw new Error(
          `expected password=NewStrongPass!2026, got ${s.wireless.password}`
        );
    },
  },
  "t006-c": {
    router: "router-c",
    entryPageId: "router-c/interface",
    entryUrl: "/router-c/interface",
    instruction:
      "Change the Management Interface Address to 192.168.5.1. When the change is applied and confirmed, say DONE.",
    expected: (s) => {
      if (s.lan.ipAddress !== "192.168.5.1")
        throw new Error(`expected lan ip=192.168.5.1, got ${s.lan.ipAddress}`);
    },
  },
};

async function main(): Promise<void> {
  const sitemap = await loadSitemap();
  const fields = await loadFields();
  mergeFields(sitemap, fields);

  const browser = await chromium.launch({
    headless: false,
    slowMo:400
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.addInitScript(
    "globalThis.__name = globalThis.__name || ((fn) => fn);"
  );

  const scenarioKey = process.env.SCENARIO ?? "t001-a";
const scenario = SCENARIOS[scenarioKey];
if (!scenario) {
  console.error(
    `Unknown SCENARIO=${scenarioKey}. Available: ${Object.keys(SCENARIOS).join(", ")}`
  );
  process.exit(1);
}

console.log(`Running scenario ${scenarioKey} (router=${scenario.router})`);

const result = await runScenario(page, scenario, sitemap);
  console.log(
    `\nresult: ${result.ok ? "PASS" : "FAIL"}  messages=${result.turns}  cached=${result.totalCached}/${result.totalPrompt}`
  );

  await browser.close();
  process.exit(result.ok ? 0 : 1);
}

main().catch((e: unknown) => {
  console.error(e);
  process.exit(1);
});