import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Settings — Merit', robots: { index: false, follow: false } };

import { redirect } from 'next/navigation';

export default function SettingsPage() {
  redirect('/settings/profile');
}

