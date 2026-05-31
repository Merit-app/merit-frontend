import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({ title: 'Badges', noIndex: true });

export default function BadgesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
