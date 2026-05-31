import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Sign up',
  description:
    'Create your Merit account — Free forever. Track, verify, and export your volunteer hours with SMS verification.',
  path: '/signup',
});

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
