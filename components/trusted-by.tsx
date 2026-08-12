import Image from 'next/image';
import rob from '../public/hero/avatars/rob.jpg';
import mckenzie from '../public/hero/avatars/mckenzie.jpg';
import dallas from '../public/hero/avatars/dallas.jpg';
import megan from '../public/hero/avatars/megan.jpg';
import tessa from '../public/hero/avatars/tessa.jpg';

const CLIENTS = [
  { name: 'Rob', photo: rob },
  { name: 'McKenzie', photo: mckenzie },
  { name: 'Dallas', photo: dallas },
  { name: 'Megan', photo: megan },
  { name: 'Tessa', photo: tessa },
];

// Rendered twice back-to-back so the marquee can loop seamlessly.
const LOOPED_CLIENTS = [...CLIENTS, ...CLIENTS];

export function TrustedBy() {
  return (
    <div className='mt-12'>
      <p className='font-bold text-lg text-black opacity-50'>
        Trusted by over 1k people
      </p>
      <div className='group relative mt-6 max-w-[480px] overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_24px,black_calc(100%-24px),transparent)]'>
        <div className='animate-marquee group-hover:[animation-play-state:paused] flex w-max'>
          {LOOPED_CLIENTS.map((client, i) => (
            <div
              key={`${client.name}-${i}`}
              className='flex-none flex flex-col items-center gap-1 mr-6'
            >
              <Image
                src={client.photo}
                alt={client.name}
                className='size-12 rounded-full object-cover'
              />
              <p className='font-bold text-sm text-black leading-[18px] whitespace-nowrap'>
                {client.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
