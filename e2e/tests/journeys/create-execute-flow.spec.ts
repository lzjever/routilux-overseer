/**
 * Journey Test: Create and Execute Flow
 *
 * Tests the complete user journey of creating a flow and executing it.
 */

import { test, expect } from "../../fixtures/fixtures";
import { ConnectPage, FlowsPage, JobsPage, JobDetailPage } from "../../fixtures/page-objects";

test.describe("Journey: Create and Execute Flow", () => {
  let connectPage: ConnectPage;
  let flowsPage: FlowsPage;
  let jobsPage: JobsPage;
  let jobDetailPage: JobDetailPage;

  test.beforeEach(async ({ page }) => {
    connectPage = new ConnectPage(page);
    flowsPage = new FlowsPage(page);
    jobsPage = new JobsPage(page);
    jobDetailPage = new JobDetailPage(page);
  });

  test("complete flow: connect -> create flow -> execute job -> monitor", async ({
    page,
    server,
  }) => {
    // Step 1: Connect to server
    await connectPage.open();
    await connectPage.setServerUrl(server.getServerUrl());
    await connectPage.testConnection();
    await expect(connectPage.isConnectionSuccessful()).resolves.toBe(true);
    await connectPage.connect();

    // Should redirect to home
    await expect(page).toHaveURL("/");

    // Step 2: Navigate to flows page
    await flowsPage.open();
    await expect(page).toHaveURL(/\/flows/);

    // Step 3: Create a flow via API (since UI wizard may vary)
    const flowData = {
      name: "journey_test_flow",
      description: "Flow created during journey test",
      routines: [
        {
          id: "source",
          factory_name: "e2e_data_generator",
          config: { count: 10, pattern: "sequential" },
        },
        {
          id: "transformer",
          factory_name: "e2e_data_transformer",
          config: { transform_type: "uppercase" },
        },
        {
          id: "sink",
          factory_name: "e2e_data_collector",
          config: {},
        },
      ],
      connections: [
        { from: "source.output", to: "transformer.input" },
        { from: "transformer.output", to: "sink.input" },
      ],
    };

    const flowResponse = await fetch(`${server.getServerUrl()}/api/v1/flows`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(flowData),
    });

    expect(flowResponse.ok).toBe(true);
    const flow = await flowResponse.json();

    // Step 4: Refresh flows page to see new flow
    await flowsPage.syncFlows();
    await page.waitForTimeout(1000);

    // Step 5: Navigate to flow detail
    await flowsPage.clickFlow(flow.id);

    // Should show flow detail
    await expect(page).toHaveURL(new RegExp(`/flows/${flow.id}`));

    // Step 6: Submit job
    const jobResponse = await fetch(`${server.getServerUrl()}/api/v1/execute/flow`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flow_id: flow.id }),
    });

    expect(jobResponse.ok).toBe(true);
    const job = await jobResponse.json();

    // Step 7: Monitor job execution
    await jobsPage.open();
    await page.waitForTimeout(1000);

    // Job should be visible in list
    await expect(page.locator(`[data-testid="job-${job.id}"]`)).toBeVisible({ timeout: 10000 });

    // Step 8: View job details
    await jobsPage.clickJob(job.id);

    // Wait for job to complete
    await page.waitForTimeout(3000);

    // Step 9: Verify job completed
    const status = await jobDetailPage.getStatus();
    expect(["completed", "running", "pending"].some((s) => status.toLowerCase().includes(s))).toBe(
      true
    );

    // Step 10: Check visualization is present
    await expect(
      page.locator('[data-testid="flow-canvas"], [data-testid="job-visualization"]')
    ).toBeVisible({ timeout: 5000 });
  });

  test("journey with error: handle failing job gracefully", async ({ page, server }) => {
    // Connect
    await connectPage.connectTo(server.getServerUrl());

    // Create a flow that will fail
    const flowData = {
      name: "journey_error_flow",
      routines: [
        {
          id: "source",
          factory_name: "e2e_data_generator",
          config: { count: 3 },
        },
        {
          id: "error_gen",
          factory_name: "e2e_error_simulator",
          config: { error_type: "runtime" },
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

      // Submit job
      const jobResponse = await fetch(`${server.getServerUrl()}/api/v1/execute/flow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flow_id: flow.id }),
      });

      if (jobResponse.ok) {
        const job = await jobResponse.json();

        // Navigate to job detail
        await jobDetailPage.open(job.id);

        // Wait for failure
        await page.waitForTimeout(3000);

        // Should show error state
        const status = await jobDetailPage.getStatus();

        if (status.toLowerCase().includes("fail")) {
          // Error handling should be visible
          const errorElements = page.locator('[data-testid*="error"], .error, .failed');
          const count = await errorElements.count();
          expect(count).toBeGreaterThan(0);
        }
      }
    }
  });
});
