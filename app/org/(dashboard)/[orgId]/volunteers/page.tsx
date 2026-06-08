'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orgVolunteersApi } from '@/lib/api';
import { toast } from 'sonner';
import { Search, Download, CheckCircle2, ChevronDown, ChevronRight, ExternalLink, Mail, Phone, GraduationCap } from 'lucide-react';

function fmtDate(iso: string) {
  try { return new Date(iso).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' }); }
  catch { return iso; }
}

export default function VolunteersPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: volunteersRes, isLoading } = useQuery({
    queryKey: ['org-volunteers', orgId],
    queryFn: () => orgVolunteersApi.list(orgId),
  });
  // API shape is { data: { volunteers: [...] } } — read the nested array, and
  // guard with Array.isArray so a non-array can never crash .filter().
  const rawVolunteers = (volunteersRes as any)?.data?.volunteers ?? (volunteersRes as any)?.data;
  const volunteers: any[] = Array.isArray(rawVolunteers) ? rawVolunteers : [];

  const verifySession = useMutation({
    mutationFn: (sessionId: string) => orgVolunteersApi.verify(orgId, sessionId),
    onSuccess: () => { toast.success('Verified'); qc.invalidateQueries({ queryKey: ['org-volunteers', orgId] }); },
    onError: () => toast.error('Failed to verify'),
  });

  const disputeSession = useMutation({
    mutationFn: (sessionId: string) => orgVolunteersApi.dispute(orgId, sessionId),
    onSuccess: () => { toast.success('Disputed'); qc.invalidateQueries({ queryKey: ['org-volunteers', orgId] }); },
    onError: () => toast.error('Failed to dispute'),
  });

  const handleExport = async () => {
    try {
      const blob = await orgVolunteersApi.export(orgId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `volunteers-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Export downloaded');
    } catch {
      toast.error('Export failed');
    }
  };

  const filtered = volunteers.filter((v) =>
    !search || v.student?.name?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Volunteers</h1>
          <p className="text-gray-400 text-sm mt-1">{volunteers.length} people have volunteered here</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 text-gray-300 text-sm font-medium hover:bg-gray-700 hover:text-white transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search volunteers..."
          className="w-full bg-gray-900 border border-gray-800 text-white rounded-xl pl-10 pr-4 py-3 text-sm placeholder-gray-600 focus:outline-none focus:border-gray-600 transition-colors"
        />
      </div>

      <div className="space-y-2">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-900 rounded-2xl animate-pulse" />
          ))
        ) : filtered.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
            <p className="text-gray-500">{search ? 'No matching volunteers.' : 'No volunteers yet.'}</p>
          </div>
        ) : (
          filtered.map((v: any) => (
            <div key={v.student.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === v.student.id ? null : v.student.id)}
                className="w-full flex items-center gap-4 p-4 hover:bg-gray-800/50 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center font-bold text-gray-400 shrink-0">
                  {v.student.name?.[0] ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-white text-sm">{v.student.name}</p>
                    {v.student.username && (
                      <a
                        href={`/u/${v.student.username}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-gray-600 hover:text-gray-400"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <p className="text-gray-500 text-xs">
                    {v.student.school}{v.student.grade ? ` · Grade ${v.student.grade}` : ''}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-white font-bold text-sm">{v.verifiedHours}h verified</p>
                  <p className="text-gray-500 text-xs">{v.sessions?.length ?? 0} sessions</p>
                </div>
                {expanded === v.student.id
                  ? <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
                  : <ChevronRight className="w-4 h-4 text-gray-500 shrink-0" />}
              </button>

              {expanded === v.student.id && (
                <div className="border-t border-gray-800">
                  {/* Contact info */}
                  <div className="px-4 py-3 bg-gray-900/30 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
                    {v.student.email ? (
                      <a href={`mailto:${v.student.email}`} className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors">
                        <Mail className="w-3.5 h-3.5 text-gray-500" />
                        {v.student.email}
                      </a>
                    ) : (
                      <span className="flex items-center gap-1.5 text-gray-600"><Mail className="w-3.5 h-3.5" />No email</span>
                    )}
                    {v.student.phone ? (
                      <a href={`tel:${v.student.phone}`} className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors">
                        <Phone className="w-3.5 h-3.5 text-gray-500" />
                        {v.student.phone}
                      </a>
                    ) : (
                      <span className="flex items-center gap-1.5 text-gray-600"><Phone className="w-3.5 h-3.5" />No phone</span>
                    )}
                    {(v.student.school || v.student.grade) && (
                      <span className="flex items-center gap-1.5 text-gray-400">
                        <GraduationCap className="w-3.5 h-3.5 text-gray-500" />
                        {v.student.school}{v.student.grade ? ` · Grade ${v.student.grade}` : ''}
                      </span>
                    )}
                  </div>

                  {v.isInterested && (v.sessions ?? []).length === 0 ? (
                    <p className="px-4 py-3 text-xs text-gray-500 border-t border-gray-800/50">
                      Registered interest — no hours logged yet.
                    </p>
                  ) : (
                  <div className="divide-y divide-gray-800/50 border-t border-gray-800/50">
                  {(v.sessions ?? []).map((s: any) => (
                    <div key={s.id} className="flex items-center gap-3 px-4 py-3 bg-gray-900/50">
                      <span className="text-gray-600 text-xs w-24 shrink-0">{fmtDate(s.date)}</span>
                      <span className="flex-1 text-gray-300 text-xs truncate">{s.activity}</span>
                      <span className="text-white font-medium text-xs shrink-0">{s.hours}h</span>
                      {s.status === 'pending' ? (
                        <div className="flex gap-1.5 shrink-0">
                          <button
                            onClick={() => verifySession.mutate(s.id)}
                            className="text-xs px-2.5 py-1 rounded-lg bg-green-500/10 text-green-400 font-medium hover:bg-green-500/20 transition-colors"
                          >
                            Verify
                          </button>
                          <button
                            onClick={() => disputeSession.mutate(s.id)}
                            className="text-xs px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 font-medium hover:bg-red-500/20 transition-colors"
                          >
                            Dispute
                          </button>
                        </div>
                      ) : (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                          s.status === 'verified' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                          {s.status}
                        </span>
                      )}
                    </div>
                  ))}
                  </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
