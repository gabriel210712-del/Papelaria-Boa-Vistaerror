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

/**
 * Maps known product IDs to clean, public image URLs in /product-images/
 * so they can be viewed, embedded, or previewed reliably via WhatsApp link cards.
 */
export const CLEAN_PRODUCT_IMAGES: Record<string, string> = {
  'caneta-bic-cristal-preta-unidade': '/product-images/caneta-bic-cristal-preta-unidade.webp',
  'caneta-bic-cristal-azul-unidade': '/product-images/caneta-bic-cristal-azul-unidade.webp',
  'caneta-bic-cristal-vermelha-unidade': '/product-images/caneta-bic-cristal-vermelha-unidade.webp',
  'caderno-enaldinho-80f-jandaia': '/product-images/caderno-enaldinho-80f-jandaia.jpg',
  'rebecca-bonbon-sweet-dreams-2026': '/product-images/rebecca-bonbon-sweet-dreams-2026.png',
  'rebecca-bonbon-plush-dreams-2026': '/product-images/rebecca-bonbon-plush-dreams-2026.png',
  'rebecca-bonbon-denim-2026': '/product-images/rebecca-bonbon-denim-2026.png',
  'taba-squishy-paper-manteiga-fidget': '/product-images/taba-squishy-paper-manteiga-fidget.webp',
  'mochila-rebecca-bonbon-rb27422-azul': '/product-images/mochila-rebecca-bonbon-rb27422-azul.png',
};

/**
 * Returns the absolute URL of a product image suitable for sharing on WhatsApp.
 * Ensures the link is fully qualified with protocol and host, so WhatsApp can fetch
 * rich card previews and the store attendants can click to see the photo.
 */
export function getProductFullImageUrl(product: Product): string {
  // Public production base URL fallback if testing locally
  const LIVE_URL = 'https://ais-pre-m4si6n475hb3xrmter2hdu-575816584724.us-east1.run.app';

  let baseUrl = LIVE_URL;
  if (typeof window !== 'undefined' && window.location) {
    const origin = window.location.origin;
    // Only use local origin if it's not localhost/127.0.0.1 (since external WhatsApp clients cannot reach localhost)
    if (!origin.includes('localhost') && !origin.includes('127.0.0.1')) {
      baseUrl = origin.replace(/\/+$/, '');
    }
  }

  // 1. Check clean public mapped path
  const publicPath = CLEAN_PRODUCT_IMAGES[product.id];
  if (publicPath) {
    return `${baseUrl}${publicPath}`;
  }

  // 2. Check if product.image is already an absolute HTTP URL
  if (product.image && (product.image.startsWith('http://') || product.image.startsWith('https://'))) {
    return product.image;
  }

  // 3. Fallback to cleaning the imported Vite asset path
  if (product.image) {
    const cleanPath = product.image.replace(/^\.?\//, '');
    return `${baseUrl}/${cleanPath}`;
  }

  return '';
}
