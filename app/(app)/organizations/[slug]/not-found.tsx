import Link from 'next/link';

export default function OrgNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center px-8">
      <p className="text-[13px] font-semibold text-ink-400 uppercase tracking-wide mb-2">404</p>
      <h2 className="text-h1 text-ink-900 mb-2">Organization not found</h2>
      <p className="text-small text-ink-500 mb-6">
        This organization doesn&apos;t exist or may have been removed.
      </p>
      <Link
        href="/organizations"
        className="text-[13px] font-medium text-merit-blue-600 hover:text-merit-blue-700 transition-colors"
      >
        Back to organizations
      </Link>
    </div>
  );
}
