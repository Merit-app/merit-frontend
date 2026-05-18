import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Dashboard' };

export default function DashboardPage() {
  return (
    <div className="px-8 py-8">
      <p className="text-small text-ink-500">Dashboard — coming soon.</p>
    </div>
  );
}
