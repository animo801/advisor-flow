'use client';

import { useRouter } from 'next/navigation';

export default function DonePage() {
  const router = useRouter();

  return (
    <div className='relative mx-auto text-center pt-32 px-6 max-w-[720px]'>
      <h2 className='text-black font-black text-4xl md:text-6xl'>
        Thanks! We&apos;ll be in touch with your plan.
      </h2>
    </div>
  );
}
