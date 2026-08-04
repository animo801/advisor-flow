'use client';

import { useRouter } from 'next/navigation';
import { Inter_Tight } from 'next/font/google';

const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['400', '900'],
});

export default function DonePage() {
  const router = useRouter();

  return (
    <div
      className={`${interTight.className} relative mx-auto text-center pt-32 px-6 max-w-[720px]`}
    >
      <h2 className='text-black font-black text-4xl md:text-6xl'>
        Thanks! We&apos;ll be in touch with your plan.
      </h2>
    </div>
  );
}
