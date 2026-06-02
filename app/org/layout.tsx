import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Merit for Organizations',
  description: 'Manage your volunteers, run events, and generate reports.',
  robots: { index: false, follow: false },
};

export default function OrgLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {children}
    </div>
  );
}
