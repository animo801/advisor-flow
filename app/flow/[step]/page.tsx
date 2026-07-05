'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAnswers } from '@/components/flow-provider';
import { StepRenderer } from '@/components/step-screens';
import {
  isVisible,
  nextVisibleIndex,
  slugFor,
  steps,
  visibleSteps,
  type Answers,
} from '@/lib/steps';

export default function FlowStepPage() {
  const router = useRouter();
  const { step: slug } = useParams<{ step: string }>();
  const { answers, patchAnswers } = useAnswers();

  const stepIndex = steps.findIndex((s) => slugFor(s.key) === slug);
  const step = stepIndex >= 0 ? steps[stepIndex] : undefined;
  const stepIsVisible = step ? isVisible(step, answers) : false;

  useEffect(() => {
    if (step && stepIsVisible) return;
    const fallback = nextVisibleIndex(0, answers);
    router.replace(
      fallback < steps.length ? `/flow/${slugFor(steps[fallback].key)}` : '/',
    );
  }, [step, stepIsVisible, answers, router]);

  if (!step || !stepIsVisible) return null;

  const visible = visibleSteps(answers);
  const position = visible.findIndex((s) => s.key === step.key);
  const progress = visible.length ? (position + 1) / visible.length : 1;

  function goToNext(patch: Partial<Answers>) {
    const merged = { ...answers, ...patch };
    patchAnswers(patch);
    const next = nextVisibleIndex(stepIndex + 1, merged);
    router.push(
      next >= steps.length ? '/loading' : `/flow/${slugFor(steps[next].key)}`,
    );
  }

  return (
    <StepRenderer
      key={slug}
      step={step}
      answers={answers}
      progress={progress}
      onAdvance={goToNext}
      onBack={() => router.back()}
    />
  );
}
