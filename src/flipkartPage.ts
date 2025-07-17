import { Page, expect } from "playwright/test";
import { BasePage } from "./basePage";
import { normalizePrice } from "./utils/price.util";

export class FlipkartPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigateTo(url: string) {
    await super.navigateTo(url);
    const closeButton = this.page.locator('button:has-text("✕")');
    // This logic correctly handles the popup if it appears.
    await closeButton.click({ timeout: 5000 }).catch(() => {
      console.log("Flipkart login popup did not appear or was already closed.");
    });
  }

  async searchProduct(productName: string) {
    await this.page.fill('input[name="q"]', productName);
    await this.page.locator('button[type="submit"]').click();

    const firstProductTitle = this.page.locator("div.KzDlHZ").first();
    await expect(firstProductTitle).toBeVisible({ timeout: 30000 });
  }

  async getFirstProductPrice(): Promise<number> {
    // Find the first product card
    const firstProductCard = this.page
      .locator("div._75nlfW > div[data-id]")
      .first();
    // Find the price element within the first product card
    const priceElement = firstProductCard.locator("div.Nx9bqj._4b5DiR");
    // Wait for the price to be visible
    await expect(priceElement).toBeVisible({ timeout: 10000 });
    // Get the price text
    const price = await priceElement.innerText();
    return normalizePrice(price);
  }

  async validateProductAppears(productName: string) {
    const productLocator = this.page.locator("div.KzDlHZ").first();
    await expect(productLocator).toContainText("iPhone 15 Plus", {
      ignoreCase: true,
    });
  }
}
