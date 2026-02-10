/**
 * Connection E2E Tests
 *
 * Tests the connection setup and configuration functionality.
 */

import { test, expect } from '../fixtures';
import { ConnectPage } from '../fixtures/page-objects';

test.describe('Connection Management', () => {
  let connectPage: ConnectPage;

  test.beforeEach(async ({ page }) => {
    connectPage = new ConnectPage(page);
  });

  test('should display connection form', async ({ page }) => {
    await connectPage.open();

    // Verify form elements are present
    await expect(page.locator('input[name="serverUrl"], input#serverUrl')).toBeVisible();
    await expect(page.locator('input[name="apiKey"], input#apiKey')).toBeVisible();
    await expect(page.locator('button:has-text("Test Connection")')).toBeVisible();
  });

  test('should reject invalid server URL', async ({ page }) => {
    await connectPage.open();
    await connectPage.setServerUrl('http://invalid-url-that-does-not-exist:9999');
    await connectPage.testConnection();

    // Should show error
    await expect(connectPage.isConnectionError()).resolves.toBe(true);
  });

  test('should accept valid routilux server connection', async ({ page, server }) => {
    await connectPage.open();

    // Connect to the test server
    const serverUrl = server.getServerUrl();
    await connectPage.setServerUrl(serverUrl);
    await connectPage.testConnection();

    // Should succeed
    await expect(connectPage.isConnectionSuccessful()).resolves.toBe(true);
  });

  test('should persist connection settings', async ({ page, server }) => {
    await connectPage.open();

    const serverUrl = server.getServerUrl();
    await connectPage.connectTo(serverUrl);

    // Navigate away and back
    await page.goto('/');
    await connectPage.open();

    // Connection should be remembered
    const currentUrl = page.locator('input[name="serverUrl"], input#serverUrl');
    await expect(currentUrl).toHaveValue(serverUrl);
  });

  test('should redirect to home after successful connection', async ({ page, server }) => {
    await connectPage.open();

    const serverUrl = server.getServerUrl();
    await connectPage.setServerUrl(serverUrl);
    await connectPage.testConnection();
    await connectPage.connect();

    // Should redirect to home page
    await expect(page).toHaveURL('/');
  });
});
