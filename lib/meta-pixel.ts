/** Shared between the client-side Meta Pixel script and the server-side Conversions API. */
export const META_PIXEL_ID = '1846400513434397';

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

function getCookie(name: string): string | undefined {
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1]) : undefined;
}

/**
 * Fires a Meta "Lead" event from the browser (via the Pixel) and the server
 * (via the Conversions API) with a shared event ID so Meta dedupes them into
 * a single event. Call this once, right when a lead is captured.
 */
export function trackLead(data: { phone: string; name?: string }) {
  const eventId = crypto.randomUUID();

  window.fbq?.('track', 'Lead', {}, { eventID: eventId });

  fetch('/api/capi/lead', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventId,
      eventSourceUrl: window.location.href,
      phone: data.phone,
      fbp: getCookie('_fbp'),
      fbc: getCookie('_fbc'),
    }),
    keepalive: true,
  }).catch(() => {
    // Best-effort: a failed CAPI call shouldn't block the user's flow.
  });

  return eventId;
}
