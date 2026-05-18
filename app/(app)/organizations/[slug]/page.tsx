'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Plus, Globe, MapPin, ShieldCheck, CheckCircle } from 'lucide-react';
import { StatusBadge } from '@/components/hours/status-badge';
import { SessionDetailSheet } from '@/components/hours/session-detail-sheet';
import { useMeritStore } from '@/lib/store';
import { formatSessionDate } from '@/lib/utils';
import type { Session } from '@/lib/types';

export default function OrgDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const organizations = useMeritStore((s) => s.organizations);
  const sessions = useMeritStore((s) => s.sessions);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const org = organizations.find((o) => o.slug === slug);
  if (!org) notFound();

  const orgSessions = [...sessions]
    .filter((s) => s.orgSlug === slug)
    .sort((a, b) => b.date.localeCompare(a.date));

  const totalHours = orgSessions
    .filter((s) => s.status === 'verified')
    .reduce((sum, s) => sum + s.hours, 0);

  const supervisors = [...new Set(orgSessions.map((s) => s.supervisor))];
  const hoursStr = totalHours % 1 === 0 ? `${totalHours}` : totalHours.toFixed(1);

  return (
    <div className="px-8 py-8">
      {/* Breadcrumb */}
      <p className="text-small text-ink-500 mb-4">
        <Link href="/organizations" className="hover:text-ink-700 transition-colors">
          Organizations
        </Link>
        {' · '}
        <span className="text-ink-700">{org.name}</span>
      </p>

      <div className="flex gap-8 items-start">
        {/* ── LEFT: Session list ───────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-h1 text-ink-900">{org.name}</h1>
            <Link
              href={`/log?org=${org.slug}`}
              className="flex items-center gap-1.5 bg-merit-blue-600 hover:bg-merit-blue-700 text-white text-[13px] font-medium px-3.5 py-2 rounded-lg transition-colors"
            >
              <Plus size={14} />
              Log session here
            </Link>
          </div>

          {/* Sessions */}
          {orgSessions.length === 0 ? (
            <div className="bg-white rounded-xl border border-ink-200 p-8 text-center">
              <p className="text-[14px] font-medium text-ink-900 mb-1">No sessions yet.</p>
              <p className="text-small text-ink-500 mb-4">
                Log your first session at {org.name} to start building your record.
              </p>
              <Link
                href={`/log?org=${org.slug}`}
                className="inline-flex items-center gap-1.5 bg-merit-blue-600 hover:bg-merit-blue-700 text-white text-[13px] font-medium px-4 py-2 rounded-lg transition-colors"
              >
                <Plus size={14} />
                Log first session
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-ink-200 overflow-hidden">
              {orgSessions.map((session) => {
                const hrs = session.hours % 1 === 0 ? `${session.hours}` : session.hours.toFixed(1);
                return (
                  <button
                    key={session.id}
                    type="button"
                    onClick={() => { setSelectedSession(session); setSheetOpen(true); }}
                    className="w-full flex items-center gap-4 px-5 py-3.5 border-b border-ink-100 last:border-0 hover:bg-ink-50 transition-colors text-left cursor-pointer"
                  >
                    <span className="text-small text-ink-500 w-20 shrink-0">{formatSessionDate(session.date)}</span>
                    <span className="flex-1 min-w-0">
                      <span className="text-[13px] text-ink-900 block truncate">{session.activity}</span>
                      <span className="text-[12px] text-ink-500">{session.supervisor}</span>
                    </span>
                    <span className="text-[13px] font-medium text-ink-900 tabular-nums shrink-0">{hrs} hrs</span>
                    <StatusBadge status={session.status} />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── RIGHT: Org sidebar ───────────────────────────────────────────── */}
        <div className="w-64 shrink-0 space-y-4">
          {/* Stats */}
          <div className="bg-white rounded-xl border border-ink-200 p-5 space-y-3">
            <p className="text-h3 text-ink-900">Summary</p>
            <div className="space-y-2 text-[13px]">
              <div className="flex justify-between">
                <span className="text-ink-500">Total hours</span>
                <span className="font-medium text-ink-900">{hoursStr} hrs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-500">Sessions</span>
                <span className="font-medium text-ink-900">{orgSessions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-500">Supervisors</span>
                <span className="font-medium text-ink-900">{supervisors.length}</span>
              </div>
            </div>
          </div>

          {/* Org info */}
          <div className="bg-white rounded-xl border border-ink-200 p-5 space-y-3">
            <p className="text-h3 text-ink-900">About</p>

            {/* Registration status */}
            <div>
              {org.registrationStatus === 'institutional' && (
                <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-merit-blue-700 bg-merit-blue-50 px-2.5 py-1 rounded-full">
                  <ShieldCheck size={12} />
                  Institutional partner
                </span>
              )}
              {org.registrationStatus === 'registered' && (
                <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-success bg-success-bg px-2.5 py-1 rounded-full">
                  <CheckCircle size={12} />
                  Registered nonprofit
                </span>
              )}
              {org.registrationStatus === 'unregistered' && (
                <span className="text-[12px] text-ink-500 bg-ink-100 px-2.5 py-1 rounded-full">
                  Unregistered
                </span>
              )}
            </div>

            {org.address && (
              <div className="flex items-start gap-2 text-[12px] text-ink-600">
                <MapPin size={13} className="text-ink-400 mt-0.5 shrink-0" />
                {org.address}
              </div>
            )}
            {org.website && (
              <div className="flex items-center gap-2 text-[12px]">
                <Globe size={13} className="text-ink-400 shrink-0" />
                <a href={org.website} target="_blank" rel="noopener noreferrer" className="text-merit-blue-600 hover:underline truncate">
                  {org.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
            {org.ein && (
              <div className="text-[12px] text-ink-500">
                EIN: <span className="font-mono">{org.ein}</span>
              </div>
            )}
          </div>

          {/* Supervisors */}
          {supervisors.length > 0 && (
            <div className="bg-white rounded-xl border border-ink-200 p-5 space-y-2">
              <p className="text-h3 text-ink-900">Supervisors</p>
              {supervisors.map((name) => (
                <div key={name} className="flex items-center gap-2">
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold"
                    style={{ background: '#DBEAFE', color: '#1D4ED8' }}
                  >
                    {name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                  </span>
                  <span className="text-[13px] text-ink-900">{name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <SessionDetailSheet
        session={selectedSession}
        open={sheetOpen}
        onClose={() => { setSheetOpen(false); setSelectedSession(null); }}
      />
    </div>
  );
}
