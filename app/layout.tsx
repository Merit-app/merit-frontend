import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { StoreHydrator } from '@/components/store-hydrator';
import { CookieBanner } from '@/components/cookie-banner';
import { NetworkStatus } from '@/components/network-status';
import { Providers } from '@/components/providers';
import { WebAppJsonLd, OrganizationJsonLd } from '@/components/seo/json-ld';
import { buildMetadata } from '@/lib/seo';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = buildMetadata({});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://api.meritco.app" />
        <link rel="dns-prefetch" href="https://api.meritco.app" />
      </head>
      <body className="min-h-full bg-ink-50 text-ink-900">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          storageKey="merit-theme"
        >
          <WebAppJsonLd />
          <OrganizationJsonLd />
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-3 focus:py-2 focus:bg-white focus:text-merit-blue-600 focus:shadow-lg"
          >
            Skip to main content
          </a>
          <NetworkStatus />
          <StoreHydrator />
          <Providers>
            <main id="main-content">{children}</main>
            <CookieBanner />
          </Providers>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#ffffff',
                border: '1px solid #E7E5E4',
                borderRadius: '12px',
                fontSize: '14px',
                color: '#1C1917',
              },
              duration: 4000,
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
