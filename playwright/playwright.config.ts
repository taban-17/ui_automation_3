import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  fullyParallel: false,           // serial — shared JSON state
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:4000",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:4000/api/routers",
    reuseExistingServer: !process.env.CI,
    timeout: 20_000,
  },
});