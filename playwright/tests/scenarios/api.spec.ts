import { test, expect } from "@playwright/test";
import {
  ROUTERS,
  resetRouter,
  getState,
  patchState,
  getHistory,
} from "../helpers/router-api";

for (const router of ROUTERS) {
  test.describe(`API state scenarios — ${router}`, () => {
    test.beforeEach(async ({ request }) => {
      await resetRouter(request, router);
    });

    test("T001 — change Wi-Fi name to Office Network", async ({ request }) => {
      await patchState(request, router, { wireless: { ssid: "Office Network" } });
      const state = await getState(request, router);
      expect(state.wireless.ssid).toBe("Office Network");
    });

    test("T002 — change wireless password", async ({ request }) => {
      const newPassword = "NewStrongPass!2026";
      await patchState(request, router, { wireless: { password: newPassword } });
      const state = await getState(request, router);
      expect(state.wireless.password).toBe(newPassword);
    });

    test("T003 — turn off Wi-Fi", async ({ request }) => {
      await patchState(request, router, { wireless: { enabled: false } });
      const state = await getState(request, router);
      expect(state.wireless.enabled).toBe(false);
    });

    test("T004 — hide network name (broadcast off)", async ({ request }) => {
      await patchState(request, router, { wireless: { broadcast: false } });
      const state = await getState(request, router);
      expect(state.wireless.broadcast).toBe(false);
    });

    test("T005 — enable guest Wi-Fi", async ({ request }) => {
      await patchState(request, router, { guestNetwork: { enabled: true } });
      const state = await getState(request, router);
      expect(state.guestNetwork.enabled).toBe(true);
    });

    test("T006 — change LAN IP to 192.168.10.1", async ({ request }) => {
      await patchState(request, router, { lan: { ipAddress: "192.168.10.1" } });
      const state = await getState(request, router);
      expect(state.lan.ipAddress).toBe("192.168.10.1");
    });

    test("T007 — enable DHCP (already on; toggle then re-enable to prove patchability)", async ({
      request,
    }) => {
      // Seed has dhcp.enabled = true, so disable first to prove the update path,
      // then re-enable and assert. Exercises both directions of a boolean.
      await patchState(request, router, { lan: { dhcp: { enabled: false } } });
      let state = await getState(request, router);
      expect(state.lan.dhcp.enabled).toBe(false);

      await patchState(request, router, { lan: { dhcp: { enabled: true } } });
      state = await getState(request, router);
      expect(state.lan.dhcp.enabled).toBe(true);
    });

    test("T008 — change 2.4 GHz channel to 6", async ({ request }) => {
      await patchState(request, router, {
        wireless: { bands: { "2.4GHz": { channel: "6" } } },
      });
      const state = await getState(request, router);
      expect(state.wireless.bands["2.4GHz"].channel).toBe("6");
      // 5 GHz untouched
      expect(state.wireless.bands["5GHz"].channel).toBe("auto");
    });

    test("history records each update in order", async ({ request }) => {
      await patchState(request, router, { wireless: { ssid: "First" } });
      await patchState(request, router, { wireless: { ssid: "Second" } });
      const entries = await getHistory(request, router);
      // beforeEach reset produced one entry, then two updates
      expect(entries.length).toBeGreaterThanOrEqual(3);
      const updates = entries.filter((e) => e.action === "update");
      expect(updates.at(-2)?.patch).toEqual({ wireless: { ssid: "First" } });
      expect(updates.at(-1)?.patch).toEqual({ wireless: { ssid: "Second" } });
    });
  });
}