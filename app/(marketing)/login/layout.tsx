import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to your Merit account to track and verify your volunteer hours.',
  openGraph: {
    title: 'Sign in to Merit',
    description: 'Sign in to your Merit account to track and verify your volunteer hours.',
    type: 'website',
    url: 'https://merit-frontend-nine.vercel.app/login',
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
