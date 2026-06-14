'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { orgEventsApi, ApiError } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const inputClass =
  'w-full bg-muted border border-border text-foreground rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/25 transition-[border-color,box-shadow]';
const labelClass = 'block text-sm font-medium text-muted-foreground mb-1.5';

export default function CreateEventPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    program: '',
    startTime: '',
    endTime: '',
    maxVolunteers: '',
    hoursValue: '',
    autoLogHours: true,
  });

  const update = <K extends keyof typeof form>(k: K, v: typeof form[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent, publish = false) => {
    e.preventDefault();
    if (!form.title || !form.startTime || !form.endTime) {
      toast.error('Please fill in required fields');
      return;
    }
    if (form.title.trim().length < 2) {
      toast.error('Event title must be at least 2 characters');
      return;
    }
    if (new Date(form.endTime) <= new Date(form.startTime)) {
      toast.error('End time must be after the start time');
      return;
    }
    setIsLoading(true);
    try {
      const res = await orgEventsApi.create(orgId, {
        title: form.title,
        description: form.description || undefined,
        location: form.location || undefined,
        program: form.program || undefined,
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString(),
        maxVolunteers: form.maxVolunteers ? parseInt(form.maxVolunteers) : undefined,
        hoursValue: form.hoursValue ? parseFloat(form.hoursValue) : undefined,
        autoLogHours: form.autoLogHours,
        // Capture the organizer's zone so invite emails/SMS show the same
        // wall-clock time they entered (datetime-local has no tz of its own).
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      const eventId = (res as any).data?.id;
      if (publish && eventId) {
        await orgEventsApi.publish(orgId, eventId);
        toast.success('Event published! Volunteers notified.');
      } else {
        toast.success('Event saved as draft');
      }
      router.push(`/org/${orgId}/events/${eventId}`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to create event');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/org/${orgId}/events`} className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Create event</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Set up a volunteer shift or opportunity</p>
        </div>
      </div>

      <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label className={labelClass}>Event title <span className="text-danger">*</span></label>
          <input
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="e.g. Saturday Food Bank Shift"
            className={inputClass}
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Start time <span className="text-danger">*</span></label>
            <input
              type="datetime-local"
              value={form.startTime}
              onChange={(e) => update('startTime', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>End time <span className="text-danger">*</span></label>
            <input
              type="datetime-local"
              value={form.endTime}
              onChange={(e) => update('endTime', e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Location</label>
          <input
            value={form.location}
            onChange={(e) => update('location', e.target.value)}
            placeholder="e.g. 123 Main St, Vancouver"
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Max volunteers</label>
            <input
              type="number"
              value={form.maxVolunteers}
              onChange={(e) => update('maxVolunteers', e.target.value)}
              placeholder="No limit"
              min="1"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Hours value</label>
            <input
              type="number"
              value={form.hoursValue}
              onChange={(e) => update('hoursValue', e.target.value)}
              placeholder="Auto from duration"
              step="0.5"
              min="0.5"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Program</label>
          <input
            value={form.program}
            onChange={(e) => update('program', e.target.value)}
            placeholder="e.g. Food Bank Operations"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <textarea
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            placeholder="What will volunteers be doing?"
            rows={3}
            className={`${inputClass} resize-none`}
          />
        </div>

        {/* Auto-log toggle */}
        <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl border border-border">
          <button
            type="button"
            role="switch"
            aria-checked={form.autoLogHours}
            onClick={() => update('autoLogHours', !form.autoLogHours)}
            className={`relative w-11 h-6 rounded-full shrink-0 transition-colors ${
              form.autoLogHours ? 'bg-merit-blue-600' : 'bg-ink-300 dark:bg-secondary'
            }`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
              form.autoLogHours ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </button>
          <div className="min-w-0">
            <p className="text-foreground text-sm font-medium">Auto-log hours on completion</p>
            <p className="text-muted-foreground text-xs">
              Hours added for all checked-in volunteers when you mark the event complete
            </p>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={(e) => handleSubmit(e, false)}
            disabled={isLoading}
            className="flex-1 py-3 rounded-xl border border-border bg-card text-muted-foreground text-sm font-medium hover:bg-muted hover:text-foreground disabled:opacity-50 transition-colors"
          >
            Save as draft
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            disabled={isLoading}
            className="flex-1 py-3 rounded-xl bg-foreground text-background text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? 'Creating...' : 'Publish + notify volunteers'}
          </button>
        </div>
      </form>
    </div>
  );
}
