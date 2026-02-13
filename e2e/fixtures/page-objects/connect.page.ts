/**
 * Connect Page Object
 *
 * Represents the connection configuration page.
 * Uses testid naming convention from TESTID_CONTRACT.md
 */

import { Page } from "@playwright/test";
import { BasePage } from "./base.page";

export class ConnectPage extends BasePage {
  readonly url = "/connect";

  // Locators - using testid convention from TESTID_CONTRACT.md
  private readonly pageContainer = this.page.locator('[data-testid="connect-page"]');
  private readonly serverUrlInput = this.page.locator('[data-testid="connect-input-server-url"]');
  private readonly apiKeyInput = this.page.locator('[data-testid="connect-input-api-key"]');
  private readonly submitButton = this.page.locator('[data-testid="connect-button-submit"]');
  private readonly errorMessage = this.page.locator('[data-testid="connect-error-message"]');
  private readonly spinner = this.page.locator('[data-testid="connect-spinner"]');

  /**
   * Navigate to the connect page.
   */
  async open(): Promise<void> {
    await this.goto(this.url);
    await this.pageContainer.waitFor({ state: "visible" });
  }

  /**
   * Set the server URL.
   */
  async setServerUrl(url: string): Promise<void> {
    await this.serverUrlInput.fill(url);
  }

  /**
   * Set the API key.
   */
  async setApiKey(key: string): Promise<void> {
    await this.apiKeyInput.fill(key);
  }

  /**
   * Test the connection by clicking submit.
   */
  async testConnection(): Promise<void> {
    await this.submitButton.click();
    await this.waitForConnectLoading();
  }

  /**
   * Connect by clicking submit (same button).
   */
  async connect(): Promise<void> {
    await this.submitButton.click();
    await this.waitForConnectLoading();
  }

  /**
   * Check if connection was successful.
   * Success is indicated by redirect to home page and no error message.
   */
  async isConnectionSuccessful(): Promise<boolean> {
    // Wait a bit for the connection to process
    await this.page.waitForTimeout(500);

    // Check if we're redirected away from connect page (success)
    const currentUrl = this.page.url();
    if (!currentUrl.includes("/connect")) {
      return true;
    }

    // Check if error message is visible (failure)
    const hasError = await this.errorMessage.isVisible().catch(() => false);
    return !hasError;
  }

  /**
   * Check if connection failed.
   */
  async isConnectionError(): Promise<boolean> {
    await this.page.waitForTimeout(500);
    return await this.errorMessage.isVisible().catch(() => false);
  }

  /**
   * Get error message text.
   */
  async getErrorMessage(): Promise<string> {
    return (await this.errorMessage.textContent()) || "";
  }

  /**
   * Connect with the given configuration.
   * This tests the connection and waits for redirect.
   */
  async connectTo(serverUrl: string, apiKey: string = ""): Promise<void> {
    await this.open();
    await this.setServerUrl(serverUrl);
    if (apiKey) {
      await this.setApiKey(apiKey);
    }
    await this.submitButton.click();

    // Wait for either redirect or error
    await this.page.waitForURL("**/connect", { timeout: 15000 }).catch(() => {
      // If we don't stay on connect page, we've been redirected (success)
    });
  }

  /**
   * Wait for loading spinner to disappear.
   */
  protected async waitForConnectLoading(): Promise<void> {
    // Wait for spinner to appear (if it does)
    await this.page.waitForTimeout(100);
    // Wait for spinner to disappear
    await this.spinner.waitFor({ state: "hidden", timeout: 15000 }).catch(() => {});
  }
}
