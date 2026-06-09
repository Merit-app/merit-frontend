'use client';

import Link from 'next/link';
import { Bookmark, BookmarkCheck, ExternalLink, RefreshCw, Calendar, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { scholarshipsApi } from '@/lib/api';
import { toast } from 'sonner';

export interface ScholarshipData {
  id: string;
  title: string;
  provider: string;
  amount_label: string | null;
  deadline: string | null;
  is_rolling: boolean;
  categories: string[];
  location: string;
  renewable: boolean;
  featured: boolean;
  description: string | null;
  source: string;
  org_id: string | null;
}

const CATEGORY_COLORS: Record<string, string> = {
  community:    'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300',
  environment:  'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-300',
  nature:       'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-300',
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
  innovation:   'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300',
};

function deadlineBadgeClass(deadline: string | null, isRolling: boolean): string {
  if (isRolling) return 'text-blue-600 bg-blue-50 dark:text-blue-300 dark:bg-blue-500/10';
  if (!deadline) return 'text-muted-foreground bg-muted';
  const daysLeft = Math.floor((new Date(deadline).getTime() - Date.now()) / 86400000);
  if (daysLeft < 0)  return 'text-muted-foreground bg-muted line-through';
  if (daysLeft <= 7) return 'text-red-600 bg-red-50 dark:text-red-300 dark:bg-red-500/10';
  if (daysLeft <= 30) return 'text-amber-600 bg-amber-50 dark:text-amber-300 dark:bg-amber-500/10';
  return 'text-muted-foreground bg-muted';
}

function fmtDeadline(deadline: string | null, isRolling: boolean): string {
  if (isRolling) return 'Rolling';
  if (!deadline) return 'No deadline';
  try {
    return 'Due ' + new Date(deadline).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' });
  } catch { return deadline; }
}

interface Props {
  scholarship: ScholarshipData;
  isSaved?: boolean;
  invalidateKey?: readonly unknown[];
}

export function ScholarshipCard({ scholarship: s, isSaved = false, invalidateKey }: Props) {
  const qc = useQueryClient();

  const toggleSave = useMutation({
    mutationFn: () => scholarshipsApi.toggleSave(s.id),
    onSuccess: (res) => {
      const saved = (res as any)?.data?.saved;
      toast.success(saved ? 'Scholarship saved' : 'Removed from saved');
      if (invalidateKey) qc.invalidateQueries({ queryKey: invalidateKey as any });
      qc.invalidateQueries({ queryKey: ['scholarships-saved'] });
      qc.invalidateQueries({ queryKey: ['scholarships-list'] });
      qc.invalidateQueries({ queryKey: ['scholarships-for-me'] });
    },
    onError: () => toast.error('Could not save scholarship'),
  });

  const visibleCategories = s.categories.slice(0, 3);

  return (
    <div className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:shadow-md hover:border-merit-blue-200 dark:hover:border-merit-blue-800 transition-all duration-150 flex flex-col">
      {/* Featured indicator */}
      {s.featured && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-merit-blue-500 to-violet-500" />
      )}

      <Link href={`/scholarships/${s.id}`} className="flex flex-col flex-1 p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          {/* Provider avatar */}
          <div className="w-10 h-10 rounded-xl bg-merit-blue-50 dark:bg-merit-blue-500/10 flex items-center justify-center text-[13px] font-bold text-merit-blue-700 dark:text-merit-blue-300 shrink-0">
            {s.provider.slice(0, 2).toUpperCase()}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {s.source === 'org' && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">
                Org posted
              </span>
            )}
            {s.renewable && (
              <span title="Renewable" className="text-green-600 dark:text-green-400">
                <RefreshCw className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
        </div>

        {/* Title + provider */}
        <h3 className="text-[14px] font-bold text-foreground leading-snug mb-1 line-clamp-2 group-hover:text-merit-blue-600 transition-colors">
          {s.title}
        </h3>
        <p className="text-[12px] text-muted-foreground mb-3 truncate">{s.provider}</p>

        {/* Amount */}
        {s.amount_label && (
          <span className="self-start text-[12px] font-bold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-500/10 px-2.5 py-1 rounded-full mb-3">
            {s.amount_label}
          </span>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Footer row */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span className={cn('flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full', deadlineBadgeClass(s.deadline, s.is_rolling))}>
            <Calendar className="w-3 h-3" />
            {fmtDeadline(s.deadline, s.is_rolling)}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            <MapPin className="w-3 h-3" />
            {s.location}
          </span>
          {visibleCategories.map((cat) => (
            <span key={cat} className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full capitalize', CATEGORY_COLORS[cat] ?? 'bg-muted text-muted-foreground')}>
              {cat.replace('-', ' ')}
            </span>
          ))}
        </div>
      </Link>

      {/* Save button */}
      <button
        onClick={(e) => { e.preventDefault(); toggleSave.mutate(); }}
        className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center bg-card border border-border hover:border-merit-blue-300 transition-colors shadow-sm"
        aria-label={isSaved ? 'Remove bookmark' : 'Save scholarship'}
      >
        {isSaved
          ? <BookmarkCheck className="w-4 h-4 text-merit-blue-600" />
          : <Bookmark className="w-4 h-4 text-muted-foreground group-hover:text-merit-blue-600 transition-colors" />
        }
      </button>
    </div>
  );
}
