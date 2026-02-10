/**
 * Jobs Page Object
 *
 * Represents the jobs monitoring page.
 */

import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class JobsPage extends BasePage {
  readonly url = '/jobs';

  // Locators
  private readonly jobList = this.page.locator('[data-testid="job-list"]');
  private readonly jobItems = this.page.locator('[data-testid^="job-"]');
  private readonly statusFilter = this.page.locator('[data-testid="status-filter"]');
  private readonly refreshButton = this.page.locator('button:has-text("Refresh")');

  /**
   * Navigate to the jobs page.
   */
  async open(): Promise<void> {
    await this.goto(this.url);
    await this.waitForLoading();
  }

  /**
   * Get the number of jobs displayed.
   */
  async getJobCount(): Promise<number> {
    return await this.jobItems.count();
  }

  /**
   * Click on a job by its ID.
   */
  async clickJob(jobId: string): Promise<void> {
    await this.clickByTestId(`job-${jobId}`);
    await this.waitForLoading();
  }

  /**
   * Filter jobs by status.
   */
  async filterByStatus(status: 'all' | 'running' | 'completed' | 'failed' | 'paused'): Promise<void> {
    await this.statusFilter.selectOption(status);
    await this.waitForLoading();
  }

  /**
   * Refresh the jobs list.
   */
  async refresh(): Promise<void> {
    await this.refreshButton.click();
    await this.waitForLoading();
  }

  /**
   * Get a job item locator by index.
   */
  getJobItem(index: number): Locator {
    return this.jobItems.nth(index);
  }

  /**
   * Get job ID by index.
   */
  async getJobId(index: number): Promise<string> {
    const item = this.getJobItem(index);
    const idLocator = item.locator('[data-testid="job-id"]');
    return await idLocator.textContent() || '';
  }

  /**
   * Get job status by index.
   */
  async getJobStatus(index: number): Promise<string> {
    const item = this.getJobItem(index);
    const statusLocator = item.locator('[data-testid="job-status"]');
    return await statusLocator.textContent() || '';
  }
}
