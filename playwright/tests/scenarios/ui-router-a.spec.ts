import { test, expect } from "@playwright/test";
import { runUIScenario, UIScenario } from "../helpers/scenario";

const FRONTEND = "http://localhost:5173";

test.describe("UI scenarios — router-a", () => {
  test("T001 — change Wi-Fi name to Office Network", async ({
    page,
    request,
  }) => {
    const scenario: UIScenario = {
      router: "router-a",
      instruction: "change Wi-Fi name to Office Network",
      drive: async (page) => {
        await page.goto(`${FRONTEND}/router-a/wireless/basic`);

        // Wait for state to load — SSID field populated
        const ssid = page.getByLabel("SSID");
        await expect(ssid).not.toHaveValue("");

        await ssid.fill("Office Network");
        await page.getByRole("button", { name: "Save" }).click();

        // Banner confirms the PATCH completed
        await expect(page.getByText("Settings saved")).toBeVisible();
      },
      expected: (state) => {
        expect(state.wireless.ssid).toBe("Office Network");
      },
    };

    await runUIScenario(page, request, scenario);
  });
});