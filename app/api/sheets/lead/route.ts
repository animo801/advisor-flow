import { NextResponse, type NextRequest } from 'next/server';
import { answersToSheetRow } from '@/lib/sheets';
import type { Answers } from '@/lib/steps';

// Forwards a completed flow's answers to a Google Apps Script Web App
// (GOOGLE_SHEETS_WEBHOOK_URL) that appends a row to a Google Sheet.
// See lib/sheets.ts for the column order and header text to paste into
// the sheet.
export async function POST(request: NextRequest) {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!webhookUrl) {
    console.error(
      'GOOGLE_SHEETS_WEBHOOK_URL is not set; skipping Google Sheets submission',
    );
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  const answers = (await request.json()) as Answers;

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ row: answersToSheetRow(answers) }),
  });

  if (!response.ok) {
    console.error(
      'Google Sheets webhook request failed',
      response.status,
      await response.text(),
    );
    return NextResponse.json({ ok: false }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
