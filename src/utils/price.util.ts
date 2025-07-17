export function normalizePrice(price: string): number {
  return parseFloat(price.replace(/[^0-9.]/g, ""));
}
