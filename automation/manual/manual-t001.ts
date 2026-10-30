import { chromium } from "playwright";
import { loadSitemap, loadFields, mergeFields } from "../sitemap/index";
import { executeTool, ToolContext } from "../tools-runner";

async function main(): Promise<void> {
  const sitemap = await loadSitemap();
  const fields = await loadFields();
  mergeFields(sitemap, fields);

  // Reset first
  await fetch("http://localhost:4000/api/routers/router-a/reset", {
    method: "POST",
  });

  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const page = await (await browser.newContext()).newPage();
  await page.addInitScript(
    "globalThis.__name = globalThis.__name || ((fn) => fn);"
  );
  await page.goto("http://localhost:5173/router-a/wireless/basic");
  await page.waitForLoadState("networkidle");

  let currentPageId = "router-a/wireless/basic";
  const ctx: ToolContext = {
    page,
    sitemap,
    router: "router-a",
    currentPageId: () => currentPageId,
    setCurrentPageId: (id) => { currentPageId = id; },
    apiBase: "http://localhost:4000/api",
  };

  console.log("\n--- identify_page ---");
  console.log((await executeTool("identify_page", {}, ctx)).content);

  console.log("\n--- list_elements ---");
  console.log((await executeTool("list_elements", {}, ctx)).content);

  console.log("\n--- fill SSID ---");
  console.log(
    (await executeTool("fill", { label: "SSID", value: "Office Network" }, ctx))
      .content
  );

  // Pause so you can see the input value in the browser
  console.log("\n(pausing 2s — look at the SSID input)");
  await page.waitForTimeout(2000);

  console.log("\n--- click Save ---");
  console.log((await executeTool("click", { text: "Save" }, ctx)).content);

  // Pause so you can see the save banner
  console.log("\n(pausing 2s — look for 'Settings saved')");
  await page.waitForTimeout(2000);

  console.log("\n--- read_state ---");
  console.log((await executeTool("read_state", {}, ctx)).content);

  console.log("\n(pausing 3s — inspect final page state)");
  await page.waitForTimeout(3000);

  await browser.close();
}

main().catch((e: unknown) => {
  console.error(e);
  process.exit(1);
});