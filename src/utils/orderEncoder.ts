import { CartItem } from '../types';
import { getProductFullImageUrl } from './productUtils';
import { PRODUCTS } from '../data/products';

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
  customerPhone?: string;
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
  customerPhone,
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
  customerPhone?: string;
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
    customerName: customerName.trim() || 'Cliente',
    customerPhone: customerPhone ? customerPhone.trim() : undefined,
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
 * Encodes order payload into an ultra-compact URL-safe base64 string.
 * Keeps the WhatsApp message and PDF links very short (< 300 chars)
 * to avoid URL truncation in WhatsApp and browser address bars.
 */
export function encodeOrder(order: OrderPayload): string {
  try {
    // Ultra-compact JSON format
    const compact = {
      v: 2,
      id: order.orderId,
      dt: order.createdAt,
      n: order.customerName,
      p: order.customerPhone || '',
      m: order.deliveryMethod === 'retirada' ? 'r' : 'e',
      nt: order.neighborhoodType === 'boa_vista' ? 'b' : 'o',
      cn: order.customNeighborhood || '',
      ad: order.addressOrNotes || '',
      it: order.items.map((i) => [i.id, i.quantity, i.price]),
    };
    const json = JSON.stringify(compact);
    const base64 = btoa(
      encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (_, p1) => {
        return String.fromCharCode(parseInt(p1, 16));
      })
    );
    return encodeURIComponent(base64);
  } catch (err) {
    console.error('Error encoding order:', err);
    return encodeURIComponent(JSON.stringify(order));
  }
}

/**
 * Decodes order payload from a URL parameter.
 * Handles both the ultra-compact v2 format and legacy full format.
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
    const data = JSON.parse(jsonStr);

    // If compact format (v: 2 or contains compact field keys)
    if (data.v === 2 || data.m) {
      const items: OrderPayloadItem[] = (data.it || []).map(
        ([id, quantity, customPrice]: [string, number, number?]) => {
          const prod = PRODUCTS.find((p) => p.id === id);
          return {
            id,
            name: prod ? prod.name : id,
            tag: prod?.tag,
            quantity: Number(quantity) || 1,
            price: customPrice ?? (prod ? prod.price : 0),
            image: prod ? getProductFullImageUrl(prod) || prod.image : '',
          };
        }
      );

      const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const deliveryMethod: 'retirada' | 'entrega' = data.m === 'r' ? 'retirada' : 'entrega';
      const neighborhoodType: 'boa_vista' | 'outros' = data.nt === 'o' ? 'outros' : 'boa_vista';
      const deliveryFee =
        deliveryMethod === 'retirada' ? 0.0 : neighborhoodType === 'boa_vista' ? 0.0 : 7.0;
      const grandTotal = subtotal + deliveryFee;

      return {
        orderId: data.id || 'PBV-000000',
        createdAt: data.dt || 'Hoje',
        customerName: data.n || 'Cliente',
        customerPhone: data.p || undefined,
        deliveryMethod,
        neighborhoodType,
        customNeighborhood: data.cn || '',
        addressOrNotes: data.ad || '',
        items,
        subtotal,
        deliveryFee,
        grandTotal,
      };
    }

    // Fallback: Legacy full format
    return data as OrderPayload;
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

