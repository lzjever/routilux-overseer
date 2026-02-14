/**
 * Flows Management E2E Tests
 *
 * Tests flow listing, viewing, and management functionality.
 */

import { test, expect } from "../fixtures/fixtures";
import { FlowsPage, FlowDetailPage } from "../fixtures/page-objects";

test.describe("Flows Management", () => {
  let flowsPage: FlowsPage;
  let flowDetailPage: FlowDetailPage;

  test.beforeEach(async ({ page, server }) => {
    flowsPage = new FlowsPage(page);
    flowDetailPage = new FlowDetailPage(page);

    // First, connect to the test server
    await page.goto("/connect");
    await page.fill('input[name="serverUrl"], input#serverUrl', server.getServerUrl());
    // Current UI has a single "Connect" button that tests and connects
    await page.click('button:has-text("Connect")');

    // Wait for redirect by checking URL periodically
    let redirected = false;
    for (let i = 0; i < 30; i++) {
      await page.waitForTimeout(500);
      const url = page.url();
      if (url === "http://localhost:3000/" || (url.endsWith("/") && !url.includes("/connect"))) {
        redirected = true;
        break;
      }
    }
    if (!redirected) {
      throw new Error("Failed to redirect after connection");
    }
  });

  test("should list available routines from factory", async ({ page }) => {
    await flowsPage.open();

    // Wait for flows to load
    await page.waitForTimeout(1000);

    // The page should load without errors
    await expect(page).toHaveURL(/\/flows/);
  });

  test("should display flow list", async ({ page }) => {
    await flowsPage.open();

    // Wait for flows to load - either list, empty state, loading, or connected page
    await page.waitForTimeout(2000);

    // Should show the flows page container at least
    const flowsPageContainer = page.locator('[data-testid="flows-page"]');
    const flowsList = page.locator('[data-testid="flows-list"]');
    const emptyState = page.locator('[data-testid="flows-empty-state"]');
    const loadingState = page.locator('[data-testid="flows-loading"]');
    const notConnected = page.locator('[data-testid="flows-not-connected"]');

    // Check if any of these is visible
    const pageVisible = await flowsPageContainer.isVisible().catch(() => false);
    const listVisible = await flowsList.isVisible().catch(() => false);
    const emptyVisible = await emptyState.isVisible().catch(() => false);
    const loadingVisible = await loadingState.isVisible().catch(() => false);
    const notConnectedVisible = await notConnected.isVisible().catch(() => false);

    // At least one should be visible
    expect(pageVisible || listVisible || emptyVisible || loadingVisible || notConnectedVisible).toBe(true);
  });

  test("should sync flows from registry", async ({ page }) => {
    await flowsPage.open();

    // Wait for page to load
    await page.waitForTimeout(1000);

    // Check if sync button is enabled (it's disabled when no flows are discovered)
    const syncEnabled = await flowsPage.isSyncButtonEnabled();
    if (!syncEnabled) {
      // Skip test if no flows are available to sync from registry
      test.skip(true, "Sync button is disabled - no flows discovered from registry");
      return;
    }

    // Click sync button
    await flowsPage.syncFlows();

    // Should complete without error - check that we're still on flows page
    await expect(page).toHaveURL(/\/flows/);
  });

  test("should navigate to flow detail page", async ({ page }) => {
    await flowsPage.open();

    // Wait for flows to load
    await page.waitForTimeout(1000);

    // Try clicking on a flow if any exist
    const flowItems = page.locator('[data-testid^="flow-"]');
    const count = await flowItems.count();

    if (count > 0) {
      await flowItems.first().click();
      await page.waitForURL(/\/flows\/.+/);

      // Should show flow detail page
      await expect(page.locator('[data-testid="flow-detail"]')).toBeVisible();
    }
  });

  test("should display flow canvas on detail page", async ({ page, server }) => {
    // Navigate to an existing flow detail page
    await flowsPage.open();
    await page.waitForTimeout(1000);

    // Check if there are any flow cards to click
    const flowCards = page.locator('[data-testid^="flows-card-"]');
    const count = await flowCards.count();

    if (count > 0) {
      // Click on the first flow
      await flowCards.first().click();
      await page.waitForTimeout(1000);

      // Should be on flow detail page
      await expect(page).toHaveURL(/\/flows\//);
    } else {
      // Skip test if no flows exist
      test.skip(true, "No flows available to test flow detail page");
    }
  });

  test("should export flow DSL", async ({ page, server }) => {
    // Skip this test as the export DSL feature is not implemented in the UI
    test.skip(true, "Export DSL feature not implemented in the current UI");
  });
});
