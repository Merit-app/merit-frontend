import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Forgot password',
  description: 'Reset your Merit password to regain access to your account.',
  openGraph: {
    title: 'Forgot password',
    description: 'Reset your Merit password to regain access to your account.',
    type: 'website',
    url: 'https://merit-frontend-nine.vercel.app/forgot-password',
  },
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
