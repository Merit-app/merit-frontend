'use client';

import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { useMeritStore } from '@/lib/store';
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
    description: 'Notifications at 25%, 50%, 75%, and 100% of your NHS or scholarship hour goals.',
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

  function toggle(key: NotificationKey) {
    const next = !notifications[key];
    updateNotifications({ [key]: next });
    toast.success(next ? 'Notification turned on.' : 'Notification turned off.');
  }

  return (
    <div className="px-8 py-8 max-w-2xl">
      <div className="mb-6">
        <h2 className="text-h1 text-ink-900">Notifications</h2>
        <p className="text-small text-ink-500 mt-1">Choose what Merit contacts you about.</p>
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
