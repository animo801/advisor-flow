'use client';

import { useState } from 'react';
import {
  patchOf,
  resolveQuestion,
  type Answers,
  type BalanceStep,
  type ChoiceStep,
  type InputStep,
  type MultiselectStep,
  type StepDef,
  type StepKind,
} from '@/lib/steps';

export function ProgressBar({ progress }: { progress: number }) {
  return (
    <div
      className='bg-[#d9d9d9] rounded-full'
      style={{ width: '100%', height: 4 }}
    >
      <div
        className='bg-[#57c5cb] rounded-full transition-all duration-300'
        style={{ height: 4, width: `${progress * 100}%` }}
      />
    </div>
  );
}

export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className='flex items-center justify-center text-black font-bold rounded-lg bg-[#d9d9d9]/30 hover:bg-[#d9d9d9]/50 cursor-pointer transition-colors'
      style={{ width: 120, height: 56, fontSize: 18 }}
    >
      Back
    </button>
  );
}

export function ContinueButton({
  onClick,
  disabled,
  label = 'Continue',
}: {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className='flex items-center justify-center text-white font-bold rounded-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-opacity'
      style={{
        width: 160,
        height: 56,
        backgroundColor: '#249ba2',
        fontSize: 18,
      }}
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
    <div
      className='relative mx-auto w-full px-6 pb-24 md:pt-16 md:pb-24'
      style={{ maxWidth: 560 }}
    >
      <ProgressBar progress={progress} />
      <h2
        className='text-black font-bold text-3xl md:text-5xl'
        style={{ marginTop: 35, lineHeight: 1.05 }}
      >
        {question}
      </h2>
      <div className='flex flex-col gap-4' style={{ marginTop: 45 }}>
        {children}
      </div>
      <div className='fixed bottom-0 left-0 right-0 bg-white'>
        <div
          className='flex items-center justify-between px-6 py-4 mx-auto'
          style={{ maxWidth: 560 }}
        >
          {footer}
        </div>
      </div>
    </div>
  );
}

function formatForKind(raw: string, kind: StepKind) {
  if (kind === 'currency')
    return raw ? Number(raw).toLocaleString('en-US') : '';
  if (kind === 'phone') {
    const area = raw.slice(0, 3);
    const mid = raw.slice(3, 6);
    const last = raw.slice(6, 10);
    if (raw.length > 6) return `(${area}) ${mid}-${last}`;
    if (raw.length > 3) return `(${area}) ${mid}`;
    if (raw.length > 0) return `(${area}`;
    return '';
  }
  return raw;
}

function InputScreen({
  step,
  question,
  progress,
  onSubmit,
  onBack,
}: {
  step: InputStep;
  question: string;
  progress: number;
  onSubmit: (value: string) => void;
  onBack: () => void;
}) {
  const [raw, setRaw] = useState('');
  const canSubmit =
    step.kind === 'text'
      ? raw.trim() !== ''
      : step.kind === 'phone'
        ? raw.length === 10
        : raw !== '';

  function submit() {
    if (!canSubmit) return;
    onSubmit(raw);
  }

  return (
    <StepShell
      progress={progress}
      question={question}
      footer={
        <>
          <BackButton onClick={onBack} />
          <ContinueButton onClick={submit} disabled={!canSubmit} />
        </>
      }
    >
      <div className='relative'>
        {step.kind === 'currency' && (
          <span
            className='absolute inset-y-0 left-6 flex items-center text-black font-bold pointer-events-none'
            style={{ fontSize: 18 }}
          >
            $
          </span>
        )}
        <input
          type='text'
          inputMode={step.kind === 'text' ? 'text' : 'numeric'}
          autoFocus
          value={formatForKind(raw, step.kind)}
          placeholder={step.placeholder}
          onChange={(e) => {
            const next =
              step.kind === 'text'
                ? e.target.value
                : e.target.value.replace(/[^0-9]/g, '');
            setRaw(step.kind === 'phone' ? next.slice(0, 10) : next);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
          }}
          className='w-full text-left text-black font-bold rounded-md bg-[#d9d9d9]/30 placeholder:font-normal placeholder:text-black/40 outline-none focus:bg-[#d9d9d9]/50 transition-colors'
          style={{
            height: 80,
            fontSize: 18,
            paddingLeft: step.kind === 'currency' ? 40 : 24,
          }}
        />
      </div>
    </StepShell>
  );
}

function ChoiceScreen({
  step,
  question,
  progress,
  onSelect,
  onBack,
}: {
  step: ChoiceStep;
  question: string;
  progress: number;
  onSelect: (value: string) => void;
  onBack: () => void;
}) {
  return (
    <StepShell
      progress={progress}
      question={question}
      footer={<BackButton onClick={onBack} />}
    >
      {step.options.map((option) => (
        <button
          key={option}
          onClick={() => onSelect(option)}
          className='w-full flex items-center rounded-md bg-[#d9d9d9]/30 hover:bg-[#d9d9d9]/50 text-left text-black font-bold transition-colors cursor-pointer px-6 py-4'
          style={{
            minHeight: 80,
            fontSize: 18,
            lineHeight: 1.15,
          }}
        >
          {option}
        </button>
      ))}
    </StepShell>
  );
}

function MultiselectScreen({
  step,
  question,
  progress,
  onSubmit,
  onBack,
}: {
  step: MultiselectStep;
  question: string;
  progress: number;
  onSubmit: (value: string[]) => void;
  onBack: () => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(option: string) {
    setSelected((prev) =>
      prev.includes(option)
        ? prev.filter((o) => o !== option)
        : [...prev, option],
    );
  }

  return (
    <StepShell
      progress={progress}
      question={question}
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
            className={`w-full flex items-center justify-between rounded-md text-left text-black font-bold transition-colors cursor-pointer border-2 px-6 py-4 ${
              isSelected
                ? 'bg-[#249ba2]/10 border-[#249ba2]'
                : 'bg-[#d9d9d9]/30 border-transparent hover:bg-[#d9d9d9]/50'
            }`}
            style={{
              minHeight: 80,
              fontSize: 18,
              lineHeight: 1.15,
            }}
          >
            {option}
            <span
              className={`flex items-center justify-center rounded-full border-2 shrink-0 ${
                isSelected
                  ? 'bg-[#249ba2] border-[#249ba2] text-white'
                  : 'border-black/20 text-transparent'
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
  question,
  accounts,
  progress,
  onSubmit,
  onBack,
}: {
  step: BalanceStep;
  question: string;
  accounts: string[];
  progress: number;
  onSubmit: (value: Record<string, string>) => void;
  onBack: () => void;
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  const canSubmit = accounts.every((a) => (values[a] ?? '') !== '');

  return (
    <StepShell
      progress={progress}
      question={question}
      footer={
        <>
          <BackButton onClick={onBack} />
          <ContinueButton
            onClick={() => onSubmit(values)}
            disabled={!canSubmit}
          />
        </>
      }
    >
      {accounts.map((account) => (
        <div key={account} className='flex flex-col gap-2'>
          <label className='text-black font-bold' style={{ fontSize: 14 }}>
            {account}
          </label>
          <div className='relative'>
            <span
              className='absolute inset-y-0 left-6 flex items-center text-black font-bold pointer-events-none'
              style={{ fontSize: 18 }}
            >
              $
            </span>
            <input
              type='text'
              inputMode='numeric'
              value={
                values[account]
                  ? Number(values[account]).toLocaleString('en-US')
                  : ''
              }
              placeholder='0'
              onChange={(e) =>
                setValues((prev) => ({
                  ...prev,
                  [account]: e.target.value.replace(/[^0-9]/g, ''),
                }))
              }
              className='w-full text-left text-black font-bold rounded-md bg-[#d9d9d9]/30 placeholder:font-normal placeholder:text-black/40 outline-none focus:bg-[#d9d9d9]/50 transition-colors'
              style={{ height: 80, fontSize: 18, paddingLeft: 40 }}
            />
          </div>
        </div>
      ))}
    </StepShell>
  );
}

export function StepRenderer({
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
  const question = resolveQuestion(step, answers);
  switch (step.type) {
    case 'input':
      return (
        <InputScreen
          step={step}
          question={question}
          progress={progress}
          onSubmit={(value) => onAdvance(patchOf(step.key, value))}
          onBack={onBack}
        />
      );
    case 'choice':
      return (
        <ChoiceScreen
          step={step}
          question={question}
          progress={progress}
          onSelect={(value) => onAdvance(patchOf(step.key, value))}
          onBack={onBack}
        />
      );
    case 'multiselect':
      return (
        <MultiselectScreen
          step={step}
          question={question}
          progress={progress}
          onSubmit={(value) => onAdvance(patchOf(step.key, value))}
          onBack={onBack}
        />
      );
    case 'balance':
      return (
        <BalanceScreen
          step={step}
          question={question}
          accounts={answers[step.accountsKey] ?? []}
          progress={progress}
          onSubmit={(value) => onAdvance(patchOf(step.key, value))}
          onBack={onBack}
        />
      );
  }
}
