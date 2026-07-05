import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Image from 'next/image';
import logo from '../logo.png';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '900'],
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
      <body className='min-h-full flex flex-col'>
        <nav className='px-6 py-4'>
          <Image src={logo} alt='' width={80} />
        </nav>
        <div className='relative min-h-screen bg-white overflow-x-clip font-sans'>
          {children}
        </div>
      </body>
    </html>
  );
}
