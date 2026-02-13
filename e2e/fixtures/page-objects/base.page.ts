/**
 * Base Page Object
 *
 * Provides common functionality for all page objects.
 */

import { Page, Locator } from "@playwright/test";

export class BasePage {
  constructor(protected readonly page: Page) {}

  /**
   * Navigate to a URL path.
   */
  async goto(path: string): Promise<void> {
    await this.page.goto(path);
  }

  /**
   * Wait for a selector to be visible.
   */
  async waitForVisible(selector: string, timeout: number = 5000): Promise<void> {
    await this.page.waitForSelector(selector, { state: "visible", timeout });
  }

  /**
   * Wait for a selector to be hidden.
   */
  async waitForHidden(selector: string, timeout: number = 5000): Promise<void> {
    await this.page.waitForSelector(selector, { state: "hidden", timeout });
  }

  /**
   * Click an element by test ID.
   */
  async clickByTestId(testId: string): Promise<void> {
    await this.page.click(`[data-testid="${testId}"]`);
  }

  /**
   * Get text content of an element by test ID.
   */
  async getTextByTestId(testId: string): Promise<string> {
    const locator = this.page.locator(`[data-testid="${testId}"]`);
    return (await locator.textContent()) || "";
  }

  /**
   * Fill an input by test ID.
   */
  async fillByTestId(testId: string, value: string): Promise<void> {
    await this.page.fill(`[data-testid="${testId}"]`, value);
  }

  /**
   * Check if an element by test ID is visible.
   */
  async isVisibleByTestId(testId: string): Promise<boolean> {
    const locator = this.page.locator(`[data-testid="${testId}"]`);
    return await locator.isVisible().catch(() => false);
  }

  /**
   * Wait for loading state to complete.
   */
  async waitForLoading(): Promise<void> {
    try {
      await this.page.waitForSelector('[data-testid="loading"]', {
        state: "hidden",
        timeout: 10000,
      });
    } catch {
      // Loading element may not exist, continue
    }
  }

  /**
   * Take a screenshot for debugging.
   */
  async screenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `screenshots/${name}.png` });
  }
}
