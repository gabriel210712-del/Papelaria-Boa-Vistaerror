import { CartItem } from '../types';
import { getProductFullImageUrl } from './productUtils';

export interface OrderPayloadItem {
  id: string;
  name: string;
  tag?: string;
  quantity: number;
  price: number;
  image: string;
}

export interface OrderPayload {
  orderId: string;
  createdAt: string;
  customerName: string;
  deliveryMethod: 'retirada' | 'entrega';
  neighborhoodType?: 'boa_vista' | 'outros';
  customNeighborhood?: string;
  addressOrNotes?: string;
  items: OrderPayloadItem[];
  subtotal: number;
  deliveryFee: number;
  grandTotal: number;
}

/**
 * Creates an OrderPayload from current cart state.
 */
export function buildOrderPayload({
  customerName,
  deliveryMethod,
  neighborhoodType,
  customNeighborhood,
  addressOrNotes,
  items,
  total,
  deliveryFee,
  grandTotal,
}: {
  customerName: string;
  deliveryMethod: 'retirada' | 'entrega';
  neighborhoodType: 'boa_vista' | 'outros';
  customNeighborhood: string;
  addressOrNotes: string;
  items: CartItem[];
  total: number;
  deliveryFee: number;
  grandTotal: number;
}): OrderPayload {
  // Generate friendly sequential-style order ID with timestamp digits
  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const idDigits = (now.getTime() % 1000000).toString().padStart(6, '0');
  const orderId = `PBV-${idDigits}`;

  const payloadItems: OrderPayloadItem[] = items.map((item) => ({
    id: item.product.id,
    name: item.product.name,
    tag: item.product.tag,
    quantity: item.quantity,
    price: item.product.price,
    image: getProductFullImageUrl(item.product) || item.product.image,
  }));

  return {
    orderId,
    createdAt: `${dateStr} às ${timeStr}`,
    customerName: customerName.trim(),
    deliveryMethod,
    neighborhoodType,
    customNeighborhood: customNeighborhood.trim(),
    addressOrNotes: addressOrNotes.trim(),
    items: payloadItems,
    subtotal: total,
    deliveryFee,
    grandTotal,
  };
}

/**
 * Encodes order payload into a URL-safe base64 string.
 */
export function encodeOrder(order: OrderPayload): string {
  try {
    const json = JSON.stringify(order);
    // UTF-8 to safe base64
    const base64 = btoa(encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (_, p1) => {
      return String.fromCharCode(parseInt(p1, 16));
    }));
    return encodeURIComponent(base64);
  } catch (err) {
    console.error('Error encoding order:', err);
    return encodeURIComponent(JSON.stringify(order));
  }
}

/**
 * Decodes order payload from a URL parameter.
 */
export function decodeOrder(param: string): OrderPayload | null {
  try {
    const unencoded = decodeURIComponent(param);
    let jsonStr = '';
    try {
      // Decode base64 to UTF-8
      const binary = atob(unencoded);
      jsonStr = decodeURIComponent(
        Array.prototype.map
          .call(binary, (ch: string) => '%' + ('00' + ch.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
    } catch {
      // Fallback if raw JSON was passed
      jsonStr = unencoded;
    }
    return JSON.parse(jsonStr) as OrderPayload;
  } catch (err) {
    console.error('Failed to decode order payload:', err);
    return null;
  }
}

/**
 * Generates the full public URL to view and print the order in PDF.
 */
export function getOrderPrintUrl(order: OrderPayload, autoPrint = false): string {
  const LIVE_URL = 'https://ais-pre-m4si6n475hb3xrmter2hdu-575816584724.us-east1.run.app';
  let baseUrl = LIVE_URL;
  if (typeof window !== 'undefined' && window.location) {
    const origin = window.location.origin;
    if (!origin.includes('localhost') && !origin.includes('127.0.0.1')) {
      baseUrl = origin.replace(/\/+$/, '');
    }
  }

  const encoded = encodeOrder(order);
  const printParam = autoPrint ? '&imprimir=1' : '';
  return `${baseUrl}/?pedido=${encoded}${printParam}`;
}
