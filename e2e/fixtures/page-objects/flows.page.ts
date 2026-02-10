/**
 * Flows Page Object
 *
 * Represents the flows management page.
 */

import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class FlowsPage extends BasePage {
  readonly url = '/flows';

  // Locators
  private readonly flowList = this.page.locator('[data-testid="flow-list"], [data-testid="flows-list"]');
  private readonly flowItems = this.page.locator('[data-testid^="flow-"]');
  private readonly syncButton = this.page.locator('button:has-text("Sync")');
  private readonly createFlowButton = this.page.locator('button:has-text("Create Flow"), [data-testid="create-flow-button"]');
  private readonly searchInput = this.page.locator('input[placeholder*="search"], input[name="search"]');
  private readonly emptyState = this.page.locator('[data-testid="empty-state"]');

  /**
   * Navigate to the flows page.
   */
  async open(): Promise<void> {
    await this.goto(this.url);
    await this.waitForLoading();
  }

  /**
   * Get the number of flows displayed.
   */
  async getFlowCount(): Promise<number> {
    await this.waitForVisible('[data-testid^="flow-"]');
    return await this.flowItems.count();
  }

  /**
   * Click on a flow by its ID.
   */
  async clickFlow(flowId: string): Promise<void> {
    await this.clickByTestId(`flow-${flowId}`);
    await this.waitForLoading();
  }

  /**
   * Click on a flow by its name.
   */
  async clickFlowByName(name: string): Promise<void> {
    await this.page.click(`[data-testid="flow-${name}"], [data-testid*="${name}"]`);
    await this.waitForLoading();
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
    await this.searchInput.fill('');
    await this.page.waitForTimeout(300);
  }

  /**
   * Sync flows from the registry.
   */
  async syncFlows(): Promise<void> {
    await this.syncButton.click();
    await this.waitForLoading();
  }

  /**
   * Click the create flow button.
   */
  async clickCreateFlow(): Promise<void> {
    await this.createFlowButton.click();
  }

  /**
   * Check if the empty state is shown.
   */
  async isEmpty(): Promise<boolean> {
    return await this.emptyState.isVisible().catch(() => false);
  }

  /**
   * Get a flow item locator by index.
   */
  getFlowItem(index: number): Locator {
    return this.flowItems.nth(index);
  }

  /**
   * Get flow name by index.
   */
  async getFlowName(index: number): Promise<string> {
    const item = this.getFlowItem(index);
    const nameLocator = item.locator('[data-testid="flow-name"], .flow-name');
    return await nameLocator.textContent() || '';
  }

  /**
   * Get flow status by index.
   */
  async getFlowStatus(index: number): Promise<string> {
    const item = this.getFlowItem(index);
    const statusLocator = item.locator('[data-testid="flow-status"], .flow-status');
    return await statusLocator.textContent() || '';
  }
}
