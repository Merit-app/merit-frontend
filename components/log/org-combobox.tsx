'use client';

import { useState, useRef, useEffect } from 'react';
import { Check, ChevronsUpDown, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMeritStore } from '@/lib/store';
import type { Organization } from '@/lib/types';
import { slugify } from '@/lib/utils';

interface Props {
  value: Organization | null;
  onChange: (org: Organization | null) => void;
}

const CATEGORY_OPTIONS = [
  'Community', 'Education', 'Health', 'Animal welfare',
  'Environment', 'Social services', 'Other',
] as const;

export function OrgCombobox({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [creatingNew, setCreatingNew] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgCategory, setNewOrgCategory] = useState<string>('Community');
  const [justVerified, setJustVerified] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const organizations = useMeritStore((s) => s.organizations);
  const addOrganization = useMeritStore((s) => s.addOrganization);

  const filtered = organizations.filter((o) =>
    o.name.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setCreatingNew(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  function selectOrg(org: Organization) {
    onChange(org);
    setOpen(false);
    setQuery('');
    // Flash verified check if registered/institutional
    if (org.registrationStatus !== 'unregistered') {
      setJustVerified(true);
      setTimeout(() => setJustVerified(false), 1500);
    }
  }

  function createOrg() {
    if (!newOrgName.trim()) return;
    const org: Organization = {
      id: `org-${Date.now()}`,
      slug: slugify(newOrgName),
      name: newOrgName.trim(),
      category: newOrgCategory as Organization['category'],
      registrationStatus: 'unregistered',
    };
    addOrganization(org);
    selectOrg(org);
    setCreatingNew(false);
    setNewOrgName('');
  }

  if (value) {
    return (
      <div className="flex items-center gap-2 h-10 px-3 rounded-lg border border-ink-200 bg-white">
        <span className="flex-1 text-[14px] text-ink-900 truncate">{value.name}</span>
        {justVerified && (
          <Check size={14} className="text-success shrink-0 animate-in fade-in duration-150" />
        )}
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-ink-400 hover:text-ink-700 transition-colors"
          aria-label="Clear organization"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'flex w-full items-center justify-between h-10 px-3 rounded-lg border bg-white text-left text-[14px] transition-colors',
          open ? 'border-merit-blue-600' : 'border-ink-200 hover:border-ink-300',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-merit-blue-600'
        )}
      >
        <span className="text-ink-400">Search organizations...</span>
        <ChevronsUpDown size={14} className="text-ink-400 shrink-0" />
      </button>

      {open && (
        <div
          className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-ink-200 rounded-xl overflow-hidden"
          style={{ boxShadow: '0 4px 12px -2px rgb(0 0 0 / 0.08)' }}
        >
          {!creatingNew ? (
            <>
              <div className="px-3 pt-3 pb-2">
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type to search..."
                  className="w-full text-[13px] text-ink-900 placeholder:text-ink-400 outline-none"
                />
              </div>
              <div className="border-t border-ink-100" />
              <div className="max-h-52 overflow-y-auto py-1">
                {filtered.length === 0 && (
                  <p className="px-3 py-2 text-[13px] text-ink-500">No results for "{query}"</p>
                )}
                {filtered.map((org) => (
                  <button
                    key={org.id}
                    type="button"
                    onClick={() => selectOrg(org)}
                    className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-ink-50 transition-colors"
                  >
                    <span className="text-[13px] text-ink-900">{org.name}</span>
                    {org.registrationStatus !== 'unregistered' && (
                      <span className="text-[11px] font-medium text-merit-blue-600 bg-merit-blue-50 px-2 py-0.5 rounded-full shrink-0 ml-2">
                        {org.registrationStatus === 'institutional' ? 'Partner' : 'Registered'}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <div className="border-t border-ink-100">
                <button
                  type="button"
                  onClick={() => { setCreatingNew(true); setNewOrgName(query); }}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-[13px] font-medium text-merit-blue-600 hover:bg-merit-blue-50 transition-colors"
                >
                  <Plus size={14} />
                  Create new organization
                </button>
              </div>
            </>
          ) : (
            <div className="p-4 space-y-3">
              <p className="text-[13px] font-medium text-ink-900">New organization</p>
              <input
                autoFocus
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                placeholder="Organization name"
                className="w-full h-9 px-3 rounded-lg border border-ink-200 text-[13px] text-ink-900 placeholder:text-ink-400 focus:border-merit-blue-600 focus:outline-none"
              />
              <select
                value={newOrgCategory}
                onChange={(e) => setNewOrgCategory(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-ink-200 text-[13px] text-ink-900 focus:border-merit-blue-600 focus:outline-none bg-white"
              >
                {CATEGORY_OPTIONS.map((c) => <option key={c}>{c}</option>)}
              </select>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={createOrg}
                  disabled={!newOrgName.trim()}
                  className="flex-1 h-9 bg-merit-blue-600 hover:bg-merit-blue-700 disabled:opacity-50 text-white text-[13px] font-medium rounded-lg transition-colors"
                >
                  Add organization
                </button>
                <button
                  type="button"
                  onClick={() => setCreatingNew(false)}
                  className="h-9 px-3 border border-ink-200 text-[13px] text-ink-700 rounded-lg hover:bg-ink-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
