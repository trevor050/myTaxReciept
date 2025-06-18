import type {Metadata} from 'next';
import { GeistSans } from 'geist/font/sans';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"; // Import Toaster
import { ThemeProvider } from "@/components/ThemeProvider"; // Import ThemeProvider
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next"; // Import SpeedInsights component

// Use GeistSans.variable directly
const geistSansVariable = GeistSans.variable;

export const metadata: Metadata = {
  // Base URL for generating absolute URLs in metadata
  metadataBase: new URL('https://mytaxreceipt.org'),
  title: 'MyTaxReceipt.org',
  description: 'See exactly where your federal income taxes go — and message Congress about it in one click.',
  openGraph: {
    title: 'MyTaxReceipt.org',
    description: 'See exactly where your federal income taxes go — and message Congress about it in one click.',
    url: 'https://mytaxreceipt.org',
    siteName: 'MyTaxReceipt.org',
    images: [
      {
        url: '/share.png', // 1200x630 preferred
        width: 1200,
        height: 630,
        alt: 'MyTaxReceipt pie-chart preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MyTaxReceipt.org',
    description: 'See exactly where your federal income taxes go — and message Congress about it in one click.',
    images: ['/share.png'],
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Remove extra whitespace between tags
    <html lang="en" suppressHydrationWarning>
      {/* Apply font variable and antialiased class */}
      <body className={`${geistSansVariable} font-sans antialiased`} suppressHydrationWarning>
         <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
         >
            {children}
            <Toaster /> {/* Add Toaster component here */}
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
