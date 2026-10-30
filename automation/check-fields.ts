import { loadSitemap, loadFields, mergeFields } from "./sitemap/index";

async function main(): Promise<void> {
  const sitemap = await loadSitemap();
  const fields = await loadFields();
  mergeFields(sitemap, fields);

  let ok = 0;
  let missing = 0;

  for (const [, router] of Object.entries(sitemap.routers)) {
    for (const page of router.pages) {
      if (page.fields.length === 0) continue;
      for (const fm of page.fields) {
        const found =
          page.elements.find(
            (e) => e.kind === "input" && e.text === fm.elementText
          ) ?? page.elements.find((e) => e.text === fm.elementText);

        if (!found) {
          console.error(
            `MISSING  ${page.pageId}  ->  ${fm.elementText}`
          );
          missing++;
        } else {
          console.log(
            `OK       ${page.pageId}  ->  ${fm.elementText}  =  ${fm.canonicalPath}`
          );
          ok++;
        }
      }
    }
  }

  console.log(`\n${ok} ok, ${missing} missing`);
  if (missing > 0) process.exit(1);
}

main().catch((e: unknown) => {
  console.error(e);
  process.exit(1);
});