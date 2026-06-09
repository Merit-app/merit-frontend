'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, CheckCircle2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { OrgCombobox } from '@/components/log/org-combobox';
import { SmsPreview } from '@/components/log/sms-preview';
import { SuccessState } from '@/components/log/success-state';
import { useMeritStore } from '@/lib/store';
import { sessionsApi, mapSession, ApiError } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { Organization } from '@/lib/types';

type Mode = 'verified' | 'tracked';

const DRAFT_STORAGE_KEY = 'log-form-draft';
const DRAFT_RESTORED_SHOWN_KEY = 'draft-restored-shown';

// ── Schemas (one per mode) ────────────────────────────────────────────────────

const verifiedSchema = z.object({
  date: z.string().min(1, 'Select a date'),
  hours: z.number().min(0.5, 'Minimum 0.5 hrs').max(12, 'Maximum 12 hrs'),
  activity: z.string().min(5, 'Describe what you did').max(500, 'Keep it under 500 characters'),
  supervisorName: z.string().min(2, 'Enter supervisor name'),
  supervisorPhone: z.string().min(10, 'Enter a valid phone number'),
  supervisorEmail: z.string().email().optional().or(z.literal('')),
});

const trackedSchema = z.object({
  date: z.string().min(1, 'Select a date'),
  hours: z.number().min(0.5, 'Minimum 0.5 hrs').max(12, 'Maximum 12 hrs'),
  activity: z.string().min(5, 'Describe what you did').max(500, 'Keep it under 500 characters'),
  trackerNote: z.string().max(200).optional(),
});

type VerifiedFormData = z.infer<typeof verifiedSchema>;
type TrackedFormData = z.infer<typeof trackedSchema>;

const DEFAULT_VERIFIED: VerifiedFormData = {
  date: format(new Date(), 'yyyy-MM-dd'),
  hours: 4,
  activity: '',
  supervisorName: '',
  supervisorPhone: '',
  supervisorEmail: '',
};

const DEFAULT_TRACKED: TrackedFormData = {
  date: format(new Date(), 'yyyy-MM-dd'),
  hours: 4,
  activity: '',
  trackerNote: '',
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LogPage() {
  const user = useMeritStore((s) => s.user);
  const addSession = useMeritStore((s) => s.addSession);

  const [mode, setMode] = useState<Mode>('verified');
  const [org, setOrg] = useState<Organization | null>(null);
  const [orgError, setOrgError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selfTrackedSuccess, setSelfTrackedSuccess] = useState(false);
  const [submittedSupervisor, setSubmittedSupervisor] = useState('');
  const [showEmail, setShowEmail] = useState(false);
  const [calOpen, setCalOpen] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);

  // ── Verified form ─────────────────────────────────────────────────────────
  const verifiedForm = useForm<VerifiedFormData>({
    resolver: zodResolver(verifiedSchema),
    defaultValues: DEFAULT_VERIFIED,
  });

  // ── Tracked form ──────────────────────────────────────────────────────────
  const trackedForm = useForm<TrackedFormData>({
    resolver: zodResolver(trackedSchema),
    defaultValues: DEFAULT_TRACKED,
  });

  const activeForm = mode === 'verified' ? verifiedForm : trackedForm;
  const watchedVerified = verifiedForm.watch();
  const watchedTracked = trackedForm.watch();
  const activityLen = mode === 'verified'
    ? (watchedVerified.activity ?? '').length
    : (watchedTracked.activity ?? '').length;

  // Load draft on mount (only for verified mode)
  useEffect(() => {
    if (typeof window === 'undefined' || mode !== 'verified') return;
    const draft = localStorage.getItem(DRAFT_STORAGE_KEY);
    const draftShown = localStorage.getItem(DRAFT_RESTORED_SHOWN_KEY);
    if (draft && !draftShown) {
      try {
        const parsed = JSON.parse(draft);
        verifiedForm.reset(parsed);
        setDraftRestored(true);
        localStorage.setItem(DRAFT_RESTORED_SHOWN_KEY, 'true');
        setTimeout(() => setDraftRestored(false), 4000);
      } catch { /* ignore */ }
    }
  }, [mode]);

  // Save draft on form changes (verified mode only)
  useEffect(() => {
    if (typeof window === 'undefined' || mode !== 'verified') return;
    const timer = setTimeout(() => {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(watchedVerified));
    }, 500);
    return () => clearTimeout(timer);
  }, [watchedVerified, mode]);

  // ── Submit handlers ───────────────────────────────────────────────────────

  async function onSubmitVerified(data: VerifiedFormData) {
    if (!org) { setOrgError(true); return; }
    setLoading(true);
    try {
      const orgPayload = org.id ? { orgId: org.id } : { newOrg: { name: org.name } };
      const res = await sessionsApi.create({
        ...orgPayload,
        date: data.date,
        hours: data.hours,
        activity: data.activity,
        supervisorName: data.supervisorName,
        supervisorPhone: data.supervisorPhone || undefined,
        supervisorEmail: data.supervisorEmail || undefined,
        selfReported: false,
      });
      const session = mapSession(res.data.session);
      addSession(session);
      setSubmittedSupervisor(data.supervisorName);
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      localStorage.removeItem(DRAFT_RESTORED_SHOWN_KEY);
      setSuccess(true);
      toast.success('Session logged successfully');
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === 'invalid_phone') {
          toast.error("That phone number doesn't look right. Include the area code.");
        } else {
          toast.error(err.message || 'Failed to log session. Try again.');
        }
      } else {
        toast.error('Could not reach the server. Check your connection.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function onSubmitTracked(data: TrackedFormData) {
    if (!org) { setOrgError(true); return; }
    setLoading(true);
    try {
      const orgPayload = org.id ? { orgId: org.id } : { newOrg: { name: org.name } };
      const res = await sessionsApi.create({
        ...orgPayload,
        date: data.date,
        hours: data.hours,
        activity: data.activity,
        trackerNote: data.trackerNote || undefined,
        selfReported: true,
      });
      const session = mapSession(res.data.session);
      addSession(session);
      setSelfTrackedSuccess(true);
      toast.success('Hours saved');
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message || 'Failed to log hours. Try again.');
      } else {
        toast.error('Could not reach the server. Check your connection.');
      }
    } finally {
      setLoading(false);
    }
  }

  function handleLogAnother() {
    verifiedForm.reset(DEFAULT_VERIFIED);
    trackedForm.reset(DEFAULT_TRACKED);
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    localStorage.removeItem(DRAFT_RESTORED_SHOWN_KEY);
    setOrg(null);
    setOrgError(false);
    setSuccess(false);
    setSelfTrackedSuccess(false);
    setSubmittedSupervisor('');
  }

  // ── Success screens ───────────────────────────────────────────────────────

  if (success) {
    return (
      <div className="px-4 py-4 md:px-8 md:py-6">
        <SuccessState supervisorName={submittedSupervisor} onLogAnother={handleLogAnother} />
      </div>
    );
  }

  if (selfTrackedSuccess) {
    return (
      <div className="px-4 py-4 md:px-8 md:py-6 max-w-md">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-amber-900">Hours saved!</h2>
          <p className="text-sm text-amber-700">
            Your self-tracked hours have been saved. They'll appear on your profile labeled
            "Self-reported" and are not included in leaderboard rankings.
          </p>
          <Button onClick={handleLogAnother} className="bg-amber-700 hover:bg-amber-800 text-white">
            Log more hours
          </Button>
        </div>
      </div>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────────

  return (
    <div className="px-4 py-4 md:px-8 md:py-6">
      <div className="mb-5">
        <h1 className="text-h1 text-foreground">Log hours</h1>
        <p className="text-small text-muted-foreground mt-1">
          {mode === 'verified'
            ? "Fill in the details and we'll text your supervisor to verify."
            : 'Self-tracked hours are saved instantly — no supervisor needed.'}
        </p>
      </div>

      {/* ── Mode toggle ────────────────────────────────────────────────────── */}
      <div className="flex rounded-xl border border-border overflow-hidden mb-6 max-w-sm">
        <button
          type="button"
          onClick={() => setMode('verified')}
          className={cn(
            'flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2',
            mode === 'verified'
              ? 'bg-merit-blue-600 text-white'
              : 'bg-card text-muted-foreground hover:bg-background',
          )}
        >
          <CheckCircle2 className="w-4 h-4" />
          Verified hours
        </button>
        <button
          type="button"
          onClick={() => setMode('tracked')}
          className={cn(
            'flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2',
            mode === 'tracked'
              ? 'bg-amber-500 text-white'
              : 'bg-card text-muted-foreground hover:bg-background',
          )}
        >
          <Clock className="w-4 h-4" />
          Self-tracked
        </button>
      </div>

      {/* Tracker mode explanation */}
      {mode === 'tracked' && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 mb-5 text-sm text-amber-800">
          <p className="font-medium">Self-tracked hours</p>
          <p className="mt-1 text-amber-700">
            No supervisor needed — saved immediately. These show separately on your profile
            and are labeled "Self-reported" on exports. Not counted in leaderboard rankings.
          </p>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* ── LEFT: Form ─────────────────────────────────────────────────── */}
        <div className="flex-[3] min-w-0 space-y-5">

          {/* Draft restored */}
          {draftRestored && mode === 'verified' && (
            <div className="rounded-lg bg-success/8 border border-success/20 px-3 py-2.5">
              <p className="text-[13px] text-success">✓ Draft restored</p>
            </div>
          )}

          {/* Organization */}
          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium text-foreground">Organization</Label>
            <OrgCombobox
              value={org}
              onChange={(o) => { setOrg(o); setOrgError(false); }}
            />
            {orgError && <p className="text-[13px] text-danger">Select an organization.</p>}
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium text-foreground">Date</Label>
            {mode === 'verified' ? (
              <Controller
                name="date"
                control={verifiedForm.control}
                render={({ field }) => (
                  <Popover open={calOpen} onOpenChange={setCalOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className={cn(
                          'flex h-10 w-full items-center px-3 rounded-lg border text-left text-[14px] transition-colors',
                          'border-border hover:border-border bg-card text-foreground',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-merit-blue-600',
                        )}
                      >
                        {field.value ? format(new Date(field.value + 'T00:00:00'), 'MMMM d, yyyy') : 'Select date'}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value + 'T00:00:00') : undefined}
                        onSelect={(d: Date | undefined) => { if (d) { field.onChange(format(d, 'yyyy-MM-dd')); setCalOpen(false); } }}
                        disabled={(d: Date) => d > new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
            ) : (
              <Controller
                name="date"
                control={trackedForm.control}
                render={({ field }) => (
                  <Popover open={calOpen} onOpenChange={setCalOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className={cn(
                          'flex h-10 w-full items-center px-3 rounded-lg border text-left text-[14px] transition-colors',
                          'border-border hover:border-border bg-card text-foreground',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-merit-blue-600',
                        )}
                      >
                        {field.value ? format(new Date(field.value + 'T00:00:00'), 'MMMM d, yyyy') : 'Select date'}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value + 'T00:00:00') : undefined}
                        onSelect={(d: Date | undefined) => { if (d) { field.onChange(format(d, 'yyyy-MM-dd')); setCalOpen(false); } }}
                        disabled={(d: Date) => d > new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
            )}
          </div>

          {/* Hours */}
          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium text-foreground">Hours worked</Label>
            {mode === 'verified' ? (
              <>
                <Input
                  type="number" min={0.5} max={12} step={0.5} placeholder="e.g. 3"
                  {...verifiedForm.register('hours', { valueAsNumber: true })}
                  className={cn(verifiedForm.formState.errors.hours && 'border-danger')}
                />
                {verifiedForm.formState.errors.hours && (
                  <p className="text-[13px] text-danger">{verifiedForm.formState.errors.hours.message}</p>
                )}
              </>
            ) : (
              <>
                <Input
                  type="number" min={0.5} max={12} step={0.5} placeholder="e.g. 3"
                  {...trackedForm.register('hours', { valueAsNumber: true })}
                  className={cn(trackedForm.formState.errors.hours && 'border-danger')}
                />
                {trackedForm.formState.errors.hours && (
                  <p className="text-[13px] text-danger">{trackedForm.formState.errors.hours.message}</p>
                )}
              </>
            )}
            <p className="text-[12px] text-muted-foreground">Max 12 hrs per session</p>
          </div>

          {/* Activity */}
          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium text-foreground">Activity description</Label>
            <div className="relative">
              {mode === 'verified' ? (
                <Textarea
                  {...verifiedForm.register('activity')}
                  rows={3}
                  maxLength={500}
                  placeholder="What did you actually do? Sorting food, tutoring a kid, etc."
                  className={cn('resize-none pr-14', verifiedForm.formState.errors.activity && 'border-danger')}
                />
              ) : (
                <Textarea
                  {...trackedForm.register('activity')}
                  rows={3}
                  maxLength={500}
                  placeholder="What did you actually do? Sorting food, tutoring a kid, etc."
                  className={cn('resize-none pr-14', trackedForm.formState.errors.activity && 'border-danger')}
                />
              )}
              <span className={cn(
                'absolute bottom-2.5 right-3 text-[11px] tabular-nums pointer-events-none',
                activityLen > 450 ? 'text-danger' : 'text-muted-foreground',
              )}>
                {activityLen}/500
              </span>
            </div>
            {mode === 'verified' && verifiedForm.formState.errors.activity && (
              <p className="text-[13px] text-danger">{verifiedForm.formState.errors.activity.message}</p>
            )}
            {mode === 'tracked' && trackedForm.formState.errors.activity && (
              <p className="text-[13px] text-danger">{trackedForm.formState.errors.activity.message}</p>
            )}
          </div>

          {/* Supervisor section — verified mode only */}
          {mode === 'verified' && (
            <div className="rounded-lg bg-background border border-border p-4 space-y-4">
              <div>
                <p className="text-[13px] font-semibold text-foreground">Who supervised you?</p>
                <p className="text-[12px] text-muted-foreground mt-0.5">
                  They&apos;ll get one text to confirm — no account or app required.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[13px] font-medium text-foreground">Name</Label>
                  <Input
                    {...verifiedForm.register('supervisorName')}
                    placeholder="Sarah Kim"
                    className={cn(verifiedForm.formState.errors.supervisorName && 'border-danger')}
                  />
                  {verifiedForm.formState.errors.supervisorName && (
                    <p className="text-[12px] text-danger">
                      {verifiedForm.formState.errors.supervisorName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[13px] font-medium text-foreground">Mobile number</Label>
                  <Input
                    {...verifiedForm.register('supervisorPhone')}
                    type="tel"
                    placeholder="(604) 555-0201"
                    className={cn(verifiedForm.formState.errors.supervisorPhone && 'border-danger')}
                  />
                  {verifiedForm.formState.errors.supervisorPhone && (
                    <p className="text-[12px] text-danger">
                      {verifiedForm.formState.errors.supervisorPhone.message}
                    </p>
                  )}
                </div>
              </div>
              {!showEmail ? (
                <button
                  type="button"
                  onClick={() => setShowEmail(true)}
                  className="text-[12px] font-medium text-merit-blue-600 hover:text-merit-blue-700 transition-colors"
                >
                  + also send via email
                </button>
              ) : (
                <div className="space-y-1.5">
                  <Label className="text-[13px] font-medium text-foreground">Email (optional)</Label>
                  <Input
                    {...verifiedForm.register('supervisorEmail')}
                    type="email"
                    placeholder="sarah@foodbank.bc.ca"
                  />
                </div>
              )}
            </div>
          )}

          {/* Tracker note — tracked mode only */}
          {mode === 'tracked' && (
            <div className="space-y-1.5">
              <Label className="text-[13px] font-medium text-foreground">
                Note <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Input
                {...trackedForm.register('trackerNote')}
                placeholder="e.g. Personal practice, remote volunteering, etc."
              />
            </div>
          )}

          {/* Submit */}
          {mode === 'verified' ? (
            <Button
              type="button"
              onClick={verifiedForm.handleSubmit(onSubmitVerified)}
              disabled={loading}
              className="bg-merit-blue-600 hover:bg-merit-blue-700 active:scale-[0.98] text-white font-medium px-8 transition-all w-full sm:w-auto"
            >
              {loading ? (
                <><Loader2 size={14} className="mr-2 animate-spin" />Sending...</>
              ) : (
                'Send for verification'
              )}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={trackedForm.handleSubmit(onSubmitTracked)}
              disabled={loading}
              className="bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white font-medium px-8 transition-all w-full sm:w-auto"
            >
              {loading ? (
                <><Loader2 size={14} className="mr-2 animate-spin" />Saving...</>
              ) : (
                'Save self-tracked hours'
              )}
            </Button>
          )}
        </div>

        {/* ── RIGHT: SMS Preview (verified mode only) ────────────────────── */}
        {mode === 'verified' && (
          <div className="w-full md:flex-[2] md:min-w-0 md:sticky md:top-6">
            <SmsPreview
              supervisorName={watchedVerified.supervisorName}
              studentName={`${user.firstName} ${user.lastName}`.trim() || 'You'}
              hours={watchedVerified.hours}
              org={org?.name ?? ''}
              date={watchedVerified.date}
              activity={watchedVerified.activity}
            />
          </div>
        )}
      </div>
    </div>
  );
}
