'use client';

import { useState, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { profilesApi, ApiError } from '@/lib/api';
import { useMeritStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

type CheckState = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

export function UsernameEditor() {
  const user = useMeritStore((s) => s.user);
  const updateUser = useMeritStore((s) => s.updateUser);

  const [value, setValue] = useState(user.username ?? '');
  const [checkState, setCheckState] = useState<CheckState>('idle');
  const [checkMsg, setCheckMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentUsername = user.username ?? null;
  const isUnchanged = value === (currentUsername ?? '');

  const runCheck = useCallback(async (raw: string) => {
    const val = raw.trim().toLowerCase();
    if (!val) { setCheckState('idle'); setCheckMsg(null); return; }
    if (val === currentUsername) { setCheckState('idle'); setCheckMsg(null); return; }
    if (val.length < 3) { setCheckState('invalid'); setCheckMsg('At least 3 characters required.'); return; }
    if (val.length > 30) { setCheckState('invalid'); setCheckMsg('Maximum 30 characters.'); return; }
    if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(val)) {
      setCheckState('invalid');
      setCheckMsg('Only lowercase letters, numbers and hyphens. Must start and end with a letter or number.');
      return;
    }

    setCheckState('checking');
    setCheckMsg(null);
    try {
      const res = await profilesApi.checkUsername(val);
      if (res.data.available) {
        setCheckState('available');
        setCheckMsg('@' + val + ' is available');
      } else {
        setCheckState('taken');
        setCheckMsg(res.data.reason ?? 'That username is taken.');
      }
    } catch {
      setCheckState('idle');
      setCheckMsg(null);
    }
  }, [currentUsername]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    setValue(raw);
    setSaveError(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runCheck(raw), 500);
  }

  async function handleSave() {
    const val = value.trim().toLowerCase();
    if (!val || isUnchanged || checkState !== 'available') return;
    setSaving(true);
    setSaveError(null);
    try {
      const res = await profilesApi.update({ username: val });
      updateUser({ username: res.data.profile.username });
      setCheckState('idle');
      setCheckMsg(null);
    } catch (err) {
      if (err instanceof ApiError) {
        setSaveError(err.message || 'Failed to save username.');
      } else {
        setSaveError('Could not reach the server.');
      }
    } finally {
      setSaving(false);
    }
  }

  const canSave = !isUnchanged && checkState === 'available' && !saving;

  return (
    <div className="space-y-2">
      <div>
        <Label className="text-[13px] font-medium text-foreground">Username</Label>
        {currentUsername && (
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Username can only be changed once. Current: <span className="font-medium text-muted-foreground">@{currentUsername}</span>
          </p>
        )}
        {!currentUsername && (
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Choose your public username. You can only set this once.
          </p>
        )}
      </div>

      <div className="flex gap-2 max-w-sm">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-[13px] select-none pointer-events-none">@</span>
          <Input
            value={value}
            onChange={handleChange}
            className={cn(
              'pl-7',
              checkState === 'taken' || checkState === 'invalid' ? 'border-danger' : '',
              checkState === 'available' ? 'border-success' : '',
            )}
            placeholder="yourname"
            maxLength={30}
          />
        </div>
        <Button
          type="button"
          onClick={handleSave}
          disabled={!canSave}
          className={cn(
            'bg-merit-blue-600 hover:bg-merit-blue-700 text-white font-medium transition-all shrink-0',
            !canSave && 'opacity-50 cursor-not-allowed',
          )}
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : 'Save'}
        </Button>
      </div>

      {/* Status row */}
      {checkState === 'checking' && (
        <p className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
          <Loader2 size={12} className="animate-spin" /> Checking…
        </p>
      )}
      {checkState === 'available' && checkMsg && (
        <p className="flex items-center gap-1.5 text-[12px] text-success">
          <CheckCircle size={12} /> {checkMsg}
        </p>
      )}
      {(checkState === 'taken' || checkState === 'invalid') && checkMsg && (
        <p className="flex items-center gap-1.5 text-[12px] text-danger">
          <XCircle size={12} /> {checkMsg}
        </p>
      )}
      {saveError && (
        <p className="text-[12px] text-danger">{saveError}</p>
      )}
    </div>
  );
}
