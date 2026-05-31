import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({ title: 'Org Dashboard', noIndex: true });

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
