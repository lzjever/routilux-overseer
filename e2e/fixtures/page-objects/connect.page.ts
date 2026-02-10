/**
 * Connect Page Object
 *
 * Represents the connection configuration page.
 */

import { Page } from '@playwright/test';
import { BasePage } from './base.page';

export class ConnectPage extends BasePage {
  readonly url = '/connect';

  // Locators
  private readonly serverUrlInput = this.page.locator('input[name="serverUrl"], input#serverUrl');
  private readonly apiKeyInput = this.page.locator('input[name="apiKey"], input#apiKey');
  private readonly testConnectionButton = this.page.locator('button:has-text("Test Connection")');
  private readonly connectButton = this.page.locator('button:has-text("Connect")');
  private readonly successMessage = this.page.locator('[data-testid="connection-success"], .success-message');
  private readonly errorMessage = this.page.locator('[data-testid="connection-error"], .error-message');

  /**
   * Navigate to the connect page.
   */
  async open(): Promise<void> {
    await this.goto(this.url);
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
   * Test the connection.
   */
  async testConnection(): Promise<void> {
    await this.testConnectionButton.click();
    await this.waitForLoading();
  }

  /**
   * Click the connect button.
   */
  async connect(): Promise<void> {
    await this.connectButton.click();
    await this.waitForLoading();
  }

  /**
   * Check if connection was successful.
   */
  async isConnectionSuccessful(): Promise<boolean> {
    return await this.successMessage.isVisible().catch(() => false);
  }

  /**
   * Check if connection failed.
   */
  async isConnectionError(): Promise<boolean> {
    return await this.errorMessage.isVisible().catch(() => false);
  }

  /**
   * Get error message text.
   */
  async getErrorMessage(): Promise<string> {
    return await this.errorMessage.textContent() || '';
  }

  /**
   * Connect with the given configuration.
   */
  async connectTo(serverUrl: string, apiKey: string = ''): Promise<void> {
    await this.open();
    await this.setServerUrl(serverUrl);
    if (apiKey) {
      await this.setApiKey(apiKey);
    }
    await this.testConnection();
    await this.connect();
  }
}
