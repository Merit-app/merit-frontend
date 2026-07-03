import type { Metadata } from 'next';
import { PricingView } from '@/components/marketing/pricing-view';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Pricing',
  description:
    'Merit is free for students. Upgrade to Pro for unlimited exports ' +
    'and modern PDF templates. No hidden fees.',
  path: '/pricing',
});

export default function PricingPage() {
  return <PricingView />;
}
