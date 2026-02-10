/**
 * Flow Detail Page Object
 *
 * Represents the flow detail page with visualization and actions.
 */

import { Page } from '@playwright/test';
import { BasePage } from './base.page';

export class FlowDetailPage extends BasePage {
  /**
   * Navigate to a flow's detail page.
   */
  async open(flowId: string): Promise<void> {
    await this.goto(`/flows/${flowId}`);
    await this.waitForLoading();
  }

  /**
   * Click the export DSL button.
   */
  async exportDsl(): Promise<void> {
    await this.clickByTestId('export-dsl-button');
  }

  /**
   * Click the validate button.
   */
  async validateFlow(): Promise<void> {
    await this.clickByTestId('validate-flow-button');
  }

  /**
   * Start a worker for this flow.
   */
  async startWorker(): Promise<void> {
    await this.clickByTestId('start-worker-button');
    await this.waitForLoading();
  }

  /**
   * Submit a job for this flow.
   */
  async submitJob(config: Record<string, unknown> = {}): Promise<void> {
    await this.clickByTestId('submit-job-button');

    // If there's a config dialog, fill it
    const configEditor = this.page.locator('[data-testid="job-config-editor"]');
    if (await configEditor.isVisible().catch(() => false)) {
      await configEditor.fill(JSON.stringify(config));
      await this.clickByTestId('confirm-submit-job');
    }
  }

  /**
   * Check if the flow canvas is visible.
   */
  async isCanvasVisible(): Promise<boolean> {
    return await this.isVisibleByTestId('flow-canvas');
  }

  /**
   * Get the number of routines displayed on the canvas.
   */
  async getRoutineCount(): Promise<number> {
    return await this.page.locator('[data-testid^="routine-"]').count();
  }

  /**
   * Get the number of connections displayed.
   */
  async getConnectionCount(): Promise<number> {
    return await this.page.locator('[data-testid^="connection-"]').count();
  }
}
