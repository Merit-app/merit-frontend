import Link from 'next/link';

export default function SessionNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center px-8">
      <p className="text-[13px] font-semibold text-ink-400 uppercase tracking-wide mb-2">404</p>
      <h2 className="text-h1 text-ink-900 mb-2">Session not found</h2>
      <p className="text-small text-ink-500 mb-6">
        This session doesn&apos;t exist or may have been deleted.
      </p>
      <Link
        href="/hours"
        className="text-[13px] font-medium text-merit-blue-600 hover:text-merit-blue-700 transition-colors"
      >
        Back to all sessions
      </Link>
    </div>
  );
}
