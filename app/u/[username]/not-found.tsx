import Link from 'next/link';

export default function ProfileNotFound() {
  return (
    <div className="min-h-screen bg-ink-50 flex flex-col items-center justify-center text-center px-6">
      <p className="text-[11px] font-semibold text-ink-400 uppercase tracking-widest mb-3">404</p>
      <h1 className="text-2xl font-semibold text-ink-900 mb-2">Profile not found</h1>
      <p className="text-sm text-ink-500 mb-8 max-w-xs">
        This username doesn&apos;t exist on Merit. Double-check the link and try again.
      </p>
      <Link
        href="/"
        className="text-sm font-medium text-merit-blue-600 hover:text-merit-blue-700 transition-colors"
      >
        Go to Merit →
      </Link>
    </div>
  );
}
