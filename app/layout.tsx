import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import { StoreHydrator } from '@/components/store-hydrator';
import { CookieBanner } from '@/components/cookie-banner';
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
