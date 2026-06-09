'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, ExternalLink, Calendar, MapPin, RefreshCw,
  BookmarkCheck, Bookmark, CheckCircle2, GraduationCap, Star,
} from 'lucide-react';
import Link from 'next/link';
import { scholarshipsApi } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const CATEGORY_COLORS: Record<string, string> = {
  community:    'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300',
  environment:  'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-300',
  education:    'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300',
  health:       'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300',
  stem:         'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300',
  technology:   'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300',
  arts:         'bg-pink-50 text-pink-700 dark:bg-pink-500/10 dark:text-pink-300',
  leadership:   'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
  athletics:    'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300',
  volunteering: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
  indigenous:   'bg-yellow-50 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-300',
  'social-impact': 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300',
};

function fmtDeadline(deadline: string | null, isRolling: boolean): string {
  if (isRolling) return 'Rolling deadline';
  if (!deadline) return 'No deadline specified';
  try {
    const d = new Date(deadline);
    const daysLeft = Math.floor((d.getTime() - Date.now()) / 86400000);
    const formatted = d.toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' });
    if (daysLeft < 0)  return `${formatted} (closed)`;
    if (daysLeft === 0) return `${formatted} (today!)`;
    if (daysLeft <= 7)  return `${formatted} (${daysLeft} days left)`;
    return formatted;
  } catch { return deadline; }
}

function deadlineColor(deadline: string | null, isRolling: boolean): string {
  if (isRolling) return 'text-blue-600 dark:text-blue-400';
  if (!deadline) return 'text-muted-foreground';
  const daysLeft = Math.floor((new Date(deadline).getTime() - Date.now()) / 86400000);
  if (daysLeft < 0)   return 'text-muted-foreground';
  if (daysLeft <= 7)  return 'text-red-600 dark:text-red-400';
  if (daysLeft <= 30) return 'text-amber-600 dark:text-amber-400';
  return 'text-muted-foreground';
}

function BulletList({ text }: { text: string }) {
  const lines = text.split(/[•\n,;]+/).map((l) => l.trim()).filter(Boolean);
  if (lines.length <= 1) return <p className="text-[14px] text-muted-foreground leading-relaxed">{text}</p>;
  return (
    <ul className="space-y-2">
      {lines.map((line, i) => (
        <li key={i} className="flex items-start gap-2.5 text-[14px] text-muted-foreground">
          <CheckCircle2 className="w-4 h-4 text-merit-blue-500 shrink-0 mt-0.5" />
          {line}
        </li>
      ))}
    </ul>
  );
}

export default function ScholarshipDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();

  const { data: res, isLoading } = useQuery({
    queryKey: ['scholarship', id],
    queryFn: () => scholarshipsApi.get(id),
  });

  const scholarship = (res as any)?.data?.scholarship;
  const isSaved     = (res as any)?.data?.isSaved ?? false;
  const org         = scholarship?.organizations;

  const toggleSave = useMutation({
    mutationFn: () => scholarshipsApi.toggleSave(id),
    onSuccess: (data) => {
      const saved = (data as any)?.data?.saved;
      toast.success(saved ? 'Scholarship saved' : 'Removed from saved');
      qc.invalidateQueries({ queryKey: ['scholarship', id] });
      qc.invalidateQueries({ queryKey: ['scholarships-saved'] });
      qc.invalidateQueries({ queryKey: ['scholarships-list'] });
      qc.invalidateQueries({ queryKey: ['scholarships-for-me'] });
    },
  });

  if (isLoading) {
    return (
      <div className="px-4 py-6 md:px-8 max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-5 w-48" />
        <div className="flex gap-2"><Skeleton className="h-8 w-24 rounded-full" /><Skeleton className="h-8 w-24 rounded-full" /></div>
        <Skeleton className="h-12 w-44 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    );
  }

  if (!scholarship) {
    return (
      <div className="px-4 py-6 md:px-8 max-w-3xl mx-auto text-center py-20">
        <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-[15px] font-semibold text-foreground mb-2">Scholarship not found</p>
        <Link href="/scholarships" className="text-merit-blue-600 hover:underline text-sm">← Back to scholarships</Link>
      </div>
    );
  }

  const s = scholarship;

  return (
    <div className="px-4 py-4 md:px-8 md:py-6 max-w-3xl mx-auto">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to scholarships
      </button>

      {/* Provider header */}
      <div className="flex items-start gap-4 mb-5">
        <div className="w-14 h-14 rounded-2xl bg-merit-blue-50 dark:bg-merit-blue-500/10 flex items-center justify-center text-[16px] font-bold text-merit-blue-700 dark:text-merit-blue-300 shrink-0">
          {s.provider.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {s.featured && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-full">
                <Star className="w-3 h-3" /> Featured
              </span>
            )}
            {s.source === 'org' && (
              <span className="text-[10px] font-bold text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-500/10 px-2 py-0.5 rounded-full">
                Org posted
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-foreground leading-tight mb-1">{s.title}</h1>
          <p className="text-[14px] text-muted-foreground">{s.provider}</p>
        </div>
      </div>

      {/* Pill row */}
      <div className="flex flex-wrap gap-2 mb-6">
        {s.amount_label && (
          <span className="flex items-center gap-1.5 text-[13px] font-bold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-500/10 px-3 py-1.5 rounded-full">
            {s.amount_label}
          </span>
        )}
        <span className={cn('flex items-center gap-1.5 text-[13px] font-medium px-3 py-1.5 rounded-full bg-muted', deadlineColor(s.deadline, s.is_rolling))}>
          <Calendar className="w-3.5 h-3.5" />
          {fmtDeadline(s.deadline, s.is_rolling)}
        </span>
        <span className="flex items-center gap-1.5 text-[13px] text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
          <MapPin className="w-3.5 h-3.5" />
          {s.location}
        </span>
        {s.renewable && (
          <span className="flex items-center gap-1.5 text-[13px] text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 px-3 py-1.5 rounded-full">
            <RefreshCw className="w-3.5 h-3.5" />
            Renewable
          </span>
        )}
      </div>

      {/* CTA buttons */}
      <div className="flex items-center gap-3 mb-8 flex-wrap">
        <a
          href={s.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-merit-blue-600 hover:bg-merit-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-[14px]"
        >
          Apply now
          <ExternalLink className="w-4 h-4" />
        </a>
        <button
          onClick={() => toggleSave.mutate()}
          className={cn(
            'flex items-center gap-2 font-medium px-5 py-3 rounded-xl border text-[14px] transition-colors',
            isSaved
              ? 'border-merit-blue-300 text-merit-blue-600 bg-merit-blue-50 dark:border-merit-blue-700 dark:text-merit-blue-400 dark:bg-merit-blue-500/10'
              : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/30',
          )}
        >
          {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          {isSaved ? 'Saved' : 'Save'}
        </button>
      </div>

      {/* Detail sections */}
      <div className="space-y-6">
        {s.description && (
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-[13px] font-bold text-foreground uppercase tracking-wide mb-3">About this scholarship</h2>
            <p className="text-[14px] text-muted-foreground leading-relaxed">{s.description}</p>
          </div>
        )}

        {s.requirements && (
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-[13px] font-bold text-foreground uppercase tracking-wide mb-3">Requirements</h2>
            <BulletList text={s.requirements} />
          </div>
        )}

        {s.eligibility && (
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-[13px] font-bold text-foreground uppercase tracking-wide mb-3">Who can apply</h2>
            <p className="text-[14px] text-muted-foreground leading-relaxed">{s.eligibility}</p>
          </div>
        )}

        {/* Categories */}
        {s.categories?.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-[13px] font-bold text-foreground uppercase tracking-wide mb-3">Categories</h2>
            <div className="flex flex-wrap gap-2">
              {s.categories.map((cat: string) => (
                <span key={cat} className={cn('text-[12px] font-medium px-3 py-1 rounded-full capitalize', CATEGORY_COLORS[cat] ?? 'bg-muted text-muted-foreground')}>
                  {cat.replace('-', ' ')}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Org posted by */}
        {org && (
          <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-sm font-bold text-foreground shrink-0">
              {org.name?.slice(0, 2).toUpperCase() ?? 'OR'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-semibold mb-0.5">Posted by</p>
              <p className="text-[14px] font-semibold text-foreground truncate">{org.name}</p>
            </div>
            {org.slug && (
              <Link
                href={`/organizations/${org.slug}`}
                className="text-[13px] text-merit-blue-600 hover:text-merit-blue-700 font-medium shrink-0"
              >
                View org →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
