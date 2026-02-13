/**
 * Connection E2E Tests
 *
 * Tests the connection setup and configuration functionality.
 */

import { test, expect } from "../fixtures/fixtures";
import { ConnectPage } from "../fixtures/page-objects";

test.describe("Connection Management", () => {
  let connectPage: ConnectPage;

  test.beforeEach(async ({ page }) => {
    connectPage = new ConnectPage(page);
  });

  test("should display connection form", async ({ page }) => {
    await connectPage.open();

    // Verify form elements are present using testids
    await expect(page.locator('[data-testid="connect-input-server-url"]')).toBeVisible();
    await expect(page.locator('[data-testid="connect-input-api-key"]')).toBeVisible();
    await expect(page.locator('[data-testid="connect-button-submit"]')).toBeVisible();
  });

  test("should reject invalid server URL", async ({ page }) => {
    await connectPage.open();
    await connectPage.setServerUrl("http://invalid-url-that-does-not-exist:9999");
    await connectPage.testConnection();

    // Should show error
    await expect(connectPage.isConnectionError()).resolves.toBe(true);
  });

  test("should accept valid routilux server connection", async ({ page, server }) => {
    await connectPage.open();

    // Connect to the test server
    const serverUrl = server.getServerUrl();
    await connectPage.setServerUrl(serverUrl);
    await connectPage.testConnection();

    // Should succeed
    await expect(connectPage.isConnectionSuccessful()).resolves.toBe(true);
  });

  test("should persist connection settings", async ({ page, server }) => {
    await connectPage.open();

    const serverUrl = server.getServerUrl();
    await connectPage.connectTo(serverUrl);

    // Navigate away and back
    await page.goto("/");
    await connectPage.open();

    // Connection should be remembered - the URL might be stored with localhost or 127.0.0.1
    const currentUrl = page.locator('[data-testid="connect-input-server-url"]');
    const value = await currentUrl.inputValue();
    // Check that some URL is persisted (either localhost or 127.0.0.1)
    expect(value).toMatch(/http:\/\/(localhost|127\.0\.0\.1):20555/);
  });

  test("should redirect to home after successful connection", async ({ page, server }) => {
    await connectPage.open();

    const serverUrl = server.getServerUrl();
    await connectPage.setServerUrl(serverUrl);

    // Click and wait for navigation
    await Promise.all([page.waitForURL("**/", { timeout: 15000 }), connectPage.connect()]);

    // Should be on home page
    await expect(page).toHaveURL("/");
  });
});
