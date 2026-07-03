"use client";

import { useEffect, useState } from "react";

const imgLogo = "https://www.figma.com/api/mcp/asset/37218501-e071-4afa-84d3-4a75da96588e";
const imgAdvisor = "https://www.figma.com/api/mcp/asset/108c723c-d02d-494d-ad5f-aa0fc5303f86";
const imgDonut = "https://www.figma.com/api/mcp/asset/c5b20b37-bd29-431c-897f-36a2a987a2e0";
const imgLineBlue = "https://www.figma.com/api/mcp/asset/f198bbed-4169-4190-85e8-a87d64018ec7";
const imgLineCyan = "https://www.figma.com/api/mcp/asset/084a2f81-5ee5-4323-97bf-2d0fdd14fcc4";
const imgLineTeal = "https://www.figma.com/api/mcp/asset/716eb3fb-3746-4d69-917d-67af56eb54c3";
const imgLineAlt = "https://www.figma.com/api/mcp/asset/e02e1a9c-5d64-493c-a6c1-8119b4610385";

const ACCOUNT_OPTIONS = [
  "401(k) / 403(b)",
  "Traditional IRA",
  "Roth IRA",
  "Pension",
  "Brokerage account",
  "Other",
];

const DEMO_CODE = "123456";

const LOADING_DURATION_MS = 5000;
const LOADING_MESSAGES = ["Analyzing your accounts...", "Building your plan..."];

function randomMessageOffsets(count: number, total: number) {
  const offsets = Array.from({ length: count - 1 }, () => Math.random() * total * 0.7 + total * 0.1);
  return offsets.sort((a, b) => a - b);
}

type Answers = {
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

function patchOf<K extends keyof Answers>(key: K, value: Answers[K]): Partial<Answers> {
  return { [key]: value } as Pick<Answers, K>;
}

type StepKind = "number" | "currency" | "text" | "phone";

type BaseStep = { key: keyof Answers; question: string; when?: (a: Answers) => boolean };
type InputStep = BaseStep & { type: "input"; kind: StepKind; placeholder: string };
type ChoiceStep = BaseStep & { type: "choice"; options: string[] };
type MultiselectStep = BaseStep & { type: "multiselect"; options: string[] };
type BalanceStep = BaseStep & { type: "balance"; accountsKey: "accounts" | "spouseAccounts" };
type CodeStep = BaseStep & { type: "code" };
type StepDef = InputStep | ChoiceStep | MultiselectStep | BalanceStep | CodeStep;

const steps: StepDef[] = [
  {
    type: "input",
    kind: "number",
    key: "retirementAge",
    question: "When do you hope to retire?",
    placeholder: "Enter your target retirement age",
  },
  {
    type: "input",
    kind: "number",
    key: "currentAge",
    question: "How old are you today?",
    placeholder: "Enter your current age",
  },
  {
    type: "input",
    kind: "text",
    key: "name",
    question: "What is your name?",
    placeholder: "Enter your full name",
  },
  {
    type: "input",
    kind: "currency",
    key: "income",
    question: "What is your annual income?",
    placeholder: "Enter your annual income",
  },
  {
    type: "choice",
    key: "married",
    question: "Are you married?",
    options: ["Yes", "No"],
  },
  {
    type: "input",
    kind: "text",
    key: "spouseName",
    question: "What is your spouse's name?",
    placeholder: "Enter your spouse's name",
    when: (a) => a.married === "Yes",
  },
  {
    type: "input",
    kind: "number",
    key: "spouseAge",
    question: "How old is your spouse?",
    placeholder: "Enter your spouse's age",
    when: (a) => a.married === "Yes",
  },
  {
    type: "multiselect",
    key: "accounts",
    question: "Which retirement accounts do you have?",
    options: ACCOUNT_OPTIONS,
  },
  {
    type: "balance",
    key: "accountBalances",
    question: "What's the balance in each account?",
    accountsKey: "accounts",
    when: (a) => (a.accounts?.length ?? 0) > 0,
  },
  {
    type: "multiselect",
    key: "spouseAccounts",
    question: "Which retirement accounts does your spouse have?",
    options: ACCOUNT_OPTIONS,
    when: (a) => a.married === "Yes",
  },
  {
    type: "balance",
    key: "spouseAccountBalances",
    question: "What's the balance in each of your spouse's accounts?",
    accountsKey: "spouseAccounts",
    when: (a) => a.married === "Yes" && (a.spouseAccounts?.length ?? 0) > 0,
  },
  {
    type: "input",
    kind: "phone",
    key: "phone",
    question: "What is your phone number?",
    placeholder: "(555) 555-5555",
  },
  {
    type: "code",
    key: "code",
    question: "Enter the verification code",
  },
];

function isVisible(step: StepDef, a: Answers) {
  return !step.when || step.when(a);
}

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="bg-[#d9d9d9] rounded-full" style={{ width: "100%", height: 4 }}>
      <div
        className="bg-[#57c5cb] rounded-full transition-all duration-300"
        style={{ height: 4, width: `${progress * 100}%` }}
      />
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center text-black font-black rounded-lg bg-[#d9d9d9]/30 hover:bg-[#d9d9d9]/50 cursor-pointer transition-colors"
      style={{ width: 120, height: 56, fontSize: 18 }}
    >
      Back
    </button>
  );
}

function ContinueButton({
  onClick,
  disabled,
  label = "Continue",
}: {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center justify-center text-white font-black rounded-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
      style={{ width: 160, height: 56, backgroundColor: "#249ba2", fontSize: 18 }}
    >
      {label}
    </button>
  );
}

function StepShell({
  progress,
  question,
  children,
  footer,
}: {
  progress: number;
  question: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="relative mx-auto w-full" style={{ maxWidth: 480, paddingTop: 175, paddingBottom: 80 }}>
      <ProgressBar progress={progress} />
      <h2
        className="text-black font-black"
        style={{ marginTop: 35, fontSize: 48, lineHeight: "60px" }}
      >
        {question}
      </h2>
      <div className="flex flex-col gap-4" style={{ marginTop: 45 }}>
        {children}
      </div>
      <div className="flex items-center justify-between" style={{ marginTop: 24 }}>
        {footer}
      </div>
    </div>
  );
}

function formatForKind(raw: string, kind: StepKind) {
  if (kind === "currency") return raw ? Number(raw).toLocaleString("en-US") : "";
  if (kind === "phone") {
    const area = raw.slice(0, 3);
    const mid = raw.slice(3, 6);
    const last = raw.slice(6, 10);
    if (raw.length > 6) return `(${area}) ${mid}-${last}`;
    if (raw.length > 3) return `(${area}) ${mid}`;
    if (raw.length > 0) return `(${area}`;
    return "";
  }
  return raw;
}

function InputScreen({
  step,
  progress,
  onSubmit,
  onBack,
}: {
  step: InputStep;
  progress: number;
  onSubmit: (value: string) => void;
  onBack: () => void;
}) {
  const [raw, setRaw] = useState("");
  const canSubmit = step.kind === "text" ? raw.trim() !== "" : step.kind === "phone" ? raw.length === 10 : raw !== "";

  function submit() {
    if (!canSubmit) return;
    onSubmit(raw);
  }

  return (
    <StepShell
      progress={progress}
      question={step.question}
      footer={
        <>
          <BackButton onClick={onBack} />
          <ContinueButton onClick={submit} disabled={!canSubmit} />
        </>
      }
    >
      <div className="relative">
        {step.kind === "currency" && (
          <span
            className="absolute inset-y-0 left-6 flex items-center text-black font-black pointer-events-none"
            style={{ fontSize: 24 }}
          >
            $
          </span>
        )}
        <input
          type="text"
          inputMode={step.kind === "text" ? "text" : "numeric"}
          autoFocus
          value={formatForKind(raw, step.kind)}
          placeholder={step.placeholder}
          onChange={(e) => {
            const next = step.kind === "text" ? e.target.value : e.target.value.replace(/[^0-9]/g, "");
            setRaw(step.kind === "phone" ? next.slice(0, 10) : next);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          className="w-full text-left text-black font-black rounded-md bg-[#d9d9d9]/30 placeholder:font-normal placeholder:text-black/40 outline-none focus:bg-[#d9d9d9]/50 transition-colors"
          style={{ height: 80, fontSize: 24, paddingLeft: step.kind === "currency" ? 40 : 24 }}
        />
      </div>
    </StepShell>
  );
}

function ChoiceScreen({
  step,
  progress,
  onSelect,
  onBack,
}: {
  step: ChoiceStep;
  progress: number;
  onSelect: (value: string) => void;
  onBack: () => void;
}) {
  return (
    <StepShell progress={progress} question={step.question} footer={<BackButton onClick={onBack} />}>
      {step.options.map((option) => (
        <button
          key={option}
          onClick={() => onSelect(option)}
          className="w-full flex items-center rounded-md bg-[#d9d9d9]/30 hover:bg-[#d9d9d9]/50 text-left text-black font-black transition-colors cursor-pointer"
          style={{ height: 80, fontSize: 24, paddingLeft: 24 }}
        >
          {option}
        </button>
      ))}
    </StepShell>
  );
}

function MultiselectScreen({
  step,
  progress,
  onSubmit,
  onBack,
}: {
  step: MultiselectStep;
  progress: number;
  onSubmit: (value: string[]) => void;
  onBack: () => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(option: string) {
    setSelected((prev) => (prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]));
  }

  return (
    <StepShell
      progress={progress}
      question={step.question}
      footer={
        <>
          <BackButton onClick={onBack} />
          <ContinueButton onClick={() => onSubmit(selected)} />
        </>
      }
    >
      {step.options.map((option) => {
        const isSelected = selected.includes(option);
        return (
          <button
            key={option}
            onClick={() => toggle(option)}
            className={`w-full flex items-center justify-between rounded-md text-left text-black font-black transition-colors cursor-pointer border-2 ${
              isSelected ? "bg-[#249ba2]/10 border-[#249ba2]" : "bg-[#d9d9d9]/30 border-transparent hover:bg-[#d9d9d9]/50"
            }`}
            style={{ height: 80, fontSize: 24, paddingLeft: 24, paddingRight: 24 }}
          >
            {option}
            <span
              className={`flex items-center justify-center rounded-full border-2 shrink-0 ${
                isSelected ? "bg-[#249ba2] border-[#249ba2] text-white" : "border-black/20 text-transparent"
              }`}
              style={{ width: 24, height: 24, fontSize: 14 }}
            >
              ✓
            </span>
          </button>
        );
      })}
    </StepShell>
  );
}

function BalanceScreen({
  step,
  accounts,
  progress,
  onSubmit,
  onBack,
}: {
  step: BalanceStep;
  accounts: string[];
  progress: number;
  onSubmit: (value: Record<string, string>) => void;
  onBack: () => void;
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  const canSubmit = accounts.every((a) => (values[a] ?? "") !== "");

  return (
    <StepShell
      progress={progress}
      question={step.question}
      footer={
        <>
          <BackButton onClick={onBack} />
          <ContinueButton onClick={() => onSubmit(values)} disabled={!canSubmit} />
        </>
      }
    >
      {accounts.map((account) => (
        <div key={account} className="flex flex-col gap-2">
          <label className="text-black font-black" style={{ fontSize: 14 }}>
            {account}
          </label>
          <div className="relative">
            <span
              className="absolute inset-y-0 left-6 flex items-center text-black font-black pointer-events-none"
              style={{ fontSize: 24 }}
            >
              $
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={values[account] ? Number(values[account]).toLocaleString("en-US") : ""}
              placeholder="0"
              onChange={(e) =>
                setValues((prev) => ({ ...prev, [account]: e.target.value.replace(/[^0-9]/g, "") }))
              }
              className="w-full text-left text-black font-black rounded-md bg-[#d9d9d9]/30 placeholder:font-normal placeholder:text-black/40 outline-none focus:bg-[#d9d9d9]/50 transition-colors"
              style={{ height: 80, fontSize: 24, paddingLeft: 40 }}
            />
          </div>
        </div>
      ))}
    </StepShell>
  );
}

function CodeScreen({
  progress,
  onSubmit,
  onBack,
}: {
  progress: number;
  onSubmit: () => void;
  onBack: () => void;
}) {
  const [raw, setRaw] = useState("");
  const [error, setError] = useState(false);

  function submit() {
    if (raw.length !== 6) return;
    if (raw === DEMO_CODE) {
      onSubmit();
    } else {
      setError(true);
    }
  }

  return (
    <StepShell
      progress={progress}
      question="Enter the verification code"
      footer={
        <>
          <BackButton onClick={onBack} />
          <ContinueButton onClick={submit} disabled={raw.length !== 6} label="Verify" />
        </>
      }
    >
      <p className="text-black/60 font-normal" style={{ fontSize: 16 }}>
        We sent a 6-digit code to your phone. (Demo mode: use {DEMO_CODE}.)
      </p>
      <input
        type="text"
        inputMode="numeric"
        autoFocus
        value={raw}
        placeholder="123456"
        onChange={(e) => {
          setError(false);
          setRaw(e.target.value.replace(/[^0-9]/g, "").slice(0, 6));
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
        }}
        className="w-full text-left text-black font-black rounded-md bg-[#d9d9d9]/30 placeholder:font-normal placeholder:text-black/40 outline-none focus:bg-[#d9d9d9]/50 transition-colors"
        style={{ height: 80, fontSize: 24, paddingLeft: 24 }}
      />
      {error && (
        <p className="text-red-600 font-normal" style={{ fontSize: 14 }}>
          That code didn&apos;t match. Try again.
        </p>
      )}
    </StepShell>
  );
}

function StepRenderer({
  step,
  answers,
  progress,
  onAdvance,
  onBack,
}: {
  step: StepDef;
  answers: Answers;
  progress: number;
  onAdvance: (patch: Partial<Answers>) => void;
  onBack: () => void;
}) {
  switch (step.type) {
    case "input":
      return (
        <InputScreen
          step={step}
          progress={progress}
          onSubmit={(value) => onAdvance(patchOf(step.key, value))}
          onBack={onBack}
        />
      );
    case "choice":
      return (
        <ChoiceScreen
          step={step}
          progress={progress}
          onSelect={(value) => onAdvance(patchOf(step.key, value))}
          onBack={onBack}
        />
      );
    case "multiselect":
      return (
        <MultiselectScreen
          step={step}
          progress={progress}
          onSubmit={(value) => onAdvance(patchOf(step.key, value))}
          onBack={onBack}
        />
      );
    case "balance":
      return (
        <BalanceScreen
          step={step}
          accounts={answers[step.accountsKey] ?? []}
          progress={progress}
          onSubmit={(value) => onAdvance(patchOf(step.key, value))}
          onBack={onBack}
        />
      );
    case "code":
      return <CodeScreen progress={progress} onSubmit={() => onAdvance(patchOf(step.key, DEMO_CODE))} onBack={onBack} />;
  }
}

function HeroAndCard({ onStart }: { onStart: () => void }) {
  return (
    <div className="relative mx-auto" style={{ maxWidth: 1280, minHeight: 660 }}>
      {/* Left column: headline + subtext + CTA */}
      <div className="absolute flex flex-col" style={{ left: 102, top: 267, width: 706 }}>
        <h1 className="text-black font-black" style={{ fontSize: 55, lineHeight: "60px" }}>
          Stop dreading retirement. Get a plan from our team.
        </h1>
        <p className="text-black font-normal" style={{ fontSize: 28, lineHeight: "40px", marginTop: 16 }}>
          The best way to have peace of mind is from a plan you believe in from someone who
          believes in you.
        </p>
        <button
          onClick={onStart}
          className="flex items-center justify-center text-white font-black rounded-lg cursor-pointer"
          style={{
            marginTop: 24,
            width: 239,
            height: 64,
            backgroundColor: "#249ba2",
            fontSize: 20,
          }}
        >
          Request a plan
        </button>
      </div>

      {/* Right side card */}
      <div
        className="absolute bg-white border border-[#e8e8e8] rounded-[6px]"
        style={{
          left: 909,
          top: 185,
          width: 347,
          height: 412,
          boxShadow: "0px 10px 19.1px 0px rgba(0,0,0,0.05)",
        }}
      >
        {/* Client name row */}
        <div className="absolute" style={{ left: 16, top: 16 }}>
          <span className="font-black text-black" style={{ fontSize: 18 }}>
            Rob &amp; Molly
          </span>
          <span className="font-black text-black ml-2" style={{ fontSize: 8, opacity: 0.3 }}>
            34 &amp; 35 | Midvale, UT | Kids aged 4 &amp; 1
          </span>
        </div>

        {/* Goals label */}
        <p className="absolute font-black text-black" style={{ left: 16, top: 50, fontSize: 8, opacity: 0.5 }}>
          Goals
        </p>

        {/* Goals headline + bullets */}
        <div className="absolute" style={{ left: 16, top: 60, width: 310 }}>
          <div className="flex items-start gap-4">
            <span className="font-black text-black shrink-0" style={{ fontSize: 18 }}>
              Retire at 65 &amp; 66
            </span>
            <ul
              className="list-disc font-black text-black shrink-0"
              style={{ fontSize: 6, paddingLeft: 10, width: 148, marginTop: 6 }}
            >
              <li className="mb-1">Pay for kids college, weddings, missions &amp; help with first home</li>
              <li>Build a house or addition on current home</li>
            </ul>
          </div>
        </div>

        {/* Section labels row */}
        <div className="absolute flex justify-between" style={{ left: 16, top: 104, width: 310 }}>
          <span className="font-black text-black" style={{ fontSize: 8 }}>
            Current asset breakdown
          </span>
          <span className="font-black text-black" style={{ fontSize: 8 }}>
            Outlook
          </span>
        </div>

        {/* Asset breakdown panel */}
        <div
          className="absolute bg-[#d9d9d9] rounded-[2px]"
          style={{ left: 16, top: 118, width: 208, height: 99, opacity: 0.2 }}
        />

        {/* Donut chart */}
        <div className="absolute" style={{ left: 28, top: 125, width: 79, height: 79 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="Asset donut chart" src={imgDonut} className="w-full h-full" />
        </div>
        <span className="absolute font-black text-black" style={{ left: 44, top: 156, fontSize: 14.5 }}>
          $421k
        </span>

        {/* Legend */}
        <div className="absolute" style={{ left: 115, top: 145 }}>
          <div className="flex items-start gap-2 mb-2">
            <div className="shrink-0 mt-[1px]" style={{ width: 8, height: 8, backgroundColor: "#52b9e9" }} />
            <p style={{ fontSize: 6, width: 88 }} className="font-black text-black leading-tight">
              <span>Roth IRA @ $151k </span>
              <span className="font-normal">as of June 30th, 2026</span>
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="shrink-0 mt-[1px]" style={{ width: 8, height: 8, backgroundColor: "#57c5cb" }} />
            <p style={{ fontSize: 6, width: 88 }} className="font-black text-black leading-tight">
              <span>Traditional IRA @ $151k </span>
              <span className="font-normal">as of June 30th, 2026</span>
            </p>
          </div>
        </div>

        {/* Outlook text */}
        <p
          className="absolute font-black text-black"
          style={{ left: 233, top: 124, width: 103, fontSize: 6, lineHeight: "1.4" }}
        >
          Expecting a shortfall of $1m to accomplish the goals you want.
        </p>

        {/* How changes can look label */}
        <p className="absolute font-black text-black" style={{ left: 16, top: 233, fontSize: 8 }}>
          How changes can look
        </p>

        {/* Line chart panel */}
        <div
          className="absolute bg-[#d9d9d9] rounded-[2px]"
          style={{ left: 16, top: 247, width: 208, height: 99, opacity: 0.2 }}
        />

        {/* Y-axis labels */}
        <div className="absolute text-right" style={{ left: 16, top: 247, width: 36 }}>
          <p className="font-black text-black" style={{ fontSize: 4, opacity: 0.3, marginTop: 0 }}>
            $3m
          </p>
          <p className="font-black text-black" style={{ fontSize: 4, opacity: 0.3, marginTop: 12 }}>
            $2m
          </p>
          <p className="font-black text-black" style={{ fontSize: 4, opacity: 0.3, marginTop: 12 }}>
            $1m
          </p>
        </div>

        {/* Chart lines */}
        <div className="absolute" style={{ left: 48, top: 259, width: 143.5, height: 73 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="" src={imgLineBlue} className="absolute inset-0 w-full h-full" />
        </div>
        <div className="absolute" style={{ left: 48, top: 267, width: 144, height: 56 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="" src={imgLineTeal} className="absolute inset-0 w-full h-full" />
        </div>
        <div className="absolute" style={{ left: 48, top: 296, width: 143.5, height: 26.6 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="" src={imgLineCyan} className="absolute inset-0 w-full h-full" />
        </div>
        <div className="absolute" style={{ left: 48, top: 296, width: 143.5, height: 26.6 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="" src={imgLineAlt} className="absolute inset-0 w-full h-full" />
        </div>
      </div>

      {/* Advisor photo — overlaps card bottom-right */}
      <div className="absolute rounded-[6px] overflow-hidden" style={{ left: 1097, top: 362, width: 194, height: 291 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="Financial advisor" src={imgAdvisor} className="w-full h-full object-cover" />
      </div>
    </div>
  );
}

function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [filled, setFilled] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const [offsets] = useState(() => randomMessageOffsets(LOADING_MESSAGES.length, LOADING_DURATION_MS));

  useEffect(() => {
    const raf = requestAnimationFrame(() => setFilled(true));
    const finishTimer = setTimeout(onDone, LOADING_DURATION_MS);
    const messageTimers = offsets.map((delay, i) => setTimeout(() => setMessageIndex(i + 1), delay));
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(finishTimer);
      messageTimers.forEach(clearTimeout);
    };
  }, [onDone, offsets]);

  return (
    <div className="relative mx-auto text-center" style={{ maxWidth: 480, paddingTop: 300, paddingBottom: 80 }}>
      <div className="bg-[#d9d9d9] rounded-full" style={{ width: "100%", height: 8 }}>
        <div
          className="bg-[#57c5cb] rounded-full"
          style={{ height: 8, width: filled ? "100%" : "0%", transition: `width ${LOADING_DURATION_MS}ms linear` }}
        />
      </div>
      <p className="text-black font-black" style={{ marginTop: 24, fontSize: 20 }}>
        {LOADING_MESSAGES[messageIndex]}
      </p>
    </div>
  );
}

function DoneScreen({ onRestart }: { onRestart: () => void }) {
  return (
    <div className="relative mx-auto text-center" style={{ maxWidth: 480, paddingTop: 300, paddingBottom: 80 }}>
      <h2 className="text-black font-black" style={{ fontSize: 40, lineHeight: "48px" }}>
        Thanks! We&apos;ll be in touch with your plan.
      </h2>
      <button
        onClick={onRestart}
        className="flex items-center justify-center text-white font-black rounded-lg cursor-pointer mx-auto"
        style={{ marginTop: 32, width: 239, height: 64, backgroundColor: "#249ba2", fontSize: 20 }}
      >
        Back to home
      </button>
    </div>
  );
}

export default function Home() {
  const [stage, setStage] = useState<"hero" | "flow" | "loading" | "done">("hero");
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});

  function nextVisible(from: number, a: Answers) {
    let i = from;
    while (i < steps.length && !isVisible(steps[i], a)) i++;
    return i;
  }

  function prevVisible(from: number, a: Answers) {
    let i = from;
    while (i >= 0 && !isVisible(steps[i], a)) i--;
    return i;
  }

  function start() {
    setAnswers({});
    setStepIndex(nextVisible(0, {}));
    setStage("flow");
  }

  function advance(patch: Partial<Answers>) {
    const merged = { ...answers, ...patch };
    setAnswers(merged);
    const next = nextVisible(stepIndex + 1, merged);
    if (next >= steps.length) {
      setStage("loading");
    } else {
      setStepIndex(next);
    }
  }

  function back() {
    const prev = prevVisible(stepIndex - 1, answers);
    if (prev < 0) {
      setStage("hero");
    } else {
      setStepIndex(prev);
    }
  }

  const current = steps[stepIndex];
  const visibleSteps = steps.filter((s) => isVisible(s, answers));
  const position = current ? visibleSteps.findIndex((s) => s.key === current.key) : 0;
  const progress = visibleSteps.length ? (position + 1) / visibleSteps.length : 1;

  return (
    <div className="relative min-h-screen bg-white overflow-x-clip font-sans">
      {/* Logo */}
      <div className="absolute left-6 top-2 h-[50px] w-[78px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="Logo" src={imgLogo} className="h-full w-full object-cover" />
      </div>

      {stage === "hero" && <HeroAndCard onStart={start} />}
      {stage === "flow" && current && (
        <StepRenderer
          key={stepIndex}
          step={current}
          answers={answers}
          progress={progress}
          onAdvance={advance}
          onBack={back}
        />
      )}
      {stage === "loading" && <LoadingScreen onDone={() => setStage("done")} />}
      {stage === "done" && <DoneScreen onRestart={() => setStage("hero")} />}
    </div>
  );
}
