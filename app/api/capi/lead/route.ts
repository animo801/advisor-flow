import { createHash } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { META_PIXEL_ID } from '@/lib/meta-pixel';

const GRAPH_API_VERSION = 'v21.0';

function hash(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

type LeadPayload = {
  eventId?: string;
  eventSourceUrl?: string;
  phone?: string;
  fbp?: string;
  fbc?: string;
};

// Sends a server-side "Lead" event to the Meta Conversions API, matched to
// the browser-side Pixel event via a shared event ID (see lib/meta-pixel.ts).
export async function POST(request: NextRequest) {
  const accessToken = process.env.FACEBOOK_CAPI_CODE;
  if (!accessToken) {
    console.error('FACEBOOK_CAPI_CODE is not set; skipping Meta CAPI event');
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  const { eventId, eventSourceUrl, phone, fbp, fbc } =
    (await request.json()) as LeadPayload;

  if (!eventId) {
    return NextResponse.json(
      { ok: false, error: 'eventId is required' },
      { status: 400 },
    );
  }

  const clientIpAddress =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    undefined;
  const clientUserAgent = request.headers.get('user-agent') ?? undefined;

  const userData: Record<string, unknown> = {};
  if (phone) userData.ph = [hash(phone.replace(/\D/g, ''))];
  if (fbp) userData.fbp = fbp;
  if (fbc) userData.fbc = fbc;
  if (clientIpAddress) userData.client_ip_address = clientIpAddress;
  if (clientUserAgent) userData.client_user_agent = clientUserAgent;

  const testEventCode = process.env.FACEBOOK_CAPI_TEST_EVENT_CODE;

  const response = await fetch(
    `https://graph.facebook.com/${GRAPH_API_VERSION}/${META_PIXEL_ID}/events?access_token=${accessToken}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [
          {
            event_name: 'Lead',
            event_time: Math.floor(Date.now() / 1000),
            event_id: eventId,
            event_source_url: eventSourceUrl,
            action_source: 'website',
            user_data: userData,
          },
        ],
        // Routes events to Events Manager's Test Events tab instead of
        // counting them as real conversions. Unset FACEBOOK_CAPI_TEST_EVENT_CODE
        // in .env.local once testing is done so production events count normally.
        ...(testEventCode ? { test_event_code: testEventCode } : {}),
      }),
    },
  );

  const result = await response.json();

  if (!response.ok) {
    console.error('Meta CAPI request failed', response.status, result);
    return NextResponse.json({ ok: false }, { status: 502 });
  }

  return NextResponse.json({ ok: true, result });
}
