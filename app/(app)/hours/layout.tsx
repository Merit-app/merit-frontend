import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({ title: 'My Hours', noIndex: true });

export default function HoursLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
