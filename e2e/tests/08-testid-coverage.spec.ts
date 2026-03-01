/**
 * TestID Coverage E2E Tests
 *
 * Asserts that all standard data-testid elements exist and are reachable.
 * See docs/TESTID_CONTRACT.md and e2e/README.md for the testid standard.
 *
 * Requires: Overseer app running (e.g. npm run dev on port 3000).
 * Optional: ROUTILUX_WORKSPACE for tests that connect to routilux.
 */

import { test, expect } from "../fixtures/fixtures";
import { ConnectPage, FlowsPage, JobsPage, WorkersPage } from "../fixtures/page-objects";

test.describe("TestID coverage", () => {
  test.describe("Connect page", () => {
    test("should have all connect testids", async ({ page }) => {
      const connectPage = new ConnectPage(page);
      await connectPage.open();

      await expect(page.locator('[data-testid="connect-page"]')).toBeVisible();
      await expect(page.locator('[data-testid="connect-card"]')).toBeVisible();
      await expect(page.locator('[data-testid="connect-form"]')).toBeVisible();
      await expect(page.locator('[data-testid="connect-input-server-url"]')).toBeVisible();
      await expect(page.locator('[data-testid="connect-input-api-key"]')).toBeVisible();
      await expect(page.locator('[data-testid="connect-button-submit"]')).toBeVisible();
    });
  });

  test.describe("Home page (after connect)", () => {
    test.beforeEach(async ({ page, server }) => {
      const connectPage = new ConnectPage(page);
      await connectPage.open();
      await connectPage.setServerUrl(server.getServerUrl());
      await connectPage.testConnection();
      await page.waitForURL(/\/(?!connect)/, { timeout: 15000 });
      await page.waitForLoadState("domcontentloaded");
    });

    test("should have home page testids when connected", async ({ page }) => {
      await expect(page.locator('[data-testid="home-page"]')).toBeVisible({ timeout: 10000 });
      // Wait for home content to settle: either connected view or not-connected card
      const homeContent = page.locator(
        '[data-testid="home-badge-connected"], [data-testid="home-card-not-connected"]'
      );
      await expect(homeContent).toBeVisible({ timeout: 20000 });
      // Assert at least one is present (stable after load)
      await expect(homeContent.first()).toBeVisible();
    });

    test("should have nav testids", async ({ page }) => {
      await expect(page.locator('[data-testid="navbar"]')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('[data-testid="nav-link-home"]')).toBeVisible();
      await expect(page.locator('[data-testid="nav-links"]')).toBeVisible();
    });
  });

  test.describe("Flows page", () => {
    test.beforeEach(async ({ page, server }) => {
      const connectPage = new ConnectPage(page);
      await connectPage.open();
      await connectPage.setServerUrl(server.getServerUrl());
      await connectPage.testConnection();
      await page.waitForURL(/\/(?!connect)/, { timeout: 15000 });
      await page.waitForLoadState("domcontentloaded");
    });

    test("should have flows page testids", async ({ page }) => {
      await page.goto("/flows", { waitUntil: "domcontentloaded" });
      await page.waitForSelector('[data-testid="flows-page"]', { state: "visible", timeout: 10000 });

      await expect(page.locator('[data-testid="flows-page"]')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('[data-testid="flows-button-refresh"]')).toBeVisible();
      await expect(page.locator('[data-testid="flows-button-sync"]')).toBeVisible();
      // One of: list, empty state, loading, or not-connected
      const list = page.locator('[data-testid="flows-list"]');
      const empty = page.locator('[data-testid="flows-empty-state"]');
      const loading = page.locator('[data-testid="flows-loading"]');
      const notConnected = page.locator('[data-testid="flows-not-connected"]');
      await expect(list.or(empty).or(loading).or(notConnected)).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe("Jobs page", () => {
    test.beforeEach(async ({ page, server }) => {
      const connectPage = new ConnectPage(page);
      await connectPage.open();
      await connectPage.setServerUrl(server.getServerUrl());
      await connectPage.testConnection();
      await page.waitForURL(/\/(?!connect)/, { timeout: 15000 });
      await page.waitForLoadState("domcontentloaded");
    });

    test("should have jobs page testids", async ({ page }) => {
      await page.goto("/jobs", { waitUntil: "domcontentloaded" });
      await page.waitForSelector('[data-testid="jobs-page"]', { state: "visible", timeout: 10000 });

      await expect(page.locator('[data-testid="jobs-page"]')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('[data-testid="jobs-button-refresh"]')).toBeVisible();
      await expect(page.locator('[data-testid="jobs-select-status-filter"]')).toBeVisible();
      const list = page.locator('[data-testid="jobs-list"]');
      const empty = page.locator('[data-testid="jobs-empty-state"]');
      const loading = page.locator('[data-testid="jobs-loading"]');
      const notConnected = page.locator('[data-testid="jobs-not-connected"]');
      await expect(list.or(empty).or(loading).or(notConnected)).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe("Workers page", () => {
    test.beforeEach(async ({ page, server }) => {
      const connectPage = new ConnectPage(page);
      await connectPage.open();
      await connectPage.setServerUrl(server.getServerUrl());
      await connectPage.testConnection();
      await page.waitForURL(/\/(?!connect)/, { timeout: 15000 });
      await page.waitForLoadState("domcontentloaded");
    });

    test("should have workers page testids", async ({ page }) => {
      await page.goto("/workers", { waitUntil: "domcontentloaded" });
      await page.waitForSelector('[data-testid="workers-page"]', { state: "visible", timeout: 10000 });

      await expect(page.locator('[data-testid="workers-page"]')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('[data-testid="workers-button-refresh"]')).toBeVisible();
      const list = page.locator('[data-testid="workers-list"]');
      const empty = page.locator('[data-testid="workers-empty-state"]');
      const loading = page.locator('[data-testid="workers-loading"]');
      await expect(list.or(empty).or(loading)).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe("Navigation by testid", () => {
    test.beforeEach(async ({ page, server }) => {
      const connectPage = new ConnectPage(page);
      await connectPage.open();
      await connectPage.setServerUrl(server.getServerUrl());
      await connectPage.testConnection();
      await page.waitForURL(/\/(?!connect)/, { timeout: 15000 });
      await page.waitForLoadState("domcontentloaded");
    });

    test("should navigate via nav links", async ({ page }) => {
      await expect(page.locator('[data-testid="home-page"]')).toBeVisible({ timeout: 10000 });

      await page.locator('[data-testid="nav-link-flows"]').click();
      await expect(page).toHaveURL(/\/flows/);
      await expect(page.locator('[data-testid="flows-page"]')).toBeVisible({ timeout: 3000 });

      await page.locator('[data-testid="nav-link-jobs"]').click();
      await expect(page).toHaveURL(/\/jobs/);
      await expect(page.locator('[data-testid="jobs-page"]')).toBeVisible({ timeout: 3000 });

      await page.locator('[data-testid="nav-link-workers"]').click();
      await expect(page).toHaveURL(/\/workers/);
      await expect(page.locator('[data-testid="workers-page"]')).toBeVisible({ timeout: 3000 });

      await page.locator('[data-testid="nav-link-home"]').click();
      await expect(page).toHaveURL(/\/($|\?)/);
      await expect(page.locator('[data-testid="home-page"]')).toBeVisible({ timeout: 3000 });
    });
  });
});
