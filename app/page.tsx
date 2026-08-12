'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import familyBeachImage from '../public/hero/family-beach.png';
import { slugFor, steps } from '@/lib/steps';
import { TrustedBy } from '@/components/trusted-by';

export default function Home() {
  const router = useRouter();

  function start() {
    router.push(`/flow/${slugFor(steps[0].key)}`);
  }

  return (
    <section className='relative flex flex-col-reverse lg:flex-row lg:items-stretch'>
      {/* Left column: headline + subtext + CTA + social proof */}
      <div className='flex flex-col justify-center px-4 py-6 lg:py-24 lg:pl-[62px] lg:pr-12 lg:w-[768px] lg:flex-none w-full sm:max-w-[440px] md:max-w-none mx-auto'>
        <h1 className='font-bold text-black text-[30px] lg:text-[56px] leading-none max-w-[642px]'>
          Stop dreading your future. Free retirement review for new clients.
        </h1>
        <p className='mt-2 text-black text-xl lg:text-2xl max-w-[642px]'>
          Our team will go through your current plan and find opportunities to
          improve. All free for new customers.
        </p>
        <button
          onClick={start}
          className='mt-8 flex items-center justify-center text-white font-bold text-lg rounded-md cursor-pointer bg-[#249ba2] hover:bg-[#1f8790] transition-colors'
          style={{ width: 239, height: 64 }}
        >
          Get your review
        </button>

        <TrustedBy />
      </div>

      {/* Right column: hero photo */}
      <div className='relative min-h-[320px] lg:min-h-0 lg:flex-1'>
        <Image
          src={familyBeachImage}
          alt='Family walking into the ocean together'
          fill
          priority
          className='object-cover '
        />
      </div>
    </section>
  );
}
