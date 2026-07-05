'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import heroImage from '../public/hero-plan-card.png';
import { slugFor, steps } from '@/lib/steps';

export default function Home() {
  const router = useRouter();

  function start() {
    router.push(`/flow/${slugFor(steps[0].key)}`);
  }

  return (
    <div className='relative mx-auto px-6 mt-8 md:pt-24 flex flex-col-reverse md:flex-row max-w-[560px] md:max-w-[1200px] gap-8'>
      {/* Left column: headline + subtext + CTA */}
      <div className='flex flex-col  mx-auto '>
        <h1 className='text-black font-black text-4xl md:text-6xl xl:text-7xl mb-2'>
          Stop dreading retirement. Get a plan from our team.
        </h1>
        <p className='text-black font-normal text-xl md:text-2xl'>
          The best way to have peace of mind is from a plan you believe in from
          someone who believes in you.
        </p>
        <button
          onClick={start}
          className='flex items-center justify-center text-white font-black rounded-lg cursor-pointer'
          style={{
            marginTop: 24,
            width: 239,
            height: 64,
            backgroundColor: '#249ba2',
            fontSize: 20,
          }}
        >
          Request a plan
        </button>
      </div>

      <div className='relative w-full max-w-[280px] md:max-w-full'>
        <Image
          src={heroImage}
          alt='test'
          className='w-full'
          height={400}
          width={1000}
        />
      </div>
    </div>
  );
}
