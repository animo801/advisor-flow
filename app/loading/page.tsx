'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  LOADING_DURATION_MS,
  LOADING_MESSAGES,
  randomMessageOffsets,
} from '@/lib/steps';

export default function LoadingPage() {
  const router = useRouter();
  const [filled, setFilled] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const [offsets] = useState(() =>
    randomMessageOffsets(LOADING_MESSAGES.length, LOADING_DURATION_MS),
  );

  useEffect(() => {
    const raf = requestAnimationFrame(() => setFilled(true));
    const finishTimer = setTimeout(
      () => router.replace('/done'),
      LOADING_DURATION_MS,
    );
    const messageTimers = offsets.map((delay, i) =>
      setTimeout(() => setMessageIndex(i + 1), delay),
    );
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(finishTimer);
      messageTimers.forEach(clearTimeout);
    };
  }, [router, offsets]);

  return (
    <div
      className='relative mx-auto text-center'
      style={{ maxWidth: 480, paddingTop: 300, paddingBottom: 80 }}
    >
      <div
        className='bg-[#d9d9d9] rounded-full'
        style={{ width: '100%', height: 8 }}
      >
        <div
          className='bg-[#57c5cb] rounded-full'
          style={{
            height: 8,
            width: filled ? '100%' : '0%',
            transition: `width ${LOADING_DURATION_MS}ms linear`,
          }}
        />
      </div>
      <p
        className='text-black font-black'
        style={{ marginTop: 24, fontSize: 20 }}
      >
        {LOADING_MESSAGES[messageIndex]}
      </p>
    </div>
  );
}
