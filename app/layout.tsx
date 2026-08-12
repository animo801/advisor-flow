import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Image from 'next/image';
import Script from 'next/script';
import logo from '../logo.svg';
import { META_PIXEL_ID } from '@/lib/meta-pixel';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Advisor Flow',
  description: 'Stop dreading retirement. Get a plan from our team.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' className={`${inter.variable} h-full antialiased`}>
      <body className='h-full flex flex-col overflow-hidden'>
        {/* Meta Pixel Code */}
        <Script id='meta-pixel' strategy='afterInteractive'>
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${META_PIXEL_ID}');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height='1'
            width='1'
            style={{ display: 'none' }}
            src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
            alt=''
          />
        </noscript>
        {/* End Meta Pixel Code */}
        <nav className='shrink-0 px-6 py-4'>
          <Image src={logo} alt='' width={240} />
        </nav>
        <div className='relative flex flex-1 min-h-0 flex-col overflow-x-clip overflow-y-auto bg-white font-sans'>
          {children}
        </div>
      </body>
    </html>
  );
}
