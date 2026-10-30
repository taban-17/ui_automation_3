import fs from "fs/promises";
import path from "path";
import { crawlAll } from "./crawl";
import type { Sitemap, RouterSitemap, PageMap } from "./schema";

export type { Sitemap, RouterSitemap, PageMap };

const SITEMAP_PATH = path.join(process.cwd(), "sitemap.generated.json");

export async function buildSitemap(): Promise<Sitemap> {
  const sitemap = await crawlAll({
    baseUrl: "http://localhost:5173",
    routers: ["router-a", "router-b", "router-c"],
    entryPaths: {
      "router-a": "/router-a/wireless/basic",
      "router-b": "/router-b",
      "router-c": "/router-c/wlan",
    },
  });
  await fs.writeFile(SITEMAP_PATH, JSON.stringify(sitemap, null, 2), "utf-8");
  return sitemap;
}

export async function loadSitemap(): Promise<Sitemap> {
  const raw = await fs.readFile(SITEMAP_PATH, "utf-8");
  return JSON.parse(raw) as Sitemap;
}

export function findPage(
  sitemap: Sitemap,
  router: string,
  pageId: string
): PageMap | undefined {
  return sitemap.routers[router]?.pages.find((p) => p.pageId === pageId);
}

export interface FieldsAnnotation {
  [pageId: string]: { [elementText: string]: string };
}

const FIELDS_PATH = path.join(process.cwd(), "sitemap", "fields.json");

export async function loadFields(): Promise<FieldsAnnotation> {
  const raw = await fs.readFile(FIELDS_PATH, "utf-8");
  return JSON.parse(raw) as FieldsAnnotation;
}

export function mergeFields(
  sitemap: Sitemap,
  fields: FieldsAnnotation
): Sitemap {
  for (const router of Object.values(sitemap.routers)) {
    for (const page of router.pages) {
      const mapping = fields[page.pageId];
      if (!mapping) continue;
      page.fields = Object.entries(mapping).map(([elementText, canonicalPath]) => ({
        elementText,
        canonicalPath,
      }));
    }
  }
  return sitemap;
}