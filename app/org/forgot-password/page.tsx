'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2, MailCheck, ArrowLeft } from 'lucide-react';
import { authApi, ApiError } from '@/lib/api';

export default function OrgForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setServerError(null);
    try {
      // Remember this reset began on the org side so the reset page can send the
      // user back to /org/login afterward (survives the email-link navigation in
      // the same browser; harmlessly falls back to student login otherwise).
      try { localStorage.setItem('merit-reset-context', 'org'); } catch { /* ignore */ }
      await authApi.requestPasswordReset(email.trim());
      setSent(true);
    } catch (err) {
      setServerError(
        err instanceof ApiError
          ? err.message || 'Something went wrong. Try again.'
          : 'Could not reach the server. Check your connection.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6">
      <div className="mb-8 text-center">
        <a href="/org" className="text-2xl font-bold text-white">merit.</a>
        <p className="text-gray-500 text-sm mt-1">Reset your password</p>
      </div>

      <div className="w-full max-w-sm bg-gray-900 border border-gray-800 rounded-2xl p-8">
        {sent ? (
          <div className="text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mx-auto">
              <MailCheck className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-lg font-bold text-white">Check your email</h1>
            <p className="text-sm text-gray-400 leading-relaxed">
              If an account exists for{' '}
              <span className="text-gray-200 font-medium">{email}</span>, we&apos;ve sent a link
              to reset your password. It may take a minute — check your spam folder too.
            </p>
            <Link
              href="/org/login"
              className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors pt-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back to org sign in
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-bold text-white mb-2">Forgot your password?</h1>
            <p className="text-sm text-gray-400 mb-6">
              Enter the email tied to your organization account and we&apos;ll send you a reset link.
            </p>

            {serverError && (
              <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
                <p className="text-sm text-red-400">{serverError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Work email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@organization.org"
                  autoFocus
                  required
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm placeholder-gray-600 focus:outline-none focus:border-white transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full bg-white text-gray-900 font-semibold py-3 rounded-xl text-sm hover:bg-gray-100 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Sending...' : 'Send reset link'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-800 text-center">
              <Link href="/org/login" className="text-sm text-gray-500 hover:text-gray-300">
                Back to org sign in
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
