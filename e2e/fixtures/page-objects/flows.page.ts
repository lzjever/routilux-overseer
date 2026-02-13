/**
 * Flows Page Object
 *
 * Represents the flows management page.
 * Uses testid naming convention from TESTID_CONTRACT.md
 */

import { Page, Locator } from "@playwright/test";
import { BasePage } from "./base.page";

export class FlowsPage extends BasePage {
  readonly url = "/flows";

  // Locators - using testid convention from TESTID_CONTRACT.md
  private readonly pageContainer = this.page.locator('[data-testid="flows-page"]');
  private readonly flowCards = this.page.locator('[data-testid^="flows-card-"]');
  private readonly refreshButton = this.page.locator('[data-testid="flows-button-refresh"]');
  private readonly syncButton = this.page.locator('[data-testid="flows-button-sync"]');
  private readonly searchInput = this.page.locator('[data-testid="flows-input-search"]');
  private readonly emptyState = this.page.locator('[data-testid="flows-empty-state"]');
  private readonly loadingState = this.page.locator('[data-testid="flows-loading"]');
  private readonly notConnectedState = this.page.locator('[data-testid="flows-not-connected"]');

  /**
   * Navigate to the flows page.
   */
  async open(): Promise<void> {
    await this.goto(this.url);
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Get the number of flows displayed.
   */
  async getFlowCount(): Promise<number> {
    await this.page.waitForLoadState("networkidle");
    return await this.flowCards.count();
  }

  /**
   * Click on a flow by its ID.
   */
  async clickFlow(flowId: string): Promise<void> {
    await this.page.locator(`[data-testid="flows-card-${flowId}"]`).click();
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Click view button on a flow by its ID.
   */
  async clickViewFlow(flowId: string): Promise<void> {
    await this.page.locator(`[data-testid="flows-button-view-${flowId}"]`).click();
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Search for flows by query.
   */
  async search(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.page.waitForTimeout(300); // Debounce wait
  }

  /**
   * Clear the search.
   */
  async clearSearch(): Promise<void> {
    await this.searchInput.fill("");
    await this.page.waitForTimeout(300);
  }

  /**
   * Refresh flows list.
   */
  async refresh(): Promise<void> {
    await this.refreshButton.click();
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Sync flows from the registry.
   */
  async syncFlows(): Promise<void> {
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
   * Get a flow card locator by index.
   */
  getFlowCard(index: number): Locator {
    return this.flowCards.nth(index);
  }

  /**
   * Get a flow card locator by ID.
   */
  getFlowCardById(flowId: string): Locator {
    return this.page.locator(`[data-testid="flows-card-${flowId}"]`);
  }

  /**
   * Check if a specific flow is visible.
   */
  async isFlowVisible(flowId: string): Promise<boolean> {
    return await this.getFlowCardById(flowId)
      .isVisible()
      .catch(() => false);
  }

  /**
   * Wait for flows to load.
   */
  async waitForFlows(): Promise<void> {
    // Wait for either flows or empty state
    await this.page.waitForSelector(
      '[data-testid^="flows-card-"], [data-testid="flows-empty-state"], [data-testid="flows-not-connected"]',
      { timeout: 10000 }
    );
  }
}
