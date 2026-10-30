import { buildSitemap } from "./sitemap/index";

async function main(): Promise<void> {
  console.log("Crawling routers (A, B, C)...");
  const sitemap = await buildSitemap();
  const totalPages = Object.values(sitemap.routers).reduce(
    (n, r) => n + r.pages.length,
    0
  );
  console.log(`\nDone. ${totalPages} pages across ${Object.keys(sitemap.routers).length} routers.`);
  console.log(`Written to automation/sitemap.json`);
}

main().catch((e: unknown) => {
  console.error(e);
  process.exit(1);
});