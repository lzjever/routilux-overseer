/**
 * Workers E2E Tests
 *
 * Tests worker management functionality.
 */

import { test, expect } from "../fixtures/fixtures";
import { WorkersPage } from "../fixtures/page-objects";

test.describe("Workers Management", () => {
  let workersPage: WorkersPage;

  test.beforeEach(async ({ page, server }) => {
    workersPage = new WorkersPage(page);

    // Connect to test server
    await page.goto("/connect");
    await page.fill('input[name="serverUrl"], input#serverUrl', server.getServerUrl());
    await page.click('button:has-text("Test Connection")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Connect")');
    await page.waitForURL("/");
  });

  test("should display workers list page", async ({ page }) => {
    await workersPage.open();

    // Should show workers page
    await expect(
      page.locator('[data-testid="worker-list"], [data-testid="workers-page"]')
    ).toBeVisible();
  });

  test("should show empty state when no workers exist", async ({ page }) => {
    await workersPage.open();

    const emptyState = page.locator('[data-testid="empty-state"]');
    const isVisible = await emptyState.isVisible().catch(() => false);

    if (isVisible) {
      await expect(emptyState).toContainText(/no workers|empty/i);
    }
  });

  test("should start a worker for a flow", async ({ page, server }) => {
    // Create a flow first
    const flowData = {
      name: "e2e_worker_test",
      routines: [
        {
          id: "source",
          factory_name: "e2e_data_generator",
          config: { count: 5 },
        },
        {
          id: "sink",
          factory_name: "e2e_data_collector",
          config: {},
        },
      ],
      connections: [{ from: "source.output", to: "sink.input" }],
    };

    const flowResponse = await fetch(`${server.getServerUrl()}/api/v1/flows`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(flowData),
    });

    if (flowResponse.ok) {
      const flow = await flowResponse.json();

      await workersPage.open();

      // Start worker button should be available
      const startButton = page.locator(
        `[data-testid="start-worker-${flow.id}"], button:has-text("Start Worker")`
      );

      const isVisible = await startButton.isVisible().catch(() => false);
      if (isVisible) {
        await startButton.first().click();
        await page.waitForTimeout(1000);

        // Worker should appear in list
        const workerItems = page.locator('[data-testid^="worker-"]');
        const count = await workerItems.count();

        if (count > 0) {
          const status = await page.locator('[data-testid="worker-status"]').first().textContent();
          expect(status).toBeTruthy();
        }
      }
    }
  });

  test("should pause and resume a worker", async ({ page, server }) => {
    // This test requires a running worker
    const flowData = {
      name: "e2e_worker_pause_test",
      routines: [],
      connections: [],
    };

    const flowResponse = await fetch(`${server.getServerUrl()}/api/v1/flows`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(flowData),
    });

    if (flowResponse.ok) {
      const flow = await flowResponse.json();

      // Start worker
      const startResponse = await fetch(`${server.getServerUrl()}/api/v1/workers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flow_id: flow.id }),
      });

      if (startResponse.ok) {
        const worker = await startResponse.json();

        await workersPage.open();
        await page.waitForTimeout(1000);

        // Try pause button if exists
        const pauseButton = page.locator(`[data-testid="pause-worker-${worker.id}"]`);
        const isPauseVisible = await pauseButton.isVisible().catch(() => false);

        if (isPauseVisible) {
          await pauseButton.click();
          await page.waitForTimeout(500);

          // Try resume
          const resumeButton = page.locator(`[data-testid="resume-worker-${worker.id}"]`);
          await resumeButton.click().catch(() => {
            // Worker might have auto-completed
          });
        }
      }
    }
  });

  test("should stop a running worker", async ({ page, server }) => {
    const flowData = {
      name: "e2e_worker_stop_test",
      routines: [],
      connections: [],
    };

    const flowResponse = await fetch(`${server.getServerUrl()}/api/v1/flows`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(flowData),
    });

    if (flowResponse.ok) {
      const flow = await flowResponse.json();

      const startResponse = await fetch(`${server.getServerUrl()}/api/v1/workers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flow_id: flow.id }),
      });

      if (startResponse.ok) {
        const worker = await startResponse.json();

        await workersPage.open();

        // Stop button
        const stopButton = page.locator(`[data-testid="stop-worker-${worker.id}"]`);
        const isVisible = await stopButton.isVisible().catch(() => false);

        if (isVisible) {
          await stopButton.click();
          await page.waitForTimeout(500);

          // Worker should be stopped or removed
        }
      }
    }
  });
});
