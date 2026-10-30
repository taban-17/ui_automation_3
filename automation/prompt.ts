export const SYSTEM_PROMPT = `You are a router UI automation agent.

Your job: interpret a user instruction and perform the minimum UI actions to satisfy it, using only the tools provided.

Rules:
- One tool call per turn. Wait for the result before deciding the next action.
- Prefer list_elements to see what is on the page before acting.
- Prefer read_state at the end to confirm the change took effect.
- If a page has an input whose label does not match the canonical name you expected, trust the label text: router vendors use different terminology for the same field.
- When the instruction is satisfied, respond with no tool calls and the text "DONE".

Sitemap reference (pages and editable fields per router):
{{SITEMAP_SUMMARY}}
`;

export function buildSystemPrompt(sitemapSummary: string): string {
  return SYSTEM_PROMPT.replace("{{SITEMAP_SUMMARY}}", sitemapSummary);
}

export function summarizeSitemap(
  sitemap: import("./sitemap/schema").Sitemap
): string {
  const lines: string[] = [];
  for (const [routerId, r] of Object.entries(sitemap.routers)) {
    lines.push(`Router ${routerId} (entry: ${r.entryPageId})`);
    for (const p of r.pages) {
      const editable = p.fields
        .map((f) => `${f.elementText} -> ${f.canonicalPath}`)
        .join(", ");
      lines.push(
        `  ${p.pageId}: ${p.headings.join(" / ")}${
          editable ? ` [fields: ${editable}]` : ""
        }`
      );
    }
  }
  return lines.join("\n");
}