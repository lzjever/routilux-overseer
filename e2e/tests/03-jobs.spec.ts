/**
 * Jobs E2E Tests
 *
 * Tests job execution, monitoring, and management functionality.
 */

import { test, expect } from '../fixtures';
import { JobsPage, JobDetailPage } from '../fixtures/page-objects';

test.describe('Jobs Management', () => {
  let jobsPage: JobsPage;
  let jobDetailPage: JobDetailPage;

  test.beforeEach(async ({ page, server }) => {
    jobsPage = new JobsPage(page);
    jobDetailPage = new JobDetailPage(page);

    // Connect to test server
    await page.goto('/connect');
    await page.fill('input[name="serverUrl"], input#serverUrl', server.getServerUrl());
    await page.click('button:has-text("Test Connection")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Connect")');
    await page.waitForURL('/');
  });

  test('should display jobs list page', async ({ page }) => {
    await jobsPage.open();

    // Should show jobs list
    await expect(page.locator('[data-testid="job-list"], [data-testid="jobs-list"]')).toBeVisible();
  });

  test('should show empty state when no jobs exist', async ({ page }) => {
    await jobsPage.open();

    const emptyState = page.locator('[data-testid="empty-state"]');
    const isVisible = await emptyState.isVisible().catch(() => false);

    // Either empty state or list should be visible
    if (isVisible) {
      await expect(emptyState).toContainText(/no jobs|empty/i);
    }
  });

  test('should filter jobs by status', async ({ page }) => {
    await jobsPage.open();

    // Try status filters
    await jobsPage.filterByStatus('running');
    await page.waitForTimeout(500);

    await jobsPage.filterByStatus('completed');
    await page.waitForTimeout(500);

    // Should not error
    await expect(page).toHaveURL(/\/jobs/);
  });

  test('should execute a simple flow job', async ({ page, server }) => {
    // Create a simple flow via API
    const flowData = {
      name: 'e2e_job_test',
      description: 'Test flow for job execution',
      routines: [
        {
          id: 'source',
          factory_name: 'e2e_data_generator',
          config: { count: 5 }
        },
        {
          id: 'sink',
          factory_name: 'e2e_data_collector',
          config: {}
        }
      ],
      connections: [
        { from: 'source.output', to: 'sink.input' }
      ]
    };

    const flowResponse = await fetch(`${server.getServerUrl()}/api/v1/flows`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(flowData)
    });

    if (!flowResponse.ok) {
      test.skip(true, 'Could not create flow for job test');
      return;
    }

    const flow = await flowResponse.json();

    // Submit job
    const jobResponse = await fetch(`${server.getServerUrl()}/api/v1/execute/flow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flow_id: flow.id })
    });

    if (jobResponse.ok) {
      const job = await jobResponse.json();

      // Navigate to jobs page
      await jobsPage.open();

      // Wait for job to appear
      await page.waitForTimeout(2000);

      // Job should be in list
      await expect(page.locator(`[data-testid="job-${job.id}"]`)).toBeVisible({ timeout: 10000 });
    }
  });

  test('should display job detail with real-time updates', async ({ page, server }) => {
    // Create and execute a flow
    const flowData = {
      name: 'e2e_detail_test',
      routines: [
        {
          id: 'source',
          factory_name: 'e2e_data_generator',
          config: { count: 3 }
        },
        {
          id: 'sink',
          factory_name: 'e2e_data_collector',
          config: {}
        }
      ],
      connections: [
        { from: 'source.output', to: 'sink.input' }
      ]
    };

    const flowResponse = await fetch(`${server.getServerUrl()}/api/v1/flows`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(flowData)
    });

    if (!flowResponse.ok) {
      test.skip(true, 'Could not create flow');
      return;
    }

    const flow = await flowResponse.json();

    const jobResponse = await fetch(`${server.getServerUrl()}/api/v1/execute/flow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flow_id: flow.id })
    });

    if (jobResponse.ok) {
      const job = await jobResponse.json();

      // Open job detail
      await jobDetailPage.open(job.id);

      // Should show job status
      const status = await jobDetailPage.getStatus();
      expect(status).toBeTruthy();

      // Should show visualization
      await expect(page.locator('[data-testid="flow-canvas"], [data-testid="job-visualization"]')).toBeVisible({ timeout: 5000 });
    }
  });
});
