import type {Metadata} from 'next';
import { GeistSans } from 'geist/font/sans';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"; // Import Toaster

// Use GeistSans.variable directly instead of calling it as a function
const geistSansVariable = GeistSans.variable;

// Remove Geist_Mono if not explicitly needed or keep if intended
// const geistMono = Geist_Mono({
//   variable: '--font-geist-mono',
//   subsets: ['latin'],
// });

export const metadata: Metadata = {
  title: 'WhereIsMyTaxMoneyGoing.org', // Update title
  description: 'Understand where your tax money goes and connect with representatives.', // Update description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Apply font variable and antialiased class */}
      <body className={`${geistSansVariable} font-sans antialiased`}>
        {children}
        <Toaster /> {/* Add Toaster component here */}
      </body>
    </html>
  );
}
