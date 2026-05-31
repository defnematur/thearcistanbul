import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  // Use a Turkish browser locale so detection routes a default visitor to /tr
  // (the documented default). next-intl honors Accept-Language on first visit,
  // so without this the headless browser's en-US would land on /en.
  use: {
    baseURL: "http://localhost:3000",
    locale: "tr-TR",
  },
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
