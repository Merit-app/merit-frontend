'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Minus, Plus } from 'lucide-react';
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

const schema = z.object({
  date: z.string().min(1, 'Select a date'),
  hours: z.number().min(0.5, 'Minimum 0.5 hrs').max(12, 'Maximum 12 hrs'),
  activity: z.string().min(5, 'Describe what you did').max(200, 'Keep it under 200 characters'),
  supervisorName: z.string().min(2, 'Enter supervisor name'),
  supervisorPhone: z.string().min(10, 'Enter a valid phone number'),
  supervisorEmail: z.string().email().optional().or(z.literal('')),
});

type FormData = z.infer<typeof schema>;

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

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
      hours: 4,
      activity: '',
      supervisorName: '',
      supervisorPhone: '',
      supervisorEmail: '',
    },
  });

  const watchedValues = watch();
  const activityLen = (watchedValues.activity ?? '').length;

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
      setSuccess(true);
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
    reset();
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
            <Controller
              name="hours"
              control={control}
              render={({ field }) => (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => field.onChange(Math.max(0.5, +(field.value - 0.5).toFixed(1)))}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-ink-200 hover:bg-ink-50 transition-colors"
                    aria-label="Decrease hours"
                  >
                    <Minus size={14} className="text-ink-700" />
                  </button>
                  <Input
                    type="number"
                    step={0.5}
                    min={0.5}
                    max={12}
                    value={field.value}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0.5)}
                    className="text-center font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => field.onChange(Math.min(12, +(field.value + 0.5).toFixed(1)))}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-ink-200 hover:bg-ink-50 transition-colors"
                    aria-label="Increase hours"
                  >
                    <Plus size={14} className="text-ink-700" />
                  </button>
                </div>
              )}
            />
            {errors.hours && <p className="text-[13px] text-danger">{errors.hours.message}</p>}
          </div>

          {/* Activity */}
          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium text-ink-900">Activity description</Label>
            <div className="relative">
              <Textarea
                {...register('activity')}
                rows={3}
                maxLength={200}
                placeholder="What did you actually do? Sorting food, tutoring a kid, etc."
                className={cn('resize-none pr-14', errors.activity && 'border-danger')}
              />
              <span className={cn(
                'absolute bottom-2.5 right-3 text-[11px] tabular-nums pointer-events-none',
                activityLen > 180 ? 'text-warning' : 'text-ink-400'
              )}>
                {activityLen}/200
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
