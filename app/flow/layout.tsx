'use client';

import type { ReactNode } from 'react';
import { AnswersProvider } from '@/components/flow-provider';

export default function FlowLayout({ children }: { children: ReactNode }) {
  return <AnswersProvider>{children}</AnswersProvider>;
}
