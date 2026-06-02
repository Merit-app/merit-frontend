import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import { LandingPage } from '@/components/marketing/landing-page';

export const metadata: Metadata = buildMetadata({
  title: 'Student Volunteer Hour Tracker',
  description:
    'The easiest way to track volunteer hours, get verified by SMS, and export a signed PDF. Free for students.',
  path: '/',
});

export default function Page() {
  return <LandingPage />;
}
