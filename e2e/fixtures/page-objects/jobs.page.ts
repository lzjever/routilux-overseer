/**
 * Jobs Page Object
 *
 * Represents the jobs monitoring page.
 * Uses testid naming convention from TESTID_CONTRACT.md
 */

import { Page, Locator } from "@playwright/test";
import { BasePage } from "./base.page";

export class JobsPage extends BasePage {
  readonly url = "/jobs";

  // Locators - using testid convention from TESTID_CONTRACT.md
  private readonly pageContainer = this.page.locator('[data-testid="jobs-page"]');
  private readonly jobRows = this.page.locator('[data-testid^="jobs-row-"]');
  private readonly statusFilter = this.page.locator('[data-testid="jobs-select-status-filter"]');
  private readonly refreshButton = this.page.locator('[data-testid="jobs-button-refresh"]');
  private readonly syncButton = this.page.locator('[data-testid="jobs-button-sync"]');
  private readonly emptyState = this.page.locator('[data-testid="jobs-empty-state"]');
  private readonly loadingState = this.page.locator('[data-testid="jobs-loading"]');
  private readonly notConnectedState = this.page.locator('[data-testid="jobs-not-connected"]');

  /**
   * Navigate to the jobs page.
   */
  async open(): Promise<void> {
    await this.goto(this.url);
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Get the number of jobs displayed.
   */
  async getJobCount(): Promise<number> {
    await this.page.waitForLoadState("networkidle");
    return await this.jobRows.count();
  }

  /**
   * Click on a job row by its ID.
   */
  async clickJob(jobId: string): Promise<void> {
    await this.page.locator(`[data-testid="jobs-row-${jobId}"]`).click();
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Filter jobs by status.
   */
  async filterByStatus(
    status: "all" | "running" | "completed" | "failed" | "paused"
  ): Promise<void> {
    await this.statusFilter.selectOption(status);
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Refresh the jobs list.
   */
  async refresh(): Promise<void> {
    await this.refreshButton.click();
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Sync jobs.
   */
  async sync(): Promise<void> {
    await this.syncButton.click();
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Check if the empty state is shown.
   */
  async isEmpty(): Promise<boolean> {
    return await this.emptyState.isVisible().catch(() => false);
  }

  /**
   * Check if the not connected state is shown.
   */
  async isNotConnected(): Promise<boolean> {
    return await this.notConnectedState.isVisible().catch(() => false);
  }

  /**
   * Check if loading.
   */
  async isLoading(): Promise<boolean> {
    return await this.loadingState.isVisible().catch(() => false);
  }

  /**
   * Get a job row locator by index.
   */
  getJobRow(index: number): Locator {
    return this.jobRows.nth(index);
  }

  /**
   * Get a job row locator by ID.
   */
  getJobRowById(jobId: string): Locator {
    return this.page.locator(`[data-testid="jobs-row-${jobId}"]`);
  }

  /**
   * Wait for jobs to load.
   */
  async waitForJobs(): Promise<void> {
    await this.page.waitForSelector(
      '[data-testid^="jobs-row-"], [data-testid="jobs-empty-state"], [data-testid="jobs-not-connected"]',
      { timeout: 10000 }
    );
  }
}
