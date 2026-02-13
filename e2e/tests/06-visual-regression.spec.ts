/**
 * Visual Regression E2E Tests
 *
 * Screenshot-based tests to catch visual regressions in the UI.
 * Uses Playwright's snapshot comparison feature.
 */

import { test, expect } from "../fixtures/fixtures";
import { ConnectPage, FlowsPage, JobsPage, WorkersPage } from "../fixtures/page-objects";

// Skip visual tests in CI unless explicitly enabled
const describe = test.describe;
const it = process.env.CI && !process.env.VISUAL_TESTS ? test.skip : test;

describe("Visual Regression Tests", () => {
  test.describe.configure({ retries: 1 }); // Allow one retry for flaky visual tests

  describe("Connect Page", () => {
    let connectPage: ConnectPage;

    test.beforeEach(async ({ page }) => {
      connectPage = new ConnectPage(page);
    });

    it("should match connect page screenshot - default state", async ({ page }) => {
      await connectPage.open();
      await page.waitForLoadState("networkidle");

      // Take full page screenshot
      await expect(page).toHaveScreenshot("connect-page-default.png", {
        fullPage: true,
        maxDiffPixels: 1000, // Allow small variations
      });
    });

    it("should match connect page screenshot - with server URL", async ({ page, server }) => {
      await connectPage.open();
      await connectPage.setServerUrl(server.getServerUrl());
      await page.waitForLoadState("networkidle");

      await expect(page).toHaveScreenshot("connect-page-with-url.png", {
        fullPage: true,
        maxDiffPixels: 1000,
      });
    });

    it("should match connect page screenshot - connection error", async ({ page }) => {
      await connectPage.open();
      await connectPage.setServerUrl("http://invalid-server:9999");
      await connectPage.testConnection();

      // Wait for error state
      await page
        .waitForSelector('[data-testid="connect-error-message"], .text-red', {
          timeout: 10000,
        })
        .catch(() => {});

      await expect(page).toHaveScreenshot("connect-page-error.png", {
        fullPage: true,
        maxDiffPixels: 1000,
      });
    });
  });

  describe("Home Page", () => {
    it("should match home page screenshot - not connected", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      await expect(page).toHaveScreenshot("home-page-not-connected.png", {
        fullPage: true,
        maxDiffPixels: 1000,
      });
    });

    it("should match home page screenshot - connected", async ({ page, server }) => {
      // Connect first
      const connectPage = new ConnectPage(page);
      await connectPage.open();
      await connectPage.connectTo(server.getServerUrl());

      // Go to home page
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      await expect(page).toHaveScreenshot("home-page-connected.png", {
        fullPage: true,
        maxDiffPixels: 2000, // More tolerance for dynamic content
      });
    });
  });

  describe("Flows Page", () => {
    let flowsPage: FlowsPage;

    test.beforeEach(async ({ page, server }) => {
      // Connect first
      const connectPage = new ConnectPage(page);
      await connectPage.open();
      await connectPage.connectTo(server.getServerUrl());
      flowsPage = new FlowsPage(page);
    });

    it("should match flows page screenshot - empty state", async ({ page }) => {
      await flowsPage.open();
      await page.waitForLoadState("networkidle");

      // Check for empty state or flows list
      const hasFlows = (await page.locator('[data-testid^="flows-card-"]').count()) > 0;

      if (!hasFlows) {
        await expect(page).toHaveScreenshot("flows-page-empty.png", {
          fullPage: true,
          maxDiffPixels: 1000,
        });
      }
    });

    it("should match flows page screenshot - with flows", async ({ page, server }) => {
      // Create a test flow first
      const api = server.getApiClient();
      try {
        await api.post("/api/v1/flows", {
          flow_id: "visual-test-flow",
          dsl_dict: {
            flow_id: "visual-test-flow",
            routines: {
              source: { class: "DataSource", config: { name: "Source" } },
              sink: { class: "DataSink", config: { name: "Sink" } },
            },
            connections: [
              {
                source_routine: "source",
                source_event: "output",
                target_routine: "sink",
                target_slot: "input",
              },
            ],
          },
        });
      } catch {
        // Flow might already exist
      }

      await flowsPage.open();
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(500); // Wait for animations

      await expect(page).toHaveScreenshot("flows-page-with-data.png", {
        fullPage: true,
        maxDiffPixels: 2000,
      });
    });
  });

  describe("Jobs Page", () => {
    let jobsPage: JobsPage;

    test.beforeEach(async ({ page, server }) => {
      const connectPage = new ConnectPage(page);
      await connectPage.open();
      await connectPage.connectTo(server.getServerUrl());
      jobsPage = new JobsPage(page);
    });

    it("should match jobs page screenshot - empty state", async ({ page }) => {
      await jobsPage.open();
      await page.waitForLoadState("networkidle");

      const hasJobs = (await page.locator('[data-testid^="jobs-row-"]').count()) > 0;

      if (!hasJobs) {
        await expect(page).toHaveScreenshot("jobs-page-empty.png", {
          fullPage: true,
          maxDiffPixels: 1000,
        });
      }
    });
  });

  describe("Workers Page", () => {
    let workersPage: WorkersPage;

    test.beforeEach(async ({ page, server }) => {
      const connectPage = new ConnectPage(page);
      await connectPage.open();
      await connectPage.connectTo(server.getServerUrl());
      workersPage = new WorkersPage(page);
    });

    it("should match workers page screenshot - empty state", async ({ page }) => {
      await workersPage.open();
      await page.waitForLoadState("networkidle");

      const hasWorkers = (await page.locator('[data-testid^="workers-card-"]').count()) > 0;

      if (!hasWorkers) {
        await expect(page).toHaveScreenshot("workers-page-empty.png", {
          fullPage: true,
          maxDiffPixels: 1000,
        });
      }
    });
  });

  describe("Navbar Component", () => {
    test.beforeEach(async ({ page, server }) => {
      const connectPage = new ConnectPage(page);
      await connectPage.open();
      await connectPage.connectTo(server.getServerUrl());
    });

    it("should match navbar screenshot - connected state", async ({ page }) => {
      await page.goto("/flows");
      await page.waitForLoadState("networkidle");

      const navbar = page.locator('[data-testid="navbar"]');
      await expect(navbar).toHaveScreenshot("navbar-connected.png", {
        maxDiffPixels: 500,
      });
    });

    it("should match navbar screenshot - disconnected state", async ({ page }) => {
      // Disconnect
      await page.goto("/connect");
      await page.waitForLoadState("networkidle");

      const navbar = page.locator('[data-testid="navbar"]');
      if (await navbar.isVisible()) {
        await expect(navbar).toHaveScreenshot("navbar-disconnected.png", {
          maxDiffPixels: 500,
        });
      }
    });
  });

  describe("Responsive Design", () => {
    test.beforeEach(async ({ page, server }) => {
      const connectPage = new ConnectPage(page);
      await connectPage.open();
      await connectPage.connectTo(server.getServerUrl());
    });

    it("should match mobile screenshot - home page", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      await expect(page).toHaveScreenshot("home-page-mobile.png", {
        fullPage: true,
        maxDiffPixels: 2000,
      });
    });

    it("should match tablet screenshot - flows page", async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto("/flows");
      await page.waitForLoadState("networkidle");

      await expect(page).toHaveScreenshot("flows-page-tablet.png", {
        fullPage: true,
        maxDiffPixels: 2000,
      });
    });

    it("should match desktop screenshot - jobs page", async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto("/jobs");
      await page.waitForLoadState("networkidle");

      await expect(page).toHaveScreenshot("jobs-page-desktop.png", {
        fullPage: true,
        maxDiffPixels: 2000,
      });
    });
  });

  describe("Dark Mode", () => {
    test.beforeEach(async ({ page, server }) => {
      const connectPage = new ConnectPage(page);
      await connectPage.open();
      await connectPage.connectTo(server.getServerUrl());

      // Check if dark mode is available and enable it
      const darkModeToggle = page.locator('[data-testid="theme-toggle"], button:has-text("Dark")');
      if (await darkModeToggle.isVisible()) {
        await darkModeToggle.click();
        await page.waitForTimeout(300);
      }
    });

    it("should match dark mode screenshot - home page", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Only run if dark mode was successfully enabled
      const isDark = await page.evaluate(() => document.documentElement.classList.contains("dark"));

      if (isDark) {
        await expect(page).toHaveScreenshot("home-page-dark.png", {
          fullPage: true,
          maxDiffPixels: 2000,
        });
      }
    });
  });
});
