
import type {Metadata} from 'next';
import { GeistSans } from 'geist/font/sans';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"; // Import Toaster
import { ThemeProvider } from "@/components/ThemeProvider"; // Import ThemeProvider

// Use GeistSans.variable directly
const geistSansVariable = GeistSans.variable;

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
    <html lang="en" suppressHydrationWarning> {/* Add suppressHydrationWarning */}
      {/* Apply font variable and antialiased class */}
      <body className={`${geistSansVariable} font-sans antialiased`}>
         <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
         >
            {children}
            <Toaster /> {/* Add Toaster component here */}
        </ThemeProvider>
      </body>
    </html>
  );
}
