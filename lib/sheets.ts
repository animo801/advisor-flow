import type { Answers } from './steps';

/**
 * Column headers for the Google Sheet, in the exact order `answersToSheetRow`
 * produces values in. Paste this row (tab-separated) into row 1 of the sheet.
 */
export const SHEET_COLUMNS = [
  'Timestamp',
  'Name',
  'Phone',
  'Current Age',
  'Retirement Age',
  'Annual Income',
  'Familiar with Baby Steps',
  'Baby Step',
  'Married',
  'Spouse Name',
  'Spouse Age',
  'Retirement Accounts',
  'Retirement Account Balances',
  'Spouse Retirement Accounts',
  'Spouse Retirement Account Balances',
] as const;

function formatBalances(
  accounts: string[] | undefined,
  balances: Record<string, string> | undefined,
) {
  if (!accounts?.length) return '';
  return accounts
    .map((account) => {
      const amount = balances?.[account];
      return `${account}: $${amount ? Number(amount).toLocaleString('en-US') : '0'}`;
    })
    .join('; ');
}

/** Flattens a completed flow's answers into a row matching SHEET_COLUMNS. */
export function answersToSheetRow(answers: Answers): string[] {
  return [
    new Date().toISOString(),
    answers.name ?? '',
    answers.phone ?? '',
    answers.currentAge ?? '',
    answers.retirementAge ?? '',
    answers.income ?? '',
    answers.babyStepsFamiliar ?? '',
    answers.babyStep ?? '',
    answers.married ?? '',
    answers.spouseName ?? '',
    answers.spouseAge ?? '',
    answers.accounts?.join('; ') ?? '',
    formatBalances(answers.accounts, answers.accountBalances),
    answers.spouseAccounts?.join('; ') ?? '',
    formatBalances(answers.spouseAccounts, answers.spouseAccountBalances),
  ];
}

/**
 * Sends a completed flow's answers to the Google Sheet via our API route.
 * Best-effort: a failed submission shouldn't block the user's flow.
 */
export function submitLeadToSheet(answers: Answers) {
  fetch('/api/sheets/lead', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(answers),
    keepalive: true,
  }).catch(() => {
    // Best-effort: swallow network errors.
  });
}
