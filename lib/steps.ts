export const ACCOUNT_OPTIONS = [
  '401(k) / 403(b)',
  'Traditional IRA',
  'Roth IRA',
  'Pension',
  'Brokerage account',
  'Other',
];

export const DEMO_CODE = '123456';

export const LOADING_DURATION_MS = 5000;
export const LOADING_MESSAGES = [
  'Analyzing your accounts...',
  'Building your plan...',
];

export function randomMessageOffsets(count: number, total: number) {
  const offsets = Array.from(
    { length: count - 1 },
    () => Math.random() * total * 0.7 + total * 0.1,
  );
  return offsets.sort((a, b) => a - b);
}

export type Answers = {
  retirementAge?: string;
  currentAge?: string;
  name?: string;
  income?: string;
  married?: string;
  spouseName?: string;
  spouseAge?: string;
  accounts?: string[];
  accountBalances?: Record<string, string>;
  spouseAccounts?: string[];
  spouseAccountBalances?: Record<string, string>;
  phone?: string;
  code?: string;
};

export function patchOf<K extends keyof Answers>(
  key: K,
  value: Answers[K],
): Partial<Answers> {
  return { [key]: value } as Pick<Answers, K>;
}

export type StepKind = 'number' | 'currency' | 'text' | 'phone';

export type BaseStep = {
  key: keyof Answers;
  question: string | ((a: Answers) => string);
  when?: (a: Answers) => boolean;
};
export type InputStep = BaseStep & {
  type: 'input';
  kind: StepKind;
  placeholder: string;
};
export type ChoiceStep = BaseStep & { type: 'choice'; options: string[] };
export type MultiselectStep = BaseStep & {
  type: 'multiselect';
  options: string[];
};
export type BalanceStep = BaseStep & {
  type: 'balance';
  accountsKey: 'accounts' | 'spouseAccounts';
};
export type CodeStep = BaseStep & { type: 'code' };
export type StepDef =
  | InputStep
  | ChoiceStep
  | MultiselectStep
  | BalanceStep
  | CodeStep;

export const steps: StepDef[] = [
  {
    type: 'input',
    kind: 'number',
    key: 'retirementAge',
    question: 'When do you hope to retire?',
    placeholder: 'Enter your target retirement age',
  },
  {
    type: 'input',
    kind: 'number',
    key: 'currentAge',
    question: 'How old are you today?',
    placeholder: 'Enter your current age',
  },
  {
    type: 'input',
    kind: 'text',
    key: 'name',
    question: 'What is your name?',
    placeholder: 'Enter your full name',
  },
  {
    type: 'input',
    kind: 'currency',
    key: 'income',
    question: 'What is your annual income?',
    placeholder: 'Enter your annual income',
  },
  {
    type: 'choice',
    key: 'married',
    question: 'Are you married?',
    options: ['Yes', 'No'],
  },
  {
    type: 'input',
    kind: 'text',
    key: 'spouseName',
    question: "What is your spouse's name?",
    placeholder: "Enter your spouse's name",
    when: (a) => a.married === 'Yes',
  },
  {
    type: 'input',
    kind: 'number',
    key: 'spouseAge',
    question: (a) => `How old is ${a.spouseName || 'your spouse'}?`,
    placeholder: "Enter your spouse's age",
    when: (a) => a.married === 'Yes',
  },
  {
    type: 'multiselect',
    key: 'accounts',
    question: 'Which retirement accounts do you have?',
    options: ACCOUNT_OPTIONS,
  },
  {
    type: 'balance',
    key: 'accountBalances',
    question: "What's the balance in each account?",
    accountsKey: 'accounts',
    when: (a) => (a.accounts?.length ?? 0) > 0,
  },
  {
    type: 'multiselect',
    key: 'spouseAccounts',
    question: (a) =>
      `Which retirement accounts does ${a.spouseName || 'your spouse'} have?`,
    options: ACCOUNT_OPTIONS,
    when: (a) => a.married === 'Yes',
  },
  {
    type: 'balance',
    key: 'spouseAccountBalances',
    question: (a) =>
      `What's the balance in each of ${a.spouseName ? `${a.spouseName}'s` : "your spouse's"} accounts?`,
    accountsKey: 'spouseAccounts',
    when: (a) => a.married === 'Yes' && (a.spouseAccounts?.length ?? 0) > 0,
  },
  {
    type: 'input',
    kind: 'phone',
    key: 'phone',
    question: 'What is your phone number?',
    placeholder: '(555) 555-5555',
  },
  {
    type: 'code',
    key: 'code',
    question: 'Enter the verification code',
  },
];

export function isVisible(step: StepDef, a: Answers) {
  return !step.when || step.when(a);
}

export function resolveQuestion(step: StepDef, a: Answers) {
  return typeof step.question === 'function' ? step.question(a) : step.question;
}

/** Derives a stable URL slug from a step's key, e.g. "spouseAge" -> "spouse-age". */
export function slugFor(key: keyof Answers) {
  return key.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

export function visibleSteps(a: Answers) {
  return steps.filter((s) => isVisible(s, a));
}

export function nextVisibleIndex(from: number, a: Answers) {
  let i = from;
  while (i < steps.length && !isVisible(steps[i], a)) i++;
  return i;
}
