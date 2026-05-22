'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, LogOut, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useMeritStore } from '@/lib/store';
import { authApi, usersApi, ApiError } from '@/lib/api';

export default function AccountPage() {
  const user = useMeritStore((s) => s.user);
  const logout = useMeritStore((s) => s.logout);
  const router = useRouter();

  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleLogout() {
    try {
      await authApi.logout();
    } catch {
      // Ignore — logout locally regardless
    }
    logout();
    router.replace('/login');
  }

  function handleClearSessions() {
    if (!confirmClear) { setConfirmClear(true); return; }
    // Clear local store only — the canonical record is on the server
    useMeritStore.getState().clearSessions();
    setConfirmClear(false);
    toast.success('Session data cleared locally. Server records are unchanged.');
  }

  async function handleDeleteAccount() {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    try {
      await usersApi.delete();
      logout();
      toast.success("Account deletion scheduled. You'll receive a confirmation email.");
      router.replace('/login');
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message || 'Failed to delete account. Try again.');
      } else {
        toast.error('Could not reach the server.');
      }
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-h1 text-ink-900">Account</h2>
        <p className="text-small text-ink-500 mt-1">Manage your session and account data.</p>
      </div>

      {/* Signed-in as */}
      <div className="bg-white rounded-xl border border-ink-200 p-5 mb-6">
        <p className="text-[13px] font-medium text-ink-900 mb-0.5">Signed in as</p>
        <p className="text-small text-ink-500">{user.firstName} {user.lastName} · {user.email}</p>
        <Separator className="my-4 bg-ink-100" />
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-[13px] font-medium text-ink-700 hover:text-ink-900 transition-colors"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>

      {/* Danger zone */}
      <div className="rounded-xl border border-danger/30 overflow-hidden">
        <div className="bg-danger/5 px-5 py-3 flex items-center gap-2">
          <AlertTriangle size={14} className="text-danger" />
          <p className="text-[13px] font-semibold text-danger">Danger zone</p>
        </div>

        {/* Clear sessions (local only) */}
        <div className="px-5 py-4 border-t border-ink-100 flex items-center justify-between gap-6">
          <div>
            <p className="text-[13px] font-medium text-ink-900">Clear local session cache</p>
            <p className="text-small text-ink-500 mt-0.5">
              Clears your local cache. Data is still safe on the server and will reload on next visit.
            </p>
          </div>
          <div className="shrink-0">
            {confirmClear ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setConfirmClear(false)}
                  className="text-[13px] text-ink-500 hover:text-ink-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearSessions}
                  className="flex items-center gap-1.5 text-[13px] font-medium text-white bg-danger hover:bg-danger/90 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Trash2 size={13} />
                  Yes, clear
                </button>
              </div>
            ) : (
              <button
                onClick={handleClearSessions}
                className="text-[13px] font-medium text-danger border border-danger/40 hover:bg-danger/5 px-3 py-1.5 rounded-lg transition-colors"
              >
                Clear cache
              </button>
            )}
          </div>
        </div>

        {/* Delete account */}
        <div className="px-5 py-4 border-t border-ink-100 flex items-center justify-between gap-6">
          <div>
            <p className="text-[13px] font-medium text-ink-900">Delete account</p>
            <p className="text-small text-ink-500 mt-0.5">
              Schedules your account for deletion in 30 days. You'll get a confirmation email.
            </p>
          </div>
          <div className="shrink-0">
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="text-[13px] text-ink-500 hover:text-ink-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="flex items-center gap-1.5 text-[13px] font-medium text-white bg-danger hover:bg-danger/90 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60"
                >
                  <Trash2 size={13} />
                  {deleting ? 'Deleting...' : 'Yes, delete'}
                </button>
              </div>
            ) : (
              <button
                onClick={handleDeleteAccount}
                className="text-[13px] font-medium text-danger border border-danger/40 hover:bg-danger/5 px-3 py-1.5 rounded-lg transition-colors"
              >
                Delete account
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
