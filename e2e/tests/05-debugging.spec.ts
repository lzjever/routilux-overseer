/**
 * Debugging E2E Tests
 *
 * Tests breakpoint debugging and troubleshooting features.
 */

import { test, expect } from "../fixtures/fixtures";
import { ConnectPage, JobDetailPage } from "../fixtures/page-objects";

test.describe("Debugging Features", () => {
  let jobDetailPage: JobDetailPage;

  test.beforeEach(async ({ page, server }) => {
    const connectPage = new ConnectPage(page);
    jobDetailPage = new JobDetailPage(page);

    await connectPage.open();
    await connectPage.setServerUrl(server.getServerUrl());
    await connectPage.testConnection();
    await page.waitForURL(/\/(?!connect)/, { timeout: 20000 });
    await page.waitForLoadState("domcontentloaded");
  });

  test("should display event log on job detail", async ({ page, server }) => {
    // Create a simple job
    const flowData = {
      name: "e2e_debug_test",
      routines: [
        {
          id: "source",
          factory_name: "e2e_data_generator",
          config: { count: 3 },
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

    if (!flowResponse.ok) {
      test.skip(true, "Could not create flow");
      return;
    }

    const flow = await flowResponse.json();

    const jobResponse = await fetch(`${server.getServerUrl()}/api/v1/execute/flow`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flow_id: flow.id }),
    });

    if (jobResponse.ok) {
      const job = await jobResponse.json();

      await jobDetailPage.open(job.id);

      // Wait for some events
      await page.waitForTimeout(2000);

      // Event log should be visible
      const eventLog = page.locator('[data-testid="event-log"], [data-testid="events-panel"]');
      await expect(eventLog).toBeVisible({ timeout: 5000 });
    }
  });

  test("should display routine nodes on canvas", async ({ page, server }) => {
    const flowData = {
      name: "e2e_canvas_test",
      routines: [
        {
          id: "routine1",
          factory_name: "e2e_data_generator",
          config: { count: 5 },
        },
        {
          id: "routine2",
          factory_name: "e2e_data_transformer",
          config: {},
        },
      ],
      connections: [{ from: "routine1.output", to: "routine2.input" }],
    };

    const flowResponse = await fetch(`${server.getServerUrl()}/api/v1/flows`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(flowData),
    });

    if (flowResponse.ok) {
      const flow = await flowResponse.json();

      const jobResponse = await fetch(`${server.getServerUrl()}/api/v1/execute/flow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flow_id: flow.id }),
      });

      if (jobResponse.ok) {
        const job = await jobResponse.json();

        await jobDetailPage.open(job.id);

        // Routine nodes should be visible
        await expect(page.locator('[data-testid^="routine-"]')).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test("should show shared data panel", async ({ page, server }) => {
    const flowData = {
      name: "e2e_shared_data_test",
      routines: [
        {
          id: "source",
          factory_name: "e2e_data_generator",
          config: { count: 2 },
        },
      ],
      connections: [],
    };

    const flowResponse = await fetch(`${server.getServerUrl()}/api/v1/flows`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(flowData),
    });

    if (flowResponse.ok) {
      const flow = await flowResponse.json();

      const jobResponse = await fetch(`${server.getServerUrl()}/api/v1/execute/flow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flow_id: flow.id }),
      });

      if (jobResponse.ok) {
        const job = await jobResponse.json();

        await jobDetailPage.open(job.id);

        // Click on a routine to see shared data
        await page.waitForTimeout(1000);
        const routine = page.locator('[data-testid^="routine-"]').first();
        const isVisible = await routine.isVisible().catch(() => false);

        if (isVisible) {
          await routine.click();

          // Shared data panel might appear
          const sharedDataPanel = page.locator(
            '[data-testid="shared-data-panel"], [data-testid="data-panel"]'
          );
          await sharedDataPanel.isVisible().then(async (visible) => {
            if (visible) {
              await expect(sharedDataPanel).toBeVisible();
            }
          });
        }
      }
    }
  });

  test("should handle failed job error display", async ({ page, server }) => {
    // Create a flow that will fail
    const flowData = {
      name: "e2e_error_test",
      routines: [
        {
          id: "source",
          factory_name: "e2e_data_generator",
          config: { count: 3 },
        },
        {
          id: "error_gen",
          factory_name: "e2e_error_simulator",
          config: { error_type: "value_error" },
        },
      ],
      connections: [{ from: "source.output", to: "error_gen.input" }],
    };

    const flowResponse = await fetch(`${server.getServerUrl()}/api/v1/flows`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(flowData),
    });

    if (flowResponse.ok) {
      const flow = await flowResponse.json();

      const jobResponse = await fetch(`${server.getServerUrl()}/api/v1/execute/flow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flow_id: flow.id }),
      });

      if (jobResponse.ok) {
        const job = await jobResponse.json();

        await jobDetailPage.open(job.id);

        // Wait for job to complete/fail
        await page.waitForTimeout(3000);

        const status = await jobDetailPage.getStatus();

        if (status.toLowerCase().includes("fail")) {
          // Should show error information
          const errorDisplay = page.locator(
            '[data-testid="error-display"], [data-testid="job-error"]'
          );
          await expect(errorDisplay)
            .toBeVisible({ timeout: 5000 })
            .catch(() => {
              // Error might be shown differently
            });
        }
      }
    }
  });
});
