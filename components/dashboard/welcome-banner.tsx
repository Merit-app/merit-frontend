'use client';

import Link from 'next/link';
import { Sparkles, CheckCircle2, FileText, MessageSquare } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useMeritStore, useHydrationStore } from '@/lib/store';

export function WelcomeBanner() {
  const hydrated = useHydrationStore((s) => s.hydrated);
  const sessions = useMeritStore((s) => s.sessions);
  const user = useMeritStore((s) => s.user);
  const [exported, setExported] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setExported(window.localStorage.getItem('merit_pdf_exported') === 'true');
  }, []);

  if (!hydrated) return null;

  if (sessions.length > 0) return null;

  const checked = {
    logged: sessions.length > 0,
    verified: sessions.some((s) => s.status === 'verified'),
    exported,
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6 mb-6">
      <div className="flex items-start gap-3 mb-5">
        <div className="w-11 h-11 rounded-2xl bg-merit-blue-50 flex items-center justify-center text-merit-blue-600">
          <Sparkles size={22} />
        </div>
        <div>
          <p className="text-[18px] font-semibold text-foreground mb-1">Get started with Merit</p>
          <p className="text-[13px] text-muted-foreground leading-relaxed">
            Follow the checklist below to build your first verified hours record.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {[
          { icon: MessageSquare, label: 'Log your first session', done: checked.logged },
          { icon: CheckCircle2, label: 'Get it verified by your supervisor', done: checked.verified },
          { icon: FileText, label: 'Export your first PDF', done: checked.exported },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-card text-foreground">
              {item.done ? <CheckCircle2 size={16} className="text-success" /> : <item.icon size={16} />}
            </div>
            <p className={item.done ? 'text-foreground' : 'text-muted-foreground'}>{item.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <Link
          href="/log"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-merit-blue-600 px-4 py-2 text-[13px] font-semibold text-white hover:bg-merit-blue-700 transition-colors"
        >
          Log first session
        </Link>
        <Link
          href="/export"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-[13px] font-semibold text-foreground hover:bg-background transition-colors"
        >
          Export your PDF
        </Link>
      </div>
    </div>
  );
}
