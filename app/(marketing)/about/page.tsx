import type { Metadata } from 'next';
import { AboutView } from '@/components/marketing/about-view';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'About',
  description:
    'Merit was built by a high school student in Burnaby, BC who was ' +
    'tired of tracking volunteer hours in a spreadsheet.',
  path: '/about',
});

export default function AboutPage() {
  return <AboutView />;
}
