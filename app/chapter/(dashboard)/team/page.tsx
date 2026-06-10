'use client';

import { useCallback, useEffect, useState } from 'react';
import { chapterApi, ApiError } from '@/lib/api';
import { UserPlus, Shield, Trash2, Plus, X, Crown, Check } from 'lucide-react';

interface Member { userId: string; name: string; email: string; roleName: string; roleId: string | null; isOwner: boolean }
interface Role { id: string; name: string; permissions: string[]; is_default: boolean }

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [catalogue, setCatalogue] = useState<{ key: string; label: string }[]>([]);
  const [canManage, setCanManage] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [team, rolesRes, perms] = await Promise.all([
        chapterApi.getTeam(), chapterApi.getRoles(), chapterApi.myPermissions(),
      ]);
      setMembers(team.data.members);
      setRoles(rolesRes.data);
      setCatalogue(perms.data.catalogue);
      setCanManage(perms.data.isOwner || perms.data.permissions.includes('manage_team'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  if (loading) return <div className="text-muted-foreground">Loading team…</div>;

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Team & roles</h1>
        <p className="text-sm text-muted-foreground">Add coordinators and control what each can do.</p>
      </div>

      {!canManage && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-700/50 dark:bg-amber-900/20 dark:text-amber-200">
          You can view the team but don’t have permission to manage it.
        </div>
      )}

      <Members members={members} roles={roles} canManage={canManage} onChange={load} />
      <Roles roles={roles} catalogue={catalogue} canManage={canManage} onChange={load} />
    </div>
  );
}

// ── Members ──
function Members({ members, roles, canManage, onChange }: { members: Member[]; roles: Role[]; canManage: boolean; onChange: () => void }) {
  const [email, setEmail] = useState('');
  const [roleId, setRoleId] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function add() {
    if (!email.trim()) return;
    setBusy(true); setError(null);
    try {
      await chapterApi.addCoordinator(email.trim(), roleId || null);
      setEmail(''); setRoleId('');
      onChange();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to add.');
    } finally { setBusy(false); }
  }

  async function changeRole(userId: string, newRoleId: string) {
    await chapterApi.setCoordinatorRole(userId, newRoleId || null).catch(() => {});
    onChange();
  }
  async function remove(userId: string) {
    await chapterApi.removeCoordinator(userId).catch(() => {});
    onChange();
  }

  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <h2 className="mb-4 font-medium text-foreground">Coordinators</h2>
      <div className="space-y-2">
        {members.map((m) => (
          <div key={m.userId} className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-merit-blue-50 text-sm font-bold text-merit-blue-600">
              {m.name?.[0] ?? '?'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                {m.name}{m.isOwner && <Crown className="h-3.5 w-3.5 text-amber-500" />}
              </p>
              <p className="truncate text-xs text-muted-foreground">{m.email}</p>
            </div>
            {m.isOwner ? (
              <span className="text-xs font-medium text-muted-foreground">Owner</span>
            ) : canManage ? (
              <>
                <select
                  value={m.roleId ?? ''}
                  onChange={(e) => changeRole(m.userId, e.target.value)}
                  className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm"
                >
                  <option value="">Full access</option>
                  {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
                <button onClick={() => remove(m.userId)} className="text-muted-foreground hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
              </>
            ) : (
              <span className="text-xs text-muted-foreground">{m.roleName}</span>
            )}
          </div>
        ))}
      </div>

      {canManage && (
        <div className="mt-4 border-t border-border pt-4">
          <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-foreground"><UserPlus className="h-4 w-4" /> Add a coordinator</p>
          <div className="flex flex-wrap gap-2">
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="their@email.com"
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm" />
            <select value={roleId} onChange={(e) => setRoleId(e.target.value)} className="rounded-lg border border-border bg-background px-2 py-2 text-sm">
              <option value="">Full access</option>
              {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
            <button onClick={add} disabled={busy} className="rounded-lg bg-merit-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-merit-blue-700 disabled:opacity-60">
              {busy ? 'Adding…' : 'Add'}
            </button>
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">They must already have a Merit account.</p>
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
      )}
    </section>
  );
}

// ── Roles ──
function Roles({ roles, catalogue, canManage, onChange }: { roles: Role[]; catalogue: { key: string; label: string }[]; canManage: boolean; onChange: () => void }) {
  const [editing, setEditing] = useState<Role | 'new' | null>(null);

  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 font-medium text-foreground"><Shield className="h-4 w-4" /> Roles</h2>
        {canManage && (
          <button onClick={() => setEditing('new')} className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-1.5 text-sm font-medium text-background">
            <Plus className="h-4 w-4" /> New role
          </button>
        )}
      </div>

      <div className="space-y-2">
        {roles.map((r) => (
          <div key={r.id} className="rounded-lg border border-border px-3 py-2.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{r.name}{r.is_default && <span className="ml-2 text-xs text-muted-foreground">default</span>}</p>
                <p className="text-xs text-muted-foreground">{r.permissions.length} permission{r.permissions.length === 1 ? '' : 's'}</p>
              </div>
              {canManage && (
                <div className="flex items-center gap-2">
                  <button onClick={() => setEditing(r)} className="text-sm text-merit-blue-600 hover:underline">Edit</button>
                  {!r.is_default && (
                    <button onClick={async () => { await chapterApi.deleteRole(r.id).catch(() => {}); onChange(); }} className="text-muted-foreground hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <RoleEditor role={editing === 'new' ? null : editing} catalogue={catalogue} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); onChange(); }} />
      )}
    </section>
  );
}

function RoleEditor({ role, catalogue, onClose, onSaved }: { role: Role | null; catalogue: { key: string; label: string }[]; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(role?.name ?? '');
  const [perms, setPerms] = useState<Set<string>>(new Set(role?.permissions ?? []));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(k: string) {
    setPerms((prev) => { const n = new Set(prev); n.has(k) ? n.delete(k) : n.add(k); return n; });
  }

  async function save() {
    if (!name.trim()) { setError('Name is required'); return; }
    setBusy(true); setError(null);
    try {
      if (role) await chapterApi.updateRole(role.id, { name: name.trim(), permissions: Array.from(perms) });
      else await chapterApi.createRole(name.trim(), Array.from(perms));
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save.');
    } finally { setBusy(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">{role ? 'Edit role' : 'New role'}</h3>
          <button onClick={onClose}><X className="h-5 w-5 text-muted-foreground" /></button>
        </div>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Role name (e.g. Assistant)"
          disabled={role?.is_default}
          className="mb-4 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm disabled:opacity-60" />
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Permissions</p>
        <div className="space-y-1.5">
          {catalogue.map((p) => (
            <button key={p.key} onClick={() => toggle(p.key)} className="flex w-full items-center justify-between rounded-lg border border-border px-3 py-2 text-left text-sm hover:bg-muted/40">
              <span className="text-foreground">{p.label}</span>
              <span className={`flex h-5 w-5 items-center justify-center rounded ${perms.has(p.key) ? 'bg-merit-blue-600 text-white' : 'border border-border'}`}>
                {perms.has(p.key) && <Check className="h-3.5 w-3.5" />}
              </span>
            </button>
          ))}
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <button onClick={save} disabled={busy} className="mt-4 w-full rounded-lg bg-merit-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-merit-blue-700 disabled:opacity-60">
          {busy ? 'Saving…' : 'Save role'}
        </button>
      </div>
    </div>
  );
}
