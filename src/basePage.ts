import { Page, expect } from "@playwright/test";

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigateTo(url: string) {
    await this.page.goto(url);
  }

  async validateUrlAndTitle(expectedUrl: string, expectedTitle: RegExp) {
    await expect(this.page).toHaveURL(expectedUrl);
    await expect(this.page).toHaveTitle(expectedTitle);
  }
}
