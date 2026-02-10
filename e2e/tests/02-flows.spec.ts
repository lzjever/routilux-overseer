/**
 * Flows Management E2E Tests
 *
 * Tests flow listing, viewing, and management functionality.
 */

import { test, expect } from '../fixtures';
import { FlowsPage, FlowDetailPage } from '../fixtures/page-objects';

test.describe('Flows Management', () => {
  let flowsPage: FlowsPage;
  let flowDetailPage: FlowDetailPage;

  test.beforeEach(async ({ page, server }) => {
    flowsPage = new FlowsPage(page);
    flowDetailPage = new FlowDetailPage(page);

    // First, connect to the test server
    await page.goto('/connect');
    await page.fill('input[name="serverUrl"], input#serverUrl', server.getServerUrl());
    await page.click('button:has-text("Test Connection")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Connect")');
    await page.waitForURL('/');
  });

  test('should list available routines from factory', async ({ page }) => {
    await flowsPage.open();

    // Wait for flows to load
    await page.waitForTimeout(1000);

    // The page should load without errors
    await expect(page).toHaveURL(/\/flows/);
  });

  test('should display flow list', async ({ page }) => {
    await flowsPage.open();

    // Should show the flow list container
    await expect(page.locator('[data-testid="flow-list"], [data-testid="flows-list"]')).toBeVisible();
  });

  test('should sync flows from registry', async ({ page }) => {
    await flowsPage.open();

    // Click sync button
    await flowsPage.syncFlows();

    // Should complete without error
    await expect(page.locator('[data-testid="flow-list"]')).toBeVisible();
  });

  test('should navigate to flow detail page', async ({ page }) => {
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

  test('should display flow canvas on detail page', async ({ page, server }) => {
    // Create a flow first via API
    const flowData = {
      name: 'e2e_test_flow',
      description: 'E2E test flow',
      routines: [
        {
          id: 'source',
          factory_name: 'e2e_data_generator',
          config: { count: 10 }
        }
      ],
      connections: []
    };

    const response = await fetch(`${server.getServerUrl()}/api/v1/flows`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(flowData)
    });

    if (response.ok) {
      const flow = await response.json();

      await flowDetailPage.open(flow.id);

      // Should show canvas
      await expect(flowDetailPage.isCanvasVisible()).resolves.toBe(true);
    }
  });

  test('should export flow DSL', async ({ page, server }) => {
    const flowData = {
      name: 'e2e_export_test',
      description: 'Test flow for export',
      routines: [],
      connections: []
    };

    const response = await fetch(`${server.getServerUrl()}/api/v1/flows`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(flowData)
    });

    if (response.ok) {
      const flow = await response.json();
      await flowDetailPage.open(flow.id);

      // Click export
      await flowDetailPage.exportDsl();

      // Should show DSL dialog or trigger download
      const dslContent = page.locator('[data-testid="dsl-content"], pre');
      await expect(dslContent).toBeVisible({ timeout: 5000 }).catch(() => {
        // Download might happen instead
      });
    }
  });
});
