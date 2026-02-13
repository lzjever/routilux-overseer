/**
 * Job Detail Page Object
 *
 * Represents the job detail page with real-time monitoring.
 */

import { Page } from "@playwright/test";
import { BasePage } from "./base.page";

export class JobDetailPage extends BasePage {
  /**
   * Navigate to a job's detail page.
   */
  async open(jobId: string): Promise<void> {
    await this.goto(`/jobs/${jobId}`);
    await this.waitForLoading();
  }

  /**
   * Get the current job status.
   */
  async getStatus(): Promise<string> {
    return await this.getTextByTestId("job-status");
  }

  /**
   * Check if the job is running.
   */
  async isRunning(): Promise<boolean> {
    const status = await this.getStatus();
    return status.toLowerCase().includes("running");
  }

  /**
   * Check if the job completed successfully.
   */
  async isCompleted(): Promise<boolean> {
    const status = await this.getStatus();
    return status.toLowerCase().includes("completed");
  }

  /**
   * Check if the job failed.
   */
  async isFailed(): Promise<boolean> {
    const status = await this.getStatus();
    return status.toLowerCase().includes("failed");
  }

  /**
   * Pause the job.
   */
  async pauseJob(): Promise<void> {
    await this.clickByTestId("pause-job-button");
  }

  /**
   * Resume the job.
   */
  async resumeJob(): Promise<void> {
    await this.clickByTestId("resume-job-button");
  }

  /**
   * Cancel the job.
   */
  async cancelJob(): Promise<void> {
    await this.clickByTestId("cancel-job-button");
  }

  /**
   * Click on a routine node in the visualization.
   */
  async clickRoutine(routineId: string): Promise<void> {
    await this.clickByTestId(`routine-${routineId}`);
  }

  /**
   * Get the event log text.
   */
  async getEventLog(): Promise<string> {
    return await this.getTextByTestId("event-log");
  }

  /**
   * Check if breakpoint panel is visible.
   */
  async isBreakpointPanelVisible(): Promise<boolean> {
    return await this.isVisibleByTestId("breakpoint-panel");
  }
}
