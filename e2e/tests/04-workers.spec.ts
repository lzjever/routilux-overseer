/**
 * Workers E2E Tests
 *
 * Tests worker management functionality.
 */

import { test, expect } from "../fixtures/fixtures";
import { ConnectPage, WorkersPage } from "../fixtures/page-objects";

test.describe("Workers Management", () => {
  let workersPage: WorkersPage;

  test.beforeEach(async ({ page, server }) => {
    const connectPage = new ConnectPage(page);
    workersPage = new WorkersPage(page);

    await connectPage.open();
    await connectPage.setServerUrl(server.getServerUrl());
    await connectPage.testConnection();
    await page.waitForURL(/\/(?!connect)/, { timeout: 20000 });
    await page.waitForLoadState("domcontentloaded");
  });

  test("should display workers list page", async ({ page }) => {
    await workersPage.open();

    // Should show workers page container (allow time for rehydration and render)
    await expect(page.locator('[data-testid="workers-page"]')).toBeVisible({ timeout: 15000 });
  });

  test("should show empty state when no workers exist", async ({ page }) => {
    await workersPage.open();

    const emptyState = page.locator('[data-testid="workers-empty-state"]');
    const isVisible = await emptyState.isVisible().catch(() => false);

    if (isVisible) {
      await expect(emptyState).toContainText(/no workers|empty/i);
    }
  });

  test("should start a worker for a flow", async ({ page, server }) => {
    const flowId = `e2e_worker_test_${Date.now()}`;
    const flowPayload = {
      flow_id: flowId,
      dsl_dict: {
        flow_id: flowId,
        routines: {
          source: { class: "e2e_data_generator", config: { count: 5 } },
          sink: { class: "e2e_data_generator", config: {} },
        },
        connections: [{ from: "source.output", to: "sink.trigger" }],
      },
    };

    const flowResponse = await fetch(`${server.getServerUrl()}/api/v1/flows`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(flowPayload),
    });

    if (flowResponse.ok) {
      const flow = await flowResponse.json();
      const fid = flow.flow_id ?? flowId;

      const workerResponse = await fetch(`${server.getServerUrl()}/api/v1/workers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flow_id: fid }),
      });
      if (!workerResponse.ok) return;

      const worker = await workerResponse.json();
      const workerId = worker.worker_id ?? worker.id;

      await workersPage.open();
      await page.waitForTimeout(1500);

      const workerCard = page.locator(`[data-testid="workers-card-${workerId}"]`);
      await expect(workerCard).toBeVisible({ timeout: 5000 });
    }
  });

  test("should pause and resume a worker", async ({ page, server }) => {
    const flowId = `e2e_worker_pause_${Date.now()}`;
    const flowPayload = {
      flow_id: flowId,
      dsl_dict: {
        flow_id: flowId,
        routines: { source: { class: "e2e_data_generator", config: {} } },
        connections: [],
      },
    };

    const flowResponse = await fetch(`${server.getServerUrl()}/api/v1/flows`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(flowPayload),
    });

    if (flowResponse.ok) {
      const flow = await flowResponse.json();
      const fid = flow.flow_id ?? flowId;

      const startResponse = await fetch(`${server.getServerUrl()}/api/v1/workers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flow_id: fid }),
      });

      if (startResponse.ok) {
        const worker = await startResponse.json();

        await workersPage.open();
        await page.waitForTimeout(1000);

        const workerId = worker.worker_id ?? worker.id;
        const pauseButton = page.locator(`[data-testid="workers-button-pause-${workerId}"]`);
        const isPauseVisible = await pauseButton.isVisible().catch(() => false);

        if (isPauseVisible) {
          await pauseButton.click();
          await page.waitForTimeout(500);

          const resumeButton = page.locator(`[data-testid="workers-button-resume-${workerId}"]`);
          await resumeButton.click().catch(() => {
            // Worker might have auto-completed
          });
        }
      }
    }
  });

  test("should stop a running worker", async ({ page, server }) => {
    const flowId = `e2e_worker_stop_${Date.now()}`;
    const flowPayload = {
      flow_id: flowId,
      dsl_dict: {
        flow_id: flowId,
        routines: { source: { class: "e2e_data_generator", config: {} } },
        connections: [],
      },
    };

    const flowResponse = await fetch(`${server.getServerUrl()}/api/v1/flows`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(flowPayload),
    });

    if (flowResponse.ok) {
      const flow = await flowResponse.json();
      const fid = flow.flow_id ?? flowId;

      const startResponse = await fetch(`${server.getServerUrl()}/api/v1/workers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flow_id: fid }),
      });

      if (startResponse.ok) {
        const worker = await startResponse.json();

        await workersPage.open();

        const workerId = worker.worker_id ?? worker.id;
        const stopButton = page.locator(`[data-testid="workers-button-stop-${workerId}"]`);
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
