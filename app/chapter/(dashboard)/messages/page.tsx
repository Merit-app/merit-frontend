'use client';

import { useState } from 'react';
import { chapterApi, ApiError } from '@/lib/api';
import { Send, AlertTriangle, CheckCircle2, Megaphone } from 'lucide-react';

const AUDIENCES = [
  { key: 'all', label: 'Everyone' },
  { key: 'incomplete', label: 'In progress' },
  { key: 'at_risk', label: 'At risk' },
  { key: 'met', label: 'Completed' },
] as const;

export default function MessagesPage() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState('all');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [reminding, setReminding] = useState(false);
  const [remindResult, setRemindResult] = useState<string | null>(null);

  async function send() {
    if (!title.trim() || !body.trim()) { setError('Add a title and message.'); return; }
    setSending(true); setError(null); setResult(null);
    try {
      const res = await chapterApi.sendAnnouncement({ title: title.trim(), body: body.trim(), audience });
      setResult(`Sent to ${res.data.sent} student${res.data.sent === 1 ? '' : 's'}.`);
      setTitle(''); setBody('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to send.');
    } finally { setSending(false); }
  }

  async function remind() {
    setReminding(true); setRemindResult(null);
    try {
      const res = await chapterApi.remindBehind();
      setRemindResult(`Reminder sent to ${res.data.sent} student${res.data.sent === 1 ? '' : 's'} who are behind.`);
    } catch {
      setRemindResult('Failed to send reminders.');
    } finally { setReminding(false); }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Messages</h1>
        <p className="text-sm text-muted-foreground">Send announcements and reminders to your students.</p>
      </div>

      {/* Compose */}
      <section className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <Megaphone className="h-4 w-4 text-merit-blue-600" />
          <h2 className="font-medium text-foreground">New announcement</h2>
        </div>

        <label className="mb-1 block text-xs font-medium text-muted-foreground">Send to</label>
        <div className="mb-4 flex flex-wrap gap-2">
          {AUDIENCES.map((a) => (
            <button
              key={a.key}
              onClick={() => setAudience(a.key)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                audience === a.key ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={140}
          placeholder="Title (e.g. Reminder: hours due May 30)"
          className="mb-3 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-merit-blue-500 focus:outline-none focus:ring-1 focus:ring-merit-blue-500"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={1000}
          placeholder="Write your message…"
          className="h-32 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-merit-blue-500 focus:outline-none focus:ring-1 focus:ring-merit-blue-500"
        />

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        {result && (
          <p className="mt-2 flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4" /> {result}
          </p>
        )}

        <button
          onClick={send}
          disabled={sending}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-merit-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-merit-blue-700 disabled:opacity-60"
        >
          <Send className="h-4 w-4" /> {sending ? 'Sending…' : 'Send announcement'}
        </button>
        <p className="mt-2 text-xs text-muted-foreground">Delivered to each student&apos;s notification inbox.</p>
      </section>

      {/* Remind behind */}
      <section className="rounded-xl border border-amber-200 bg-amber-50/50 p-6 dark:border-amber-700/40 dark:bg-amber-900/10">
        <div className="mb-1 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <h2 className="font-medium text-foreground">Remind students who are behind</h2>
        </div>
        <p className="mb-3 text-sm text-muted-foreground">
          Sends a personalised reminder (with each student&apos;s remaining hours) to everyone who hasn&apos;t met their goal.
        </p>
        <button
          onClick={remind}
          disabled={reminding}
          className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-60"
        >
          {reminding ? 'Sending…' : 'Remind all behind students'}
        </button>
        {remindResult && <p className="mt-2 text-sm text-muted-foreground">{remindResult}</p>}
      </section>
    </div>
  );
}
