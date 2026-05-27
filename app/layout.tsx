import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import { StoreHydrator } from '@/components/store-hydrator';
import { CookieBanner } from '@/components/cookie-banner';
import { NetworkStatus } from '@/components/network-status';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'Merit',
    template: '%s · Merit',
  },
  description: 'Credible service-hour records for high school students.',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
    other: [
      {
        rel: 'icon',
        type: 'image/svg+xml',
        url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect fill="%231C1917" width="192" height="192" rx="45"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui, -apple-system" font-size="120" font-weight="700" fill="%23ffffff">M</text></svg>',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-ink-50 text-ink-900">
        <NetworkStatus />
        <StoreHydrator />
        {children}
        <CookieBanner />
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
      </body>
    </html>
  );
}
