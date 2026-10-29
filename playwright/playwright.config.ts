import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:4000",
  },
  webServer: [
    {
      command: "npm run dev",
      cwd: "../router_ui_server",
      url: "http://localhost:4000/api/routers",
      reuseExistingServer: !process.env.CI,
      timeout: 20_000,
    },
    {
      command: "npm run dev",
      cwd: "../frontend",
      url: "http://localhost:5173",
      reuseExistingServer: !process.env.CI,
      timeout: 20_000,
    },
  ],
});