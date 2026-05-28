'use client';

import { Bell } from 'lucide-react';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { useMeritStore } from '@/lib/store';
import { usersApi, ApiError } from '@/lib/api';
import type { NotificationKey } from '@/lib/types';

const NOTIFICATION_OPTIONS: { key: NotificationKey; label: string; description: string }[] = [
  {
    key: 'smsVerification',
    label: 'SMS verification updates',
    description: 'Get a text when your supervisor confirms or disputes a session.',
  },
  {
    key: 'weeklyProgress',
    label: 'Weekly progress emails',
    description: "A short Sunday email showing your hours for the week and where you stand on your goal.",
  },
  {
    key: 'goalMilestones',
    label: 'Goal milestones',
    description: 'Notifications at 25%, 50%, 75%, and 100% of your service hour goals.',
  },
  {
    key: 'productUpdates',
    label: 'Product updates',
    description: 'Occasional emails about new Merit features. No marketing, no spam.',
  },
];

export default function NotificationsPage() {
  const notifications = useMeritStore((s) => s.notifications);
  const updateNotifications = useMeritStore((s) => s.updateNotifications);

  async function toggle(key: NotificationKey) {
    const next = !notifications[key];
    // Optimistic update
    updateNotifications({ [key]: next });
    try {
      await usersApi.update({
        notifications: { ...notifications, [key]: next },
      });
      toast.success(next ? 'Notification turned on.' : 'Notification turned off.');
    } catch (err) {
      // Rollback on failure
      updateNotifications({ [key]: !next });
      if (err instanceof ApiError) {
        toast.error(err.message || 'Failed to save notification preference.');
      } else {
        toast.error('Could not reach the server.');
      }
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-h1 text-ink-900">Notifications</h2>
        <p className="text-small text-ink-500 mt-1">Choose what Merit contacts you about.</p>
      </div>

      <div className="rounded-3xl border border-ink-200 bg-ink-50 p-5 mb-6 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-merit-blue-600">
          <Bell size={20} />
        </div>
        <div>
          <p className="text-[14px] font-semibold text-ink-900">You're all caught up</p>
          <p className="text-[13px] text-ink-500">
            Notifications will appear here when your hours are verified or disputed.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-ink-200 divide-y divide-ink-200">
        {NOTIFICATION_OPTIONS.map(({ key, label, description }) => (
          <div key={key} className="flex items-center justify-between px-5 py-4 gap-6">
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-ink-900">{label}</p>
              <p className="text-small text-ink-500 mt-0.5">{description}</p>
            </div>
            {/* Toggle */}
            <button
              role="switch"
              aria-checked={notifications[key]}
              onClick={() => toggle(key)}
              className={[
                'relative shrink-0 h-5 w-9 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-merit-blue-600 focus-visible:ring-offset-2',
                notifications[key] ? 'bg-merit-blue-600' : 'bg-ink-200',
              ].join(' ')}
            >
              <span
                className={[
                  'absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200',
                  notifications[key] ? 'translate-x-4' : 'translate-x-0',
                ].join(' ')}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
