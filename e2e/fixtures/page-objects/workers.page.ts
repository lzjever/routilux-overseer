/**
 * Workers Page Object
 *
 * Represents the worker management page.
 * Uses testid naming convention from TESTID_CONTRACT.md
 */

import { Page, Locator } from "@playwright/test";
import { BasePage } from "./base.page";

export class WorkersPage extends BasePage {
  readonly url = "/workers";

  // Locators - using testid convention from TESTID_CONTRACT.md
  private readonly pageContainer = this.page.locator('[data-testid="workers-page"]');
  private readonly workerCards = this.page.locator('[data-testid^="workers-card-"]');
  private readonly refreshButton = this.page.locator('[data-testid="workers-button-refresh"]');
  private readonly syncButton = this.page.locator('[data-testid="workers-button-sync"]');
  private readonly emptyState = this.page.locator('[data-testid="workers-empty-state"]');
  private readonly loadingState = this.page.locator('[data-testid="workers-loading"]');
  private readonly notConnectedState = this.page.locator('[data-testid="workers-not-connected"]');

  /**
   * Navigate to the workers page.
   */
  async open(): Promise<void> {
    await this.goto(this.url);
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Get the number of workers displayed.
   */
  async getWorkerCount(): Promise<number> {
    await this.page.waitForLoadState("networkidle");
    return await this.workerCards.count();
  }

  /**
   * Stop a worker.
   */
  async stopWorker(workerId: string): Promise<void> {
    await this.page.locator(`[data-testid="workers-button-stop-${workerId}"]`).click();
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Pause a worker.
   */
  async pauseWorker(workerId: string): Promise<void> {
    await this.page.locator(`[data-testid="workers-button-pause-${workerId}"]`).click();
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Resume a worker.
   */
  async resumeWorker(workerId: string): Promise<void> {
    await this.page.locator(`[data-testid="workers-button-resume-${workerId}"]`).click();
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Refresh the workers list.
   */
  async refresh(): Promise<void> {
    await this.refreshButton.click();
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Sync workers.
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
   * Get a worker card locator by index.
   */
  getWorkerCard(index: number): Locator {
    return this.workerCards.nth(index);
  }

  /**
   * Get a worker card locator by ID.
   */
  getWorkerCardById(workerId: string): Locator {
    return this.page.locator(`[data-testid="workers-card-${workerId}"]`);
  }

  /**
   * Wait for workers to load.
   */
  async waitForWorkers(): Promise<void> {
    await this.page.waitForSelector(
      '[data-testid^="workers-card-"], [data-testid="workers-empty-state"], [data-testid="workers-not-connected"]',
      { timeout: 10000 }
    );
  }
}
