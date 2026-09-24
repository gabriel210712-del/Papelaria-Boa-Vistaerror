import { Product } from '../types';

/**
 * Checks if a product was added within the last 4 weeks (28 days).
 * If createdAt is not specified, defaults to true if created recently or false.
 */
export function isProductNew(product: Product): boolean {
  if (!product.createdAt) return false;

  const createdTime = new Date(product.createdAt).getTime();
  if (isNaN(createdTime)) return false;

  const now = Date.now();
  const FOUR_WEEKS_MS = 28 * 24 * 60 * 60 * 1000; // 4 weeks = 28 days

  // It's a "Novidade" if it was created within the last 4 weeks and not in the future beyond today
  const diff = now - createdTime;
  return diff >= 0 && diff <= FOUR_WEEKS_MS;
}
