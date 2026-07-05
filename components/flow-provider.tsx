'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Answers } from '@/lib/steps';

type AnswersContextValue = {
  answers: Answers;
  patchAnswers: (patch: Partial<Answers>) => void;
};

const AnswersContext = createContext<AnswersContextValue | null>(null);

export function AnswersProvider({ children }: { children: ReactNode }) {
  const [answers, setAnswers] = useState<Answers>({});

  function patchAnswers(patch: Partial<Answers>) {
    setAnswers((prev) => ({ ...prev, ...patch }));
  }

  return (
    <AnswersContext.Provider value={{ answers, patchAnswers }}>
      {children}
    </AnswersContext.Provider>
  );
}

export function useAnswers() {
  const ctx = useContext(AnswersContext);
  if (!ctx) throw new Error('useAnswers must be used within AnswersProvider');
  return ctx;
}
