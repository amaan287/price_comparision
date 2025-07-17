import { Page, expect } from "@playwright/test";
import { BasePage } from "./basePage";
import { normalizePrice } from "./utils/price.util";

export class AmazonPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async searchProduct(productName: string) {
    // Wait for the search bar to be ready
    await this.page.waitForSelector("#twotabsearchtextbox");
    await this.page.fill("#twotabsearchtextbox", productName);
    await this.page.press("#twotabsearchtextbox", "Enter");
    // Wait for the search results to be fully loaded and stable
    await this.page.waitForLoadState("domcontentloaded");
    // Wait for the first product card to appear (correct selector)
    await this.page.waitForSelector(
      'div[data-component-type="s-search-result"]',
      { timeout: 20000 }
    );
  }

  async getFirstProductPrice(): Promise<number> {
    // Wait for at least one product card to appear
    await this.page.waitForSelector('div[data-component-type="s-search-result"]', { timeout: 20000 });

    // Get all product cards
    const productCards = this.page.locator('div[data-component-type="s-search-result"]');
    const count = await productCards.count();

    for (let i = 0; i < count; i++) {
      const card = productCards.nth(i);

      // Optionally skip sponsored results
      const isSponsored = await card.locator('span:has-text("Sponsored")').count();
      if (isSponsored > 0) continue;

      // Try to get the price from .a-offscreen (most reliable)
      const priceElement = card.locator('.a-price .a-offscreen');
      if (await priceElement.count() > 0) {
        const priceText = await priceElement.first().innerText();
        return normalizePrice(priceText);
      }

      // Fallback: Try .a-price-whole
      const priceWhole = card.locator('.a-price-whole');
      if (await priceWhole.count() > 0) {
        const priceText = await priceWhole.first().innerText();
        return normalizePrice(priceText);
      }
    }

    throw new Error("No product price found");
  }
  async validateProductAppears(productName: string): Promise<string> {
    console.log("Inside validateProductAppears");
    const productLocator = this.page
      .locator("h2.a-size-medium.a-spacing-none.a-color-base.a-text-normal")
      .first();

    // Wait for element to be visible
    await productLocator.waitFor({ state: "visible", timeout: 10000 });

    // Get the actual title text
    const actualTitle = await productLocator.innerText();
    const cleanTitle = actualTitle.trim();

    // Validate it contains expected text (now using the parameter)
    await expect(productLocator).toContainText(productName, {
      ignoreCase: true,
    });

    // Return the scraped title
    return cleanTitle;
  }
}
