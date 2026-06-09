'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, LogOut, Trash2, Download, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useMeritStore } from '@/lib/store';
import { authApi, usersApi, ApiError } from '@/lib/api';
import { ThemeSetting } from '@/components/theme-setting';

export default function AccountPage() {
  const user = useMeritStore((s) => s.user);
  const logout = useMeritStore((s) => s.logout);
  const router = useRouter();

  const [confirmClear, setConfirmClear] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  async function handleLogout() {
    try { await authApi.logout(); } catch { /* ignore */ }
    logout();
    router.replace('/login');
  }

  function handleClearSessions() {
    if (!confirmClear) { setConfirmClear(true); return; }
    useMeritStore.getState().clearSessions();
    setConfirmClear(false);
    toast.success('Session data cleared locally. Server records are unchanged.');
  }

  async function handleExport() {
    setExporting(true);
    try {
      const data = await usersApi.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'merit-data.json';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Data exported as merit-data.json');
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message || 'Failed to export data.');
      } else {
        toast.error('Could not reach the server.');
      }
    } finally {
      setExporting(false);
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirmText !== 'DELETE') return;
    setDeleting(true);
    try {
      await usersApi.delete();
      logout();
      toast.success("Account deletion scheduled. You'll receive a confirmation email.");
      router.replace('/');
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message || 'Failed to delete account. Try again.');
      } else {
        toast.error('Could not reach the server.');
      }
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
      setDeleteConfirmText('');
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-h1 text-foreground">Account</h2>
        <p className="text-small text-muted-foreground mt-1">Manage your session and account data.</p>
      </div>

      {/* Appearance */}
      <div className="bg-card rounded-xl border border-border p-5 mb-6">
        <div className="flex items-center justify-between gap-6 flex-wrap">
          <div>
            <p className="text-[13px] font-medium text-foreground">Appearance</p>
            <p className="text-small text-muted-foreground mt-0.5">Choose how Merit looks to you.</p>
          </div>
          <ThemeSetting />
        </div>
      </div>

      {/* Signed-in as */}
      <div className="bg-card rounded-xl border border-border p-5 mb-6">
        <p className="text-[13px] font-medium text-foreground mb-0.5">Signed in as</p>
        <p className="text-small text-muted-foreground">{user.firstName} {user.lastName} · {user.email}</p>
        <Separator className="my-4 bg-muted" />
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-[13px] font-medium text-foreground hover:text-foreground transition-colors"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>

      {/* Data export */}
      <div className="bg-card rounded-xl border border-border p-5 mb-6">
        <div className="flex items-center justify-between gap-6">
          <div>
            <p className="text-[13px] font-medium text-foreground">Export my data</p>
            <p className="text-small text-muted-foreground mt-0.5">
              Download all your sessions, profile, and account data as a JSON file.
            </p>
          </div>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-1.5 shrink-0 text-[13px] font-medium text-merit-blue-600 border border-merit-blue-200 hover:bg-merit-blue-50 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60"
          >
            <Download size={13} />
            {exporting ? 'Exporting...' : 'Export data'}
          </button>
        </div>
      </div>

      {/* Danger zone */}
      <div className="rounded-xl border border-danger/30 overflow-hidden">
        <div className="bg-danger/5 px-5 py-3 flex items-center gap-2">
          <AlertTriangle size={14} className="text-danger" />
          <p className="text-[13px] font-semibold text-danger">Danger zone</p>
        </div>

        {/* Clear sessions (local only) */}
        <div className="px-5 py-4 border-t border-border flex items-center justify-between gap-6">
          <div>
            <p className="text-[13px] font-medium text-foreground">Clear local session cache</p>
            <p className="text-small text-muted-foreground mt-0.5">
              Clears your local cache. Data is still safe on the server and will reload on next visit.
            </p>
          </div>
          <div className="shrink-0">
            {confirmClear ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setConfirmClear(false)}
                  className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearSessions}
                  className="flex items-center gap-1.5 text-[13px] font-medium text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg transition-colors"
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
        <div className="px-5 py-4 border-t border-border flex items-center justify-between gap-6">
          <div>
            <p className="text-[13px] font-medium text-foreground">Delete account</p>
            <p className="text-small text-muted-foreground mt-0.5">
              Schedules your account for deletion in 30 days. You'll get a confirmation email.
            </p>
          </div>
          <button
            onClick={() => setDeleteOpen(true)}
            className="shrink-0 text-[13px] font-medium text-danger border border-danger/40 hover:bg-danger/5 px-3 py-1.5 rounded-lg transition-colors"
          >
            Delete account
          </button>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteOpen} onOpenChange={(v) => { if (!v) { setDeleteOpen(false); setDeleteConfirmText(''); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <AlertTriangle size={16} className="text-danger" />
              Delete your account
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              This will schedule your account for permanent deletion in 30 days. All your sessions, organizations, and data will be removed.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="rounded-lg bg-danger/5 border border-danger/20 px-4 py-3">
              <p className="text-[13px] text-danger font-medium">
                Type <span className="font-mono font-bold">DELETE</span> to confirm
              </p>
            </div>
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              className="font-mono"
              autoComplete="off"
            />
            <div className="flex items-center gap-3 pt-1">
              <Button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE' || deleting}
                className="bg-red-600 hover:bg-red-700 text-white font-medium flex-1 disabled:opacity-50"
              >
                <Trash2 size={14} className="mr-1.5" />
                {deleting ? 'Deleting...' : 'Delete my account'}
              </Button>
              <Button
                variant="outline"
                onClick={() => { setDeleteOpen(false); setDeleteConfirmText(''); }}
                className="border-border"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
