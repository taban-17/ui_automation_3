import { test, expect } from "@playwright/test";
import { runUIScenario, UIScenario } from "../helpers/scenario";
import { resetRouter } from "../helpers/router-api";

const FRONTEND = "http://localhost:5173";
const ROUTER = "router-a";

test.describe("UI scenarios — router-a", () => {
  test("T001 — change Wi-Fi name to Office Network", async ({
    page,
    request,
  }) => {
    const scenario: UIScenario = {
      router: ROUTER,
      instruction: "change Wi-Fi name to Office Network",
      drive: async (page) => {
        await page.goto(`${FRONTEND}/router-a/wireless/basic`);

        const ssid = page.getByLabel("SSID");
        await expect(ssid).not.toHaveValue("");

        await ssid.fill("Office Network");
        await page.getByRole("button", { name: "Save" }).click();

        await expect(page.getByText("Settings saved")).toBeVisible();
      },
      expected: (state) => {
        expect(state.wireless.ssid).toBe("Office Network");
        // Guard: password must be untouched by an SSID-only edit
        expect(state.wireless.password).toBe("example-password");
      },
    };

    await runUIScenario(page, request, scenario);
  });

  test("T002 — change wireless password", async ({ page, request }) => {
    const scenario: UIScenario = {
      router: ROUTER,
      instruction: "change wireless password",
      drive: async (page) => {
        await page.goto(`${FRONTEND}/router-a/wireless/security`);

        const psk = page.getByLabel("Pre-Shared Key");
        await expect(psk).not.toHaveValue("");

        await psk.fill("NewStrongPass!2026");
        await page.getByRole("button", { name: "Save" }).click();

        await expect(page.getByText("Security settings saved")).toBeVisible();
      },
      expected: (state) => {
        expect(state.wireless.password).toBe("NewStrongPass!2026");
        // Guard: SSID must be untouched by a password-only edit
        expect(state.wireless.ssid).toBe("Home Network");
      },
    };

    await runUIScenario(page, request, scenario);
  });

  test("T006 — change router IP", async ({ page, request }) => {
    const scenario: UIScenario = {
      router: ROUTER,
      instruction: "change router IP to 192.168.5.1",
      drive: async (page) => {
        await page.goto(`${FRONTEND}/router-a/lan`);

        const ip = page.getByLabel("LAN IP Address");
        await expect(ip).not.toHaveValue("");

        await ip.fill("192.168.5.1");
        await page.getByRole("button", { name: "Save" }).click();

        await expect(page.getByText("LAN settings saved")).toBeVisible();
      },
      expected: (state) => {
        expect(state.lan.ipAddress).toBe("192.168.5.1");
        // Guard: wireless fields must be untouched by a LAN-only edit
        expect(state.wireless.ssid).toBe("Home Network");
        expect(state.wireless.password).toBe("example-password");
      },
    };

    await runUIScenario(page, request, scenario);
  });

  test("T009 — view connected devices", async ({ page, request }) => {
    await resetRouter(request, "router-c");
    await page.goto(`${FRONTEND}/router-c/clients`);

    // At tick 0, two devices should be present
    await expect(page.getByText("Eugene-Laptop")).toBeVisible();
    await expect(page.getByText("LivingRoom-TV")).toBeVisible();
    await expect(page.getByText("Kitchen-Speaker")).not.toBeVisible();

    // Advance 2 ticks via API
    await request.post("http://localhost:4000/api/routers/router-c/tick", {
      data: { increment: 2 },
    });
    await page.getByRole("button", { name: "Refresh" }).click();

    // Kitchen-Speaker now visible
    await expect(page.getByText("Kitchen-Speaker")).toBeVisible();
  });
});