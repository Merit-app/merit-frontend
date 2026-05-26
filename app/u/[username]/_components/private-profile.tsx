import { Lock } from 'lucide-react';

export function PrivateProfile({ username }: { username: string }) {
  return (
    <div className="min-h-screen bg-ink-50 flex flex-col items-center justify-center text-center px-6">
      <div className="w-16 h-16 rounded-full bg-ink-200 flex items-center justify-center mb-5">
        <Lock className="text-ink-400" size={28} />
      </div>
      <h1 className="text-xl font-semibold text-ink-900 mb-2">This profile is private</h1>
      <p className="text-sm text-ink-500 max-w-xs leading-relaxed">
        <span className="font-medium text-ink-700">@{username}</span> has set their Merit profile
        to private. If you know them, ask them to make it public.
      </p>
    </div>
  );
}
