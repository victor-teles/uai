import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT ?? 3100);
const baseURL = process.env.E2E_BASE_URL ?? `http://127.0.0.1:${PORT}`;

/**
 * Browser checks for every registry item page.
 *
 * Runs against the production build (`bun run build` first). Set E2E_BASE_URL to
 * point at an already running server, such as a Vercel preview.
 */
export default defineConfig({
  testDir: "e2e",
  testMatch: "**/*.e2e.ts",
  outputDir: "e2e-artifacts/results",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: process.env.CI
    ? [["github"], ["list"], ["html", { outputFolder: "e2e-artifacts/report", open: "never" }]]
    : [["list"], ["html", { outputFolder: "e2e-artifacts/report", open: "never" }]],
  use: { baseURL, trace: "retain-on-failure" },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 7"] },
      // These suites skip every test on mobile. Leaving them out keeps CI shards balanced.
      testIgnore: ["**/premium.e2e.ts", "**/reduced-motion.e2e.ts"],
    },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `bun run start --port ${PORT}`,
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
