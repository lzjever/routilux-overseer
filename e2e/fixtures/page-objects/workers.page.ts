/**
 * Workers Page Object
 *
 * Represents the worker management page.
 */

import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class WorkersPage extends BasePage {
  readonly url = '/workers';

  // Locators
  private readonly workerList = this.page.locator('[data-testid="worker-list"]');
  private readonly workerItems = this.page.locator('[data-testid^="worker-"]');

  /**
   * Navigate to the workers page.
   */
  async open(): Promise<void> {
    await this.goto(this.url);
    await this.waitForLoading();
  }

  /**
   * Get the number of workers displayed.
   */
  async getWorkerCount(): Promise<number> {
    return await this.workerItems.count();
  }

  /**
   * Start a worker for a flow.
   */
  async startWorker(flowId: string): Promise<void> {
    await this.clickByTestId(`start-worker-${flowId}`);
    await this.waitForLoading();
  }

  /**
   * Stop a worker.
   */
  async stopWorker(workerId: string): Promise<void> {
    await this.clickByTestId(`stop-worker-${workerId}`);
    await this.waitForLoading();
  }

  /**
   * Pause a worker.
   */
  async pauseWorker(workerId: string): Promise<void> {
    await this.clickByTestId(`pause-worker-${workerId}`);
    await this.waitForLoading();
  }

  /**
   * Resume a worker.
   */
  async resumeWorker(workerId: string): Promise<void> {
    await this.clickByTestId(`resume-worker-${workerId}`);
    await this.waitForLoading();
  }

  /**
   * Get a worker item locator by index.
   */
  getWorkerItem(index: number): Locator {
    return this.workerItems.nth(index);
  }

  /**
   * Get worker status by index.
   */
  async getWorkerStatus(index: number): Promise<string> {
    const item = this.getWorkerItem(index);
    const statusLocator = item.locator('[data-testid="worker-status"]');
    return await statusLocator.textContent() || '';
  }
}
