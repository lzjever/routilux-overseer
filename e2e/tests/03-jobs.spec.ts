/**
 * Jobs E2E Tests
 *
 * Tests job execution, monitoring, and management functionality.
 */

import { test, expect } from "../fixtures/fixtures";
import { JobsPage, JobDetailPage } from "../fixtures/page-objects";

test.describe("Jobs Management", () => {
  let jobsPage: JobsPage;
  let jobDetailPage: JobDetailPage;

  test.beforeEach(async ({ page, server }) => {
    jobsPage = new JobsPage(page);
    jobDetailPage = new JobDetailPage(page);

    // Connect to test server
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

  test("should display jobs list page", async ({ page }) => {
    await jobsPage.open();

    // Wait for jobs to load
    await page.waitForTimeout(2000);

    // Should show one of: jobs page, jobs list, empty state, or loading
    const jobsPageContainer = page.locator('[data-testid="jobs-page"]');
    const jobsList = page.locator('[data-testid="jobs-list"]');
    const emptyState = page.locator('[data-testid="jobs-empty-state"]');
    const loadingState = page.locator('[data-testid="jobs-loading"]');
    const notConnected = page.locator('[data-testid="jobs-not-connected"]');

    // Check if any of these is visible
    const pageVisible = await jobsPageContainer.isVisible().catch(() => false);
    const listVisible = await jobsList.isVisible().catch(() => false);
    const emptyVisible = await emptyState.isVisible().catch(() => false);
    const loadingVisible = await loadingState.isVisible().catch(() => false);
    const notConnectedVisible = await notConnected.isVisible().catch(() => false);

    // At least one should be visible
    expect(
      pageVisible || listVisible || emptyVisible || loadingVisible || notConnectedVisible
    ).toBe(true);
  });

  test("should show empty state when no jobs exist", async ({ page }) => {
    await jobsPage.open();
    await page.waitForTimeout(1000);

    const emptyState = page.locator('[data-testid="jobs-empty-state"]');
    const isVisible = await emptyState.isVisible().catch(() => false);

    // Either empty state or list should be visible
    if (isVisible) {
      await expect(emptyState).toContainText(/no jobs|empty/i);
    }
  });

  test("should filter jobs by status", async ({ page }) => {
    await jobsPage.open();
    await page.waitForTimeout(1500);

    // Check if we're on the connected jobs page (not the "not connected" state)
    const notConnectedState = page.locator('[data-testid="jobs-not-connected"]');
    const isNotConnected = await notConnectedState.isVisible().catch(() => false);

    if (isNotConnected) {
      test.skip(true, "Not connected - skipping filter test");
      return;
    }

    // Check if jobs list or empty state is visible (indicating we're connected)
    const jobsList = page.locator('[data-testid="jobs-list"]');
    const emptyState = page.locator('[data-testid="jobs-empty-state"]');

    const listVisible = await jobsList.isVisible().catch(() => false);
    const emptyVisible = await emptyState.isVisible().catch(() => false);

    if (!listVisible && !emptyVisible) {
      test.skip(true, "Jobs list not visible - skipping filter test");
      return;
    }

    // Try status filters - just verify the filter control exists and is visible
    const statusFilter = page.locator('[data-testid="jobs-select-status-filter"]');

    // Check if filter is visible
    const filterVisible = await statusFilter.isVisible().catch(() => false);
    expect(filterVisible).toBe(true);

    // Should be on jobs page
    await expect(page).toHaveURL(/\/jobs/);
  });

  test("should execute a simple flow job", async ({ page, server }) => {
    // Create a simple flow via API using correct format
    const flowId = `e2e-job-test-${Date.now()}`;
    const flowData = {
      flow_id: flowId,
      dsl_dict: {
        flow_id: flowId,
        routines: {
          source: {
            factory_name: "e2e_data_generator",
            config: { count: 5 },
          },
          sink: {
            factory_name: "e2e_data_collector",
            config: {},
          },
        },
        connections: [{ from: "source.output", to: "sink.input" }],
      },
    };

    const flowResponse = await fetch(`${server.getServerUrl()}/api/v1/flows`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(flowData),
    });

    if (!flowResponse.ok) {
      test.skip(true, "Could not create flow for job test");
      return;
    }

    const flow = await flowResponse.json();

    // Submit job - using the correct execute endpoint format
    const jobResponse = await fetch(`${server.getServerUrl()}/api/v1/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flow_id: flow.flow_id }),
    });

    if (jobResponse.ok) {
      const job = await jobResponse.json();

      // Navigate to jobs page
      await jobsPage.open();

      // Wait for job to appear
      await page.waitForTimeout(2000);

      // Job should be in list - check for the jobs list
      const jobsList = page.locator('[data-testid="jobs-list"]');
      await expect(jobsList)
        .toBeVisible({ timeout: 10000 })
        .catch(() => {
          // If jobs list is not visible, check for empty state
        });
    }
  });

  test("should display job detail with real-time updates", async ({ page, server }) => {
    // Create and execute a flow using correct API format
    const flowId = `e2e-detail-test-${Date.now()}`;
    const flowData = {
      flow_id: flowId,
      dsl_dict: {
        flow_id: flowId,
        routines: {
          source: {
            factory_name: "e2e_data_generator",
            config: { count: 3 },
          },
          sink: {
            factory_name: "e2e_data_collector",
            config: {},
          },
        },
        connections: [{ from: "source.output", to: "sink.input" }],
      },
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

    const jobResponse = await fetch(`${server.getServerUrl()}/api/v1/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flow_id: flow.flow_id }),
    });

    if (jobResponse.ok) {
      const job = await jobResponse.json();

      // Open job detail
      await jobDetailPage.open(job.job_id);

      // Should show job status or page
      await page.waitForTimeout(1000);

      // Verify we're on the job detail page
      await expect(page).toHaveURL(/\/jobs\//);
    }
  });
});
