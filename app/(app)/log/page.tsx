'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
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

const DRAFT_STORAGE_KEY = 'log-form-draft';
const DRAFT_RESTORED_SHOWN_KEY = 'draft-restored-shown';

const schema = z.object({
  date: z.string().min(1, 'Select a date'),
  hours: z.number().min(0.5, 'Minimum 0.5 hrs').max(12, 'Maximum 12 hrs'),
  activity: z.string().min(5, 'Describe what you did').max(500, 'Keep it under 500 characters'),
  supervisorName: z.string().min(2, 'Enter supervisor name'),
  supervisorPhone: z.string().min(10, 'Enter a valid phone number'),
  supervisorEmail: z.string().email().optional().or(z.literal('')),
});

type FormData = z.infer<typeof schema>;

const DEFAULT_VALUES: FormData = {
  date: format(new Date(), 'yyyy-MM-dd'),
  hours: 4,
  activity: '',
  supervisorName: '',
  supervisorPhone: '',
  supervisorEmail: '',
};

export default function LogPage() {
  const user = useMeritStore((s) => s.user);
  const addSession = useMeritStore((s) => s.addSession);

  const [org, setOrg] = useState<Organization | null>(null);
  const [orgError, setOrgError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submittedSupervisor, setSubmittedSupervisor] = useState('');
  const [showEmail, setShowEmail] = useState(false);
  const [calOpen, setCalOpen] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: DEFAULT_VALUES,
  });

  const watchedValues = watch();
  const activityLen = (watchedValues.activity ?? '').length;

  // Load draft on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const draft = localStorage.getItem(DRAFT_STORAGE_KEY);
    const draftShown = localStorage.getItem(DRAFT_RESTORED_SHOWN_KEY);
    
    if (draft && !draftShown) {
      try {
        const parsed = JSON.parse(draft);
        reset(parsed);
        setDraftRestored(true);
        localStorage.setItem(DRAFT_RESTORED_SHOWN_KEY, 'true');
        // Hide message after 4 seconds
        setTimeout(() => setDraftRestored(false), 4000);
      } catch {
        // Invalid draft, ignore
      }
    }
  }, [reset]);

  // Save draft on form changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const timer = setTimeout(() => {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(watchedValues));
    }, 500); // Debounce
    return () => clearTimeout(timer);
  }, [watchedValues]);

  async function onSubmit(data: FormData) {
    if (!org) { setOrgError(true); return; }
    setLoading(true);

    try {
      // Build the session payload — use orgId for existing orgs, newOrg for brand-new ones
      const orgPayload = org.id
        ? { orgId: org.id }
        : { newOrg: { name: org.name } };

      const res = await sessionsApi.create({
        ...orgPayload,
        date: data.date,
        hours: data.hours,
        activity: data.activity,
        supervisorName: data.supervisorName,
        supervisorPhone: data.supervisorPhone || undefined,
        supervisorEmail: data.supervisorEmail || undefined,
      });

      const session = mapSession(res.data.session);
      addSession(session);
      setSubmittedSupervisor(data.supervisorName);
      
      // Clear draft on success
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      localStorage.removeItem(DRAFT_RESTORED_SHOWN_KEY);
      
      setSuccess(true);
      toast.success('Session logged successfully');
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === 'invalid_phone') {
          toast.error('That phone number doesn\'t look right. Include the area code.');
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

  function handleLogAnother() {
    reset(DEFAULT_VALUES);
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    localStorage.removeItem(DRAFT_RESTORED_SHOWN_KEY);
    setOrg(null);
    setOrgError(false);
    setSuccess(false);
    setSubmittedSupervisor('');
  }

  if (success) {
    return (
      <div className="px-4 py-4 md:px-8 md:py-6">
        <SuccessState supervisorName={submittedSupervisor} onLogAnother={handleLogAnother} />
      </div>
    );
  }

  return (
    <div className="px-4 py-4 md:px-8 md:py-6">
      <div className="mb-6">
        <h1 className="text-h1 text-ink-900">Log hours</h1>
        <p className="text-small text-ink-500 mt-1">
          Fill in the details and we'll text your supervisor to verify.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* ── LEFT: Form (60%) ────────────────────────────────────────────── */}
        <div className="flex-[3] min-w-0 space-y-5">

          {/* Draft restored message */}
          {draftRestored && (
            <div className="rounded-lg bg-success/8 border border-success/20 px-3 py-2.5">
              <p className="text-[13px] text-success">✓ Draft restored</p>
            </div>
          )}

          {/* Organization */}
          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium text-ink-900">Organization</Label>
            <OrgCombobox
              value={org}
              onChange={(o) => { setOrg(o); setOrgError(false); }}
            />
            {orgError && <p className="text-[13px] text-danger">Select an organization.</p>}
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium text-ink-900">Date</Label>
            <Controller
              name="date"
              control={control}
              render={({ field }) => (
                <Popover open={calOpen} onOpenChange={setCalOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        'flex h-10 w-full items-center px-3 rounded-lg border text-left text-[14px] transition-colors',
                        'border-ink-200 hover:border-ink-300 bg-white text-ink-900',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-merit-blue-600'
                      )}
                    >
                      {field.value
                        ? format(new Date(field.value + 'T00:00:00'), 'MMMM d, yyyy')
                        : 'Select date'}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value + 'T00:00:00') : undefined}
                      onSelect={(d) => {
                        if (d) { field.onChange(format(d, 'yyyy-MM-dd')); setCalOpen(false); }
                      }}
                      disabled={(d) => d > new Date()}
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
            {errors.date && <p className="text-[13px] text-danger">{errors.date.message}</p>}
          </div>

          {/* Hours */}
          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium text-ink-900">Hours worked</Label>
            <Input
              type="number"
              min={0.5}
              max={12}
              step={0.5}
              placeholder="e.g. 3"
              {...register('hours', { valueAsNumber: true })}
              className={cn(errors.hours && 'border-danger')}
            />
            <p className="text-[12px] text-ink-400">Max 12 hrs per session</p>
            {errors.hours && <p className="text-[13px] text-danger">{errors.hours.message}</p>}
          </div>

          {/* Activity */}
          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium text-ink-900">Activity description</Label>
            <div className="relative">
              <Textarea
                {...register('activity')}
                rows={3}
                maxLength={500}
                placeholder="What did you actually do? Sorting food, tutoring a kid, etc."
                className={cn('resize-none pr-14', errors.activity && 'border-danger')}
              />
              <span className={cn(
                'absolute bottom-2.5 right-3 text-[11px] tabular-nums pointer-events-none',
                activityLen > 450 ? 'text-danger' : 'text-ink-400'
              )}>
                {activityLen}/500
              </span>
            </div>
            {errors.activity && <p className="text-[13px] text-danger">{errors.activity.message}</p>}
          </div>

          {/* Supervisor section */}
          <div className="rounded-lg bg-ink-50 border border-ink-200 p-4 space-y-4">
            <div>
              <p className="text-[13px] font-semibold text-ink-900">Who supervised you?</p>
              <p className="text-[12px] text-ink-500 mt-0.5">
                They'll get one text to confirm — no account or app required.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[13px] font-medium text-ink-900">Name</Label>
                <Input
                  {...register('supervisorName')}
                  placeholder="Sarah Kim"
                  className={cn(errors.supervisorName && 'border-danger')}
                />
                {errors.supervisorName && (
                  <p className="text-[12px] text-danger">{errors.supervisorName.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-[13px] font-medium text-ink-900">Mobile number</Label>
                <Input
                  {...register('supervisorPhone')}
                  type="tel"
                  placeholder="(604) 555-0201"
                  className={cn(errors.supervisorPhone && 'border-danger')}
                />
                {errors.supervisorPhone && (
                  <p className="text-[12px] text-danger">{errors.supervisorPhone.message}</p>
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
                <Label className="text-[13px] font-medium text-ink-900">Email (optional)</Label>
                <Input
                  {...register('supervisorEmail')}
                  type="email"
                  placeholder="sarah@foodbank.bc.ca"
                />
              </div>
            )}
          </div>

          {/* Submit */}
          <Button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={loading}
            className="bg-merit-blue-600 hover:bg-merit-blue-700 active:scale-[0.98] text-white font-medium px-8 transition-all w-full sm:w-auto"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              'Send for verification'
            )}
          </Button>
        </div>

        {/* ── RIGHT: SMS Preview (40%) ─────────────────────────────────────── */}
        <div className="w-full md:flex-[2] md:min-w-0 md:sticky md:top-6">
          <SmsPreview
            supervisorName={watchedValues.supervisorName}
            studentName={`${user.firstName} ${user.lastName}`.trim() || 'You'}
            hours={watchedValues.hours}
            org={org?.name ?? ''}
            date={watchedValues.date}
            activity={watchedValues.activity}
          />
        </div>
      </div>
    </div>
  );
}
