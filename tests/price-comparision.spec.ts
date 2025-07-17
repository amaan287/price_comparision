import { test, expect } from "@playwright/test";
import { FlipkartPage } from "../src/flipkartPage";
import { AmazonPage } from "../src/amazonPage";
import { productToSearch } from "../src/data/test.data";
import { FLIPKART_URL, AMAZON_URL } from "../src/utils/constants";

test.describe("Price Comparison between Flipkart and Amazon", () => {
  test("should find the same product and compare prices", async ({
    browser,
  }) => {
    const flipkartContext = await browser.newContext();
    const amazonContext = await browser.newContext();

    const flipkartPageInstance = new FlipkartPage(
      await flipkartContext.newPage()
    );
    const amazonPageInstance = new AmazonPage(await amazonContext.newPage());

    // Flipkart Actions
    const flipkartPromise =
      test.step("Flipkart: Search and get price", async () => {
        await flipkartPageInstance.navigateTo(FLIPKART_URL);
        await flipkartPageInstance.validateUrlAndTitle(
          FLIPKART_URL,
          /Online Shopping Site for Mobiles, Electronics, Furniture, Grocery, Lifestyle, Books & More. Best Offers!/
        );
        await flipkartPageInstance.searchProduct(productToSearch.name);
        await flipkartPageInstance.validateProductAppears(productToSearch.name);
        const price = await flipkartPageInstance.getFirstProductPrice();
        console.log(`Flipkart Price for ${productToSearch.name}: ₹${price}`);
        return price;
      });

    // Amazon Actions
    const amazonPromise =
      test.step("Amazon: Search and get price", async () => {
        await amazonPageInstance.navigateTo(AMAZON_URL);
        await amazonPageInstance.validateUrlAndTitle(
          AMAZON_URL,
          /Online Shopping site in India: Shop Online for Mobiles, Books, Watches, Shoes and More - Amazon.in/
        );
        await amazonPageInstance.searchProduct(productToSearch.name);
        await amazonPageInstance.validateProductAppears(productToSearch.name);
        const price = await amazonPageInstance.getFirstProductPrice();
        console.log(`Amazon Price for ${productToSearch.name}: ₹${price}`);
        return price;
      });

    const [flipkartPrice, amazonPrice] = await Promise.all([
      flipkartPromise,
      amazonPromise,
    ]);

    // Comparison and Assertion
    test.step("Compare prices", () => {
      expect(
        flipkartPrice,
        `Test Failed: Flipkart price (₹${flipkartPrice}) is not less than Amazon price (₹${amazonPrice}).`
      ).toBeLessThan(amazonPrice);
      console.log("Test Passed: Flipkart price is less than Amazon price.");
    });
  });
});
