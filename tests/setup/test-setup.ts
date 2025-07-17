import { Browser, BrowserContext, Page } from "@playwright/test";
import { FlipkartPage } from "../../src/flipkartPage";
import { AmazonPage } from "../../src/amazonPage";

export class TestSetup {
  private browser: Browser;
  private flipkartContext: BrowserContext;
  private amazonContext: BrowserContext;
  private flipkartPage: Page;
  private amazonPage: Page;

  constructor(browser: Browser) {
    this.browser = browser;
  }

  /**
   * Setup parallel browser contexts for both sites
   */
  async setupParallelContexts(): Promise<{
    flipkartPage: FlipkartPage;
    amazonPage: AmazonPage;
  }> {
    // Create separate contexts for parallel execution
    this.flipkartContext = await this.browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    });

    this.amazonContext = await this.browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    });

    // Create pages
    this.flipkartPage = await this.flipkartContext.newPage();
    this.amazonPage = await this.amazonContext.newPage();

    // Create page objects
    const flipkartPageObject = new FlipkartPage(this.flipkartPage);
    const amazonPageObject = new AmazonPage(this.amazonPage);

    return {
      flipkartPage: flipkartPageObject,
      amazonPage: amazonPageObject,
    };
  }

  /**
   * Navigate to both sites in parallel
   */
  async navigateToSites(
    flipkartPage: FlipkartPage,
    amazonPage: AmazonPage
  ): Promise<void> {
    try {
      await Promise.all([
        flipkartPage.navigate().catch((e) => {
          console.error("Flipkart navigation failed:", e);
          throw e; // Rethrow to allow test to fail early if needed
        }),
        amazonPage.navigate().catch((e) => {
          console.error("Amazon navigation failed:", e);
          throw e;
        }),
      ]);
    } catch (err) {
      console.error("Error during parallel navigation:", err);
      throw err;
    }
  }

  /**
   * Validate both sites in parallel
   */
  async validateSites(
    flipkartPage: FlipkartPage,
    amazonPage: AmazonPage
  ): Promise<{
    flipkartValidation: any;
    amazonValidation: any;
  }> {
    const [flipkartValidation, amazonValidation] = await Promise.all([
      flipkartPage.validatePage(),
      amazonPage.validatePage(),
    ]);

    return {
      flipkartValidation,
      amazonValidation,
    };
  }

  /**
   * Search on both sites in parallel
   */
  async searchOnBothSites(
    flipkartPage: FlipkartPage,
    amazonPage: AmazonPage,
    searchTerm: string
  ): Promise<void> {
    await Promise.all([
      flipkartPage.searchProduct(searchTerm),
      amazonPage.searchProduct(searchTerm),
    ]);
  }

  /**
   * Get products from both sites in parallel
   */
  async getProductsFromBothSites(
    flipkartPage: FlipkartPage,
    amazonPage: AmazonPage
  ): Promise<{
    flipkartProduct: any;
    amazonProduct: any;
  }> {
    const [flipkartProduct, amazonProduct] = await Promise.all([
      flipkartPage.getFirstProduct(),
      amazonPage.getFirstProduct(),
    ]);

    return {
      flipkartProduct,
      amazonProduct,
    };
  }

  /**
   * Close all contexts and pages
   */
  async cleanup(): Promise<void> {
    try {
      await this.flipkartContext?.close();
      await this.amazonContext?.close();
    } catch (error) {
      console.error("Error during cleanup:", error);
    }
  }
  // close broswer
  async closeBrowser(): Promise<void> {
    await this.browser.close();
  }
  /**
   * Take screenshots from both pages
   */
  async takeScreenshots(name: string): Promise<void> {
    await Promise.all([
      this.flipkartPage?.screenshot({
        path: `test-results/screenshots/flipkart-${name}-${Date.now()}.png`,
        fullPage: true,
      }),
      this.amazonPage?.screenshot({
        path: `test-results/screenshots/amazon-${name}-${Date.now()}.png`,
        fullPage: true,
      }),
    ]);
  }

  /**
   * Get page sources for debugging
   */
  async getPageSources(): Promise<{
    flipkartSource: string;
    amazonSource: string;
  }> {
    const [flipkartSource, amazonSource] = await Promise.all([
      this.flipkartPage?.content() || "",
      this.amazonPage?.content() || "",
    ]);

    return {
      flipkartSource,
      amazonSource,
    };
  }
}
