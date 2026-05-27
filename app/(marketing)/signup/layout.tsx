import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign up',
  description: 'Create your Merit account — Free forever. Track, verify, and export your volunteer hours with SMS verification.',
  openGraph: {
    title: 'Create your Merit account',
    description: 'Create your Merit account — Free forever. Track, verify, and export your volunteer hours with SMS verification.',
    type: 'website',
    url: 'https://merit-frontend-nine.vercel.app/signup',
  },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
