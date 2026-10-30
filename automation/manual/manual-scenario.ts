import { chromium } from "playwright";
import { loadSitemap, loadFields, mergeFields } from "../sitemap/index";
import { executeTool, ToolContext } from "../tools-runner";

interface ManualStep {
  name: string;
  args: Record<string, unknown>;
  pauseMs?: number;
  note?: string;
}

interface ManualScenario {
  router: string;
  entryUrl: string;
  entryPageId: string;
  steps: ManualStep[];
}

const SCENARIOS: Record<string, ManualScenario> = {
  // ── Router A ────────────────────────────────────────
  "t001-a": {
    router: "router-a",
    entryPageId: "router-a/wireless/basic",
    entryUrl: "/router-a/wireless/basic",
    steps: [
      { name: "identify_page", args: {} },
      { name: "list_elements", args: {} },
      {
        name: "fill",
        args: { label: "SSID", value: "Office Network" },
        pauseMs: 2000,
        note: "input should show Office Network",
      },
      {
        name: "click",
        args: { text: "Save" },
        pauseMs: 2000,
        note: "look for 'Settings saved' banner",
      },
      { name: "read_state", args: {} },
    ],
  },
  "t002-a": {
    router: "router-a",
    entryPageId: "router-a/wireless/security",
    entryUrl: "/router-a/wireless/security",
    steps: [
      { name: "identify_page", args: {} },
      { name: "list_elements", args: {} },
      {
        name: "fill",
        args: { label: "Pre-Shared Key", value: "NewStrongPass!2026" },
        pauseMs: 1500,
      },
      {
        name: "click",
        args: { text: "Save" },
        pauseMs: 1500,
        note: "look for 'Security settings saved'",
      },
      { name: "read_state", args: {} },
    ],
  },
  "t006-a": {
    router: "router-a",
    entryPageId: "router-a/lan",
    entryUrl: "/router-a/lan",
    steps: [
      { name: "identify_page", args: {} },
      { name: "list_elements", args: {} },
      {
        name: "fill",
        args: { label: "LAN IP Address", value: "192.168.5.1" },
        pauseMs: 1500,
      },
      {
        name: "click",
        args: { text: "Save" },
        pauseMs: 1500,
        note: "look for 'LAN settings saved'",
      },
      { name: "read_state", args: {} },
    ],
  },

  // ── Router B ────────────────────────────────────────
  "t001-b": {
    router: "router-b",
    entryPageId: "router-b/",
    entryUrl: "/router-b",
    steps: [
      { name: "identify_page", args: {} },
      { name: "list_elements", args: {}, note: "expects labels: Wi-Fi Name, Wi-Fi Password, Router IP" },
      {
        name: "fill",
        args: { label: "Wi-Fi Name", value: "Office Network" },
        pauseMs: 2000,
        note: "input should show Office Network",
      },
      {
        name: "click",
        args: { text: "Apply changes" },
        pauseMs: 2000,
        note: "look for 'Changes applied' toast",
      },
      { name: "read_state", args: {} },
    ],
  },
  "t002-b": {
    router: "router-b",
    entryPageId: "router-b/",
    entryUrl: "/router-b",
    steps: [
      { name: "identify_page", args: {} },
      { name: "list_elements", args: {} },
      {
        name: "fill",
        args: { label: "Wi-Fi Password", value: "NewStrongPass!2026" },
        pauseMs: 1500,
      },
      {
        name: "click",
        args: { text: "Apply changes" },
        pauseMs: 1500,
        note: "look for 'Changes applied' toast",
      },
      { name: "read_state", args: {} },
    ],
  },
  "t006-b": {
    router: "router-b",
    entryPageId: "router-b/",
    entryUrl: "/router-b",
    steps: [
      { name: "identify_page", args: {} },
      { name: "list_elements", args: {} },
      {
        name: "fill",
        args: { label: "Router IP", value: "192.168.5.1" },
        pauseMs: 1500,
      },
      {
        name: "click",
        args: { text: "Apply changes" },
        pauseMs: 1500,
        note: "look for 'Changes applied' toast",
      },
      { name: "read_state", args: {} },
    ],
  },

  // ── Router C ────────────────────────────────────────
  "t001-c": {
    router: "router-c",
    entryPageId: "router-c/wlan",
    entryUrl: "/router-c/wlan",
    steps: [
      { name: "identify_page", args: {} },
      { name: "list_elements", args: {}, note: "expects label: WLAN SSID" },
      {
        name: "fill",
        args: { label: "WLAN SSID", value: "Office Network" },
        pauseMs: 2000,
      },
      {
        name: "click",
        args: { text: "Commit" },
        pauseMs: 2000,
        note: "look for 'WLAN profile committed'",
      },
      { name: "read_state", args: {} },
    ],
  },
  "t002-c": {
    router: "router-c",
    entryPageId: "router-c/security",
    entryUrl: "/router-c/security",
    steps: [
      { name: "identify_page", args: {} },
      { name: "list_elements", args: {} },
      {
        name: "fill",
        args: { label: "WPA Pre-Shared Key", value: "NewStrongPass!2026" },
        pauseMs: 1500,
      },
      {
        name: "click",
        args: { text: "Commit" },
        pauseMs: 1500,
        note: "look for 'Security profile committed'",
      },
      { name: "read_state", args: {} },
    ],
  },
  "t006-c": {
    router: "router-c",
    entryPageId: "router-c/interface",
    entryUrl: "/router-c/interface",
    steps: [
      { name: "identify_page", args: {} },
      { name: "list_elements", args: {} },
      {
        name: "fill",
        args: { label: "Management Interface Address", value: "192.168.5.1" },
        pauseMs: 1500,
      },
      {
        name: "click",
        args: { text: "Commit" },
        pauseMs: 1500,
        note: "look for 'Interface configuration committed'",
      },
      { name: "read_state", args: {} },
    ],
  },
};

async function main(): Promise<void> {
  const scenarioKey = process.env.SCENARIO ?? "t001-a";
  const scenario = SCENARIOS[scenarioKey];
  if (!scenario) {
    console.error(
      `Unknown SCENARIO=${scenarioKey}. Available: ${Object.keys(SCENARIOS).join(", ")}`
    );
    process.exit(1);
  }

  const sitemap = await loadSitemap();
  const fields = await loadFields();
  mergeFields(sitemap, fields);

  await fetch(
    `http://localhost:4000/api/routers/${scenario.router}/reset`,
    { method: "POST" }
  );

  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const page = await (await browser.newContext()).newPage();
  await page.addInitScript(
    "globalThis.__name = globalThis.__name || ((fn) => fn);"
  );
  await page.goto(`http://localhost:5173${scenario.entryUrl}`);
  await page.waitForLoadState("networkidle");

  let currentPageId = scenario.entryPageId;
  const ctx: ToolContext = {
    page,
    sitemap,
    router: scenario.router,
    currentPageId: () => currentPageId,
    setCurrentPageId: (id) => { currentPageId = id; },
    apiBase: "http://localhost:4000/api",
  };

  console.log(`\n=== ${scenarioKey} (router=${scenario.router}) ===`);

  for (const step of scenario.steps) {
    console.log(`\n--- ${step.name}(${JSON.stringify(step.args)}) ---`);
    if (step.note) console.log(`    [${step.note}]`);
    const result = await executeTool(step.name, step.args, ctx);
    console.log(`${result.ok ? "ok" : "ERR"}: ${result.content}`);
    if (step.pauseMs) {
      console.log(`    (pausing ${step.pauseMs}ms — inspect browser)`);
      await page.waitForTimeout(step.pauseMs);
    }
  }

  console.log("\n(pausing 3s — final inspection)");
  await page.waitForTimeout(3000);

  await browser.close();
}

main().catch((e: unknown) => {
  console.error(e);
  process.exit(1);
});