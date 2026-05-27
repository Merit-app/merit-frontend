import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reset password',
  description: 'Reset your Merit password using the link sent to your email.',
  openGraph: {
    title: 'Reset password',
    description: 'Reset your Merit password using the link sent to your email.',
    type: 'website',
    url: 'https://merit-frontend-nine.vercel.app/reset-password',
  },
};

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
