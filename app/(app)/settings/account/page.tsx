'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, LogOut, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useMeritStore } from '@/lib/store';

export default function AccountPage() {
  const user = useMeritStore((s) => s.user);
  const logout = useMeritStore((s) => s.logout);
  const clearSessions = useMeritStore((s) => s.clearSessions);
  const router = useRouter();

  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  function handleLogout() {
    logout();
    router.replace('/login');
  }

  function handleClearSessions() {
    if (!confirmClear) { setConfirmClear(true); return; }
    clearSessions();
    setConfirmClear(false);
    toast.success('All session data cleared.');
  }

  function handleDeleteAccount() {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    clearSessions();
    logout();
    toast.success('Account deleted. Goodbye.');
    router.replace('/login');
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

        {/* Clear sessions */}
        <div className="px-5 py-4 border-t border-ink-100 flex items-center justify-between gap-6">
          <div>
            <p className="text-[13px] font-medium text-ink-900">Clear all session data</p>
            <p className="text-small text-ink-500 mt-0.5">
              Permanently removes all logged hours and sessions from this device. Your account remains active.
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
                Clear data
              </button>
            )}
          </div>
        </div>

        {/* Delete account */}
        <div className="px-5 py-4 border-t border-ink-100 flex items-center justify-between gap-6">
          <div>
            <p className="text-[13px] font-medium text-ink-900">Delete account</p>
            <p className="text-small text-ink-500 mt-0.5">
              Wipes all data and signs you out. This cannot be undone.
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
                  className="flex items-center gap-1.5 text-[13px] font-medium text-white bg-danger hover:bg-danger/90 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Trash2 size={13} />
                  Yes, delete
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
