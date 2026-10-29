import { test, expect } from "@playwright/test";
import { runUIScenario, UIScenario } from "../helpers/scenario";

const FRONTEND = "http://localhost:5173";
const ROUTER = "router-b";

test.describe("UI scenarios — router-b", () => {
  test("T001 — change Wi-Fi name to Office Network", async ({
    page,
    request,
  }) => {
    const scenario: UIScenario = {
      router: ROUTER,
      instruction: "change Wi-Fi name to Office Network",
      drive: async (page) => {
        await page.goto(`${FRONTEND}/router-b`);

        const nameInput = page.getByLabel("Wi-Fi Name");
        await expect(nameInput).not.toHaveValue("");

        await nameInput.fill("Office Network");
        await page.getByRole("button", { name: "Apply changes" }).click();

        await expect(page.getByText("Changes applied")).toBeVisible();
      },
      expected: (state) => {
        expect(state.wireless.ssid).toBe("Office Network");
      },
    };

    await runUIScenario(page, request, scenario);
  });

  test("T002 — change wireless password", async ({ page, request }) => {
    const scenario: UIScenario = {
      router: ROUTER,
      instruction: "change wireless password",
      drive: async (page) => {
        await page.goto(`${FRONTEND}/router-b`);

        const pwInput = page.getByLabel("Wi-Fi Password");
        await expect(pwInput).not.toHaveValue("");

        await pwInput.fill("NewStrongPass!2026");
        await page.getByRole("button", { name: "Apply changes" }).click();

        await expect(page.getByText("Changes applied")).toBeVisible();
      },
      expected: (state) => {
        expect(state.wireless.password).toBe("NewStrongPass!2026");
      },
    };

    await runUIScenario(page, request, scenario);
  });

  test("T006 — change router IP", async ({ page, request }) => {
    const scenario: UIScenario = {
      router: ROUTER,
      instruction: "change router IP to 192.168.5.1",
      drive: async (page) => {
        await page.goto(`${FRONTEND}/router-b`);

        const ipInput = page.getByLabel("Router IP");
        await expect(ipInput).not.toHaveValue("");

        await ipInput.fill("192.168.5.1");
        await page.getByRole("button", { name: "Apply changes" }).click();

        await expect(page.getByText("Changes applied")).toBeVisible();
      },
      expected: (state) => {
        expect(state.lan.ipAddress).toBe("192.168.5.1");
      },
    };

    await runUIScenario(page, request, scenario);
  });
});