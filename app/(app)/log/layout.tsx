import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({ title: 'Log Hours', noIndex: true });

export default function LogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
