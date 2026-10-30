import { chromium, Browser, Page } from "playwright";
import { capturePage, slugToPageId } from "./capture";
import type { Sitemap, RouterSitemap, PageMap } from "./schema";

interface CrawlOptions {
  baseUrl: string;          // e.g. "http://localhost:5173"
  routers: string[];        // e.g. ["router-a", "router-b", "router-c"]
  entryPaths: Record<string, string>; // e.g. { "router-a": "/router-a", ... }
  maxPages?: number;        // safety cap, default 50
}

export async function crawlAll(opts: CrawlOptions): Promise<Sitemap> {
  const browser = await chromium.launch();
  try {
    const routers: Record<string, RouterSitemap> = {};
    for (const router of opts.routers) {
      const entryPath = opts.entryPaths[router];
      routers[router] = await crawlRouter(browser, opts.baseUrl, router, entryPath, opts.maxPages ?? 50);
      console.log(
        `  ${router}: ${routers[router].pages.length} pages`
      );
    }
    return {
      version: "1",
      generatedAt: new Date().toISOString(),
      baseUrl: opts.baseUrl,
      routers,
    };
  } finally {
    await browser.close();
  }
}

async function crawlRouter(
  browser: Browser,
  baseUrl: string,
  router: string,
  entryPath: string,
  maxPages: number
): Promise<RouterSitemap> {
  const context = await browser.newContext();
  const page = await context.newPage();
  // crawl.ts — inside crawlRouter, after context.newPage()
  await page.addInitScript(
    "globalThis.__name = globalThis.__name || ((fn) => fn);"
  );

  const visited = new Set<string>();
  const pages: PageMap[] = [];
  const queue: string[] = [entryPath];
  const entryPageId = slugToPageId(router, entryPath);

  while (queue.length > 0 && pages.length < maxPages) {
    const urlPath = queue.shift()!;
    const pageId = slugToPageId(router, urlPath);
    if (visited.has(pageId)) continue;
    visited.add(pageId);

    try {
      await page.goto(`${baseUrl}${urlPath}`, {
        waitUntil: "networkidle",
        timeout: 10_000,
      });
      // Wait for the app to finish loading state (fetch + render)
      await page.waitForLoadState("networkidle").catch(() => {});
      // Give React one tick to render after data arrives
      await page.waitForTimeout(100);

      const map = await capturePage(page, router, pageId);
      pages.push(map);
      console.log(`    captured: ${pageId} (${map.elements.length} elements)`);

      for (const nav of map.navigation) {
        const targetId = slugToPageId(router, nav.targetUrl);
        if (!visited.has(targetId)) queue.push(nav.targetUrl);
      }
    } catch (e) {
      console.warn(`    failed: ${pageId} — ${(e as Error).message}`);
    }
  }

  await context.close();

  return {
    router,
    entryPageId,
    entryUrl: entryPath,
    pages,
  };
}