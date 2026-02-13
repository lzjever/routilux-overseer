import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E Test Configuration
 *
 * Architecture:
 * - Single worker execution to avoid port conflicts with routilux server
 * - Global fixture manages server lifecycle
 * - Tests run sequentially for isolation
 * - Visual regression tests with snapshot comparison
 */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: false, // Sequential execution for server management
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker to manage routilux server

  // Reporter configuration
  reporter: [
    ["html", { outputFolder: "playwright-report" }],
    ["list"],
    ["json", { outputFile: "test-results/results.json" }],
  ],

  use: {
    // Base URL for the routilux-overseer app
    baseURL: process.env.OVERSEER_BASE_URL || "http://localhost:3000",

    // Collect trace on failure for debugging
    trace: "on-first-retry",

    // Capture screenshots on failure
    screenshot: "only-on-failure",

    // Record video on failure
    video: "retain-on-failure",

    // Action timeout for slower operations
    actionTimeout: 10000,

    // Navigation timeout
    navigationTimeout: 30000,

    // Visual regression settings
    viewport: { width: 1280, height: 720 },
  },

  // Snapshot settings for visual regression tests
  snapshotDir: "./snapshots",
  snapshotPathTemplate: "{snapshotDir}/{testFilePath}/{arg}{ext}",

  // Test projects
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    // Uncomment for cross-browser testing
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  // Global setup and teardown
  globalSetup: "./fixtures/global-setup.ts",
  globalTeardown: "./fixtures/global-teardown.ts",

  // Expect configuration
  expect: {
    // Screenshot comparison settings
    toHaveScreenshot: {
      maxDiffPixels: 1000,
      maxDiffPixelRatio: 0.01,
      threshold: 0.2,
      animations: "allow",
    },
    // Timeout for assertions
    timeout: 10000,
  },
});
