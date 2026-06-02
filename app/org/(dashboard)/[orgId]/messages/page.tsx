'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { orgMessagesApi, orgEventsApi } from '@/lib/api';
import { toast } from 'sonner';
import { Send, Loader2 } from 'lucide-react';

type Filter = 'all' | 'event' | 'active_30d' | 'active_90d';

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All volunteers' },
  { value: 'active_30d', label: 'Active last 30 days' },
  { value: 'active_90d', label: 'Active last 90 days' },
  { value: 'event', label: 'Specific event' },
];

export default function MessagesPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const qc = useQueryClient();
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [isSending, setIsSending] = useState(false);

  const { data: historyRes, refetch } = useQuery({
    queryKey: ['org-messages', orgId],
    queryFn: () => orgMessagesApi.history(orgId),
  });
  const history: any[] = (historyRes as any)?.data ?? [];

  const { data: eventsRes } = useQuery({
    queryKey: ['org-events-published', orgId],
    queryFn: () => orgEventsApi.list(orgId, { status: 'published' }),
  });
  const events: any[] = (eventsRes as any)?.data ?? [];

  const handleSend = async () => {
    if (!message.trim()) return;
    if (filter === 'event' && !selectedEvent) {
      toast.error('Select an event first');
      return;
    }
    setIsSending(true);
    try {
      const res = await orgMessagesApi.send(orgId, {
        message: message.trim(),
        filter,
        eventId: filter === 'event' ? selectedEvent : undefined,
      });
      const { sent, failed } = (res as any).data;
      toast.success(
        `Sent to ${sent} volunteer${sent !== 1 ? 's' : ''}` +
        (failed > 0 ? ` (${failed} failed)` : ''),
      );
      setMessage('');
      refetch();
      qc.invalidateQueries({ queryKey: ['org-messages', orgId] });
    } catch {
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Messages</h1>
        <p className="text-gray-400 text-sm mt-1">Send SMS announcements to your volunteers</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
        <h3 className="font-semibold text-white">Send announcement</h3>

        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Send to</label>
          <div className="flex gap-2 flex-wrap">
            {FILTERS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filter === opt.value
                    ? 'bg-white text-gray-900'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {filter === 'event' && (
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-500"
          >
            <option value="">Select event...</option>
            {events.map((e: any) => (
              <option key={e.id} value={e.id}>{e.title}</option>
            ))}
          </select>
        )}

        <div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your announcement..."
            rows={4}
            maxLength={300}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm resize-none placeholder-gray-600 focus:outline-none focus:border-gray-500 transition-colors"
          />
          <div className="flex justify-between mt-1">
            <p className="text-xs text-gray-600">Sent via SMS to volunteers&apos; phones</p>
            <p className="text-xs text-gray-600">{message.length}/300</p>
          </div>
        </div>

        <button
          onClick={handleSend}
          disabled={isSending || !message.trim()}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white text-gray-900 font-semibold text-sm hover:bg-gray-100 disabled:opacity-50 transition-colors"
        >
          {isSending ? (
            <><Loader2 className="w-4 h-4 animate-spin" />Sending...</>
          ) : (
            <><Send className="w-4 h-4" />Send message</>
          )}
        </button>
      </div>

      {history.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">History</h3>
          {history.map((msg: any) => (
            <div key={msg.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-2">
              <p className="text-white text-sm">{msg.message}</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>
                  Sent to {msg.recipient_count} volunteer{msg.recipient_count !== 1 ? 's' : ''}
                </span>
                <span>
                  {new Date(msg.sent_at).toLocaleDateString('en-CA', {
                    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
