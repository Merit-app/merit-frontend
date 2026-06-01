import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Saved Organizations — Merit',
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
