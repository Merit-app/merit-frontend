'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  GraduationCap, Plus, Trash2, ExternalLink, Loader2, X, Calendar, DollarSign,
} from 'lucide-react';
import { scholarshipsApi } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const CATEGORY_OPTIONS = [
  { value: 'community',    label: 'Community' },
  { value: 'education',    label: 'Education' },
  { value: 'environment',  label: 'Environment' },
  { value: 'health',       label: 'Health' },
  { value: 'stem',         label: 'STEM' },
  { value: 'leadership',   label: 'Leadership' },
  { value: 'athletics',    label: 'Athletics' },
  { value: 'arts',         label: 'Arts' },
  { value: 'volunteering', label: 'Volunteering' },
  { value: 'indigenous',   label: 'Indigenous' },
  { value: 'social-impact',label: 'Social Impact' },
];

const INPUT = 'w-full bg-muted border border-border text-foreground rounded-xl px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-ring transition-colors';
const LABEL = 'block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5';

interface FormState {
  title: string; amount_label: string; deadline: string; is_rolling: boolean;
  url: string; description: string; requirements: string; eligibility: string;
  categories: string[]; renewable: boolean;
}

const EMPTY: FormState = {
  title: '', amount_label: '', deadline: '', is_rolling: false,
  url: '', description: '', requirements: '', eligibility: '',
  categories: [], renewable: false,
};

function fmtDate(d: string | null) {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' }); }
  catch { return d; }
}

export default function OrgScholarshipsPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [deleting, setDeleting] = useState<string | null>(null);

  const { data: res, isLoading } = useQuery({
    queryKey: ['org-scholarships', orgId],
    queryFn: () => scholarshipsApi.listOrgScholarships(orgId),
  });
  const scholarships: any[] = (res as any)?.data ?? [];

  const create = useMutation({
    mutationFn: () => scholarshipsApi.createOrgScholarship(orgId, {
      ...form,
      amount_label: form.amount_label || undefined,
      deadline: form.deadline || undefined,
      description: form.description || undefined,
      requirements: form.requirements || undefined,
      eligibility: form.eligibility || undefined,
    }),
    onSuccess: () => {
      toast.success('Scholarship posted — it will appear in student discovery.');
      setForm(EMPTY);
      setShowForm(false);
      qc.invalidateQueries({ queryKey: ['org-scholarships', orgId] });
    },
    onError: (err: any) => toast.error(err?.message ?? 'Failed to post scholarship'),
  });

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await scholarshipsApi.deleteOrgScholarship(orgId, id);
      toast.success('Scholarship removed');
      qc.invalidateQueries({ queryKey: ['org-scholarships', orgId] });
    } catch {
      toast.error('Failed to remove scholarship');
    } finally {
      setDeleting(null);
    }
  };

  const toggleCat = (cat: string) => {
    setForm((f) => ({
      ...f,
      categories: f.categories.includes(cat)
        ? f.categories.filter((c) => c !== cat)
        : [...f.categories, cat],
    }));
  };

  const canSubmit = form.title.trim() && form.url.trim() && form.categories.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Scholarships</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Post scholarships that appear in the student scholarship discovery feed.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-foreground text-background text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Post scholarship
        </button>
      </div>

      {/* Posted list */}
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
        </div>
      ) : scholarships.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-14 text-center">
          <GraduationCap className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-[14px] font-semibold text-foreground mb-1">No scholarships posted yet</p>
          <p className="text-muted-foreground text-sm mb-5">
            Scholarships you post appear in Merit's student scholarship discovery page.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-foreground text-background text-sm font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Post your first scholarship
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {scholarships.map((s: any) => (
            <div key={s.id} className="bg-card border border-border rounded-2xl p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-merit-blue-50 dark:bg-merit-blue-500/10 flex items-center justify-center text-sm font-bold text-merit-blue-700 dark:text-merit-blue-300 shrink-0">
                {s.title.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-[14px] truncate">{s.title}</p>
                <div className="flex items-center gap-3 mt-1 flex-wrap text-[12px] text-muted-foreground">
                  {s.amount_label && (
                    <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                      <DollarSign className="w-3 h-3" />{s.amount_label}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {s.is_rolling ? 'Rolling' : fmtDate(s.deadline)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {(s.categories ?? []).map((c: string) => (
                    <span key={c} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">
                      {c.replace('-', ' ')}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a href={s.url} target="_blank" rel="noopener noreferrer"
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={() => handleDelete(s.id)}
                  disabled={deleting === s.id}
                  className="p-2 rounded-lg text-muted-foreground hover:text-danger hover:bg-danger/5 transition-colors disabled:opacity-50"
                >
                  {deleting === s.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post scholarship modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-2xl bg-card border border-border rounded-2xl p-6 max-h-[90vh] overflow-y-auto space-y-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Post a scholarship</h2>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Fields */}
            <div>
              <label className={LABEL}>Scholarship title *</label>
              <input className={INPUT} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Environmental Youth Scholarship" />
            </div>
            <div>
              <label className={LABEL}>Apply URL *</label>
              <input className={INPUT} type="url" value={form.url} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))} placeholder="https://..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL}>Amount (optional)</label>
                <input className={INPUT} value={form.amount_label} onChange={(e) => setForm((f) => ({ ...f, amount_label: e.target.value }))} placeholder="e.g. $2,500" />
              </div>
              <div>
                <label className={LABEL}>Deadline (optional)</label>
                <input className={INPUT} type="date" disabled={form.is_rolling} value={form.deadline} onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))} />
              </div>
            </div>

            {/* Rolling + Renewable */}
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_rolling} onChange={(e) => setForm((f) => ({ ...f, is_rolling: e.target.checked, deadline: e.target.checked ? '' : f.deadline }))} className="rounded border-border accent-merit-blue-600 h-4 w-4" />
                <span className="text-[13px] text-foreground">Rolling deadline</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.renewable} onChange={(e) => setForm((f) => ({ ...f, renewable: e.target.checked }))} className="rounded border-border accent-merit-blue-600 h-4 w-4" />
                <span className="text-[13px] text-foreground">Renewable</span>
              </label>
            </div>

            <div>
              <label className={LABEL}>Description (optional)</label>
              <textarea className={cn(INPUT, 'resize-none h-20')} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="What is this scholarship for?" />
            </div>
            <div>
              <label className={LABEL}>Requirements (optional)</label>
              <textarea className={cn(INPUT, 'resize-none h-20')} value={form.requirements} onChange={(e) => setForm((f) => ({ ...f, requirements: e.target.value }))} placeholder="e.g. Volunteer experience, academic standing..." />
            </div>
            <div>
              <label className={LABEL}>Who can apply (optional)</label>
              <input className={INPUT} value={form.eligibility} onChange={(e) => setForm((f) => ({ ...f, eligibility: e.target.value }))} placeholder="e.g. BC residents aged 15–25" />
            </div>

            {/* Categories */}
            <div>
              <label className={LABEL}>Categories * (select at least one)</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_OPTIONS.map(({ value, label }) => (
                  <button key={value} type="button" onClick={() => toggleCat(value)}
                    className={cn('px-3 py-1.5 rounded-full text-[12px] font-medium border transition-colors', form.categories.includes(value) ? 'bg-merit-blue-600 text-white border-merit-blue-600' : 'bg-muted text-muted-foreground border-border hover:border-foreground/30')}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2 border-t border-border">
              <button onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground border border-border transition-colors">Cancel</button>
              <button
                onClick={() => create.mutate()}
                disabled={!canSubmit || create.isPending}
                className="flex-1 px-5 py-2.5 rounded-xl text-sm font-semibold bg-foreground text-background hover:opacity-90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {create.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {create.isPending ? 'Posting...' : 'Post scholarship'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
