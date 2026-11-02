import type { Metadata, Viewport } from 'next';
import { Public_Sans, Reenie_Beanie, Sometype_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';

const sans = Public_Sans({ subsets: ['latin'], variable: '--font-public-sans', display: 'swap' });
const mono = Sometype_Mono({ subsets: ['latin'], variable: '--font-sometype', display: 'swap' });
const pen = Reenie_Beanie({ weight: '400', subsets: ['latin'], variable: '--font-reenie', display: 'swap' });

const description = 'See where your federal taxes went, line by line, and tell Congress what you would change.';

export const metadata: Metadata = {
  metadataBase: new URL('https://mytaxreceipt.org'),
  title: 'MyTaxReceipt: the itemized bill for your federal taxes',
  description,
  openGraph: {
    title: 'MyTaxReceipt',
    description,
    url: 'https://mytaxreceipt.org',
    siteName: 'MyTaxReceipt',
    images: [{ url: '/share.png', width: 1200, height: 630, alt: 'An itemized receipt for federal taxes' }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'MyTaxReceipt', description, images: ['/share.png'] },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#d5e6db' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable} ${pen.variable}`}>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
