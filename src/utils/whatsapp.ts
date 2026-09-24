/**
 * WhatsApp integration helpers for Papelaria Boa Vista
 */

export const STORE_WHATSAPP_NUMBER = '553488710753';
export const STORE_WHATSAPP_FORMATTED = '(34) 98871-0753';

/**
 * Creates direct WhatsApp URL.
 * Using api.whatsapp.com/send directly avoids the 302 redirect roundtrip
 * of wa.me, reducing latency and avoiding header truncation issues.
 */
export function buildWhatsAppUrl(messageText: string, phone = STORE_WHATSAPP_NUMBER): string {
  const cleanPhone = phone.replace(/\D/g, '');
  const encodedText = encodeURIComponent(messageText);
  return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
}

/**
 * Creates standard wa.me URL as alternative
 */
export function buildWaMeUrl(messageText: string, phone = STORE_WHATSAPP_NUMBER): string {
  const cleanPhone = phone.replace(/\D/g, '');
  const encodedText = encodeURIComponent(messageText);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}

/**
 * Reliably opens a WhatsApp URL across mobile, desktop, and iframe environments.
 * Uses a programmatic anchor click with fallback, bypassing common iframe and popup blocker issues.
 */
export function openWhatsAppSafely(url: string): boolean {
  try {
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      if (document.body.contains(a)) {
        document.body.removeChild(a);
      }
    }, 200);
    return true;
  } catch (err) {
    console.error('Error opening WhatsApp URL:', err);
    try {
      window.open(url, '_blank', 'noopener,noreferrer');
      return true;
    } catch {
      window.location.href = url;
      return false;
    }
  }
}
