/**
 * lib/api.ts — Typed API client for the Merit backend.
 */

import type { User, Session, Organization } from './types';

// .trim() guards against a stray trailing newline/space in the env var, which
// would otherwise produce an invalid fetch URL ("could not reach server").
const BASE = (process.env.NEXT_PUBLIC_API_URL ?? '').trim().replace(/\/+$/, '');

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string | undefined,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function getStore() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { useMeritStore } = require('./store');
  return useMeritStore;
}
function getAccessToken(): string | null { return getStore().getState().accessToken ?? null; }
function getRefreshToken(): string | null { return getStore().getState().refreshToken ?? null; }

// ── Unified session ───────────────────────────────────────────────────────────
// Org and student now share ONE Merit account/session. These aliases keep the
// org API definitions unchanged while routing them through the single store.
function getOrgAccessToken(): string | null { return getAccessToken(); }

/** Org-admin API calls — now use the same unified Merit session as request(). */
async function orgRequest<T>(method: string, path: string, body?: unknown, isPublic = false): Promise<T> {
  return request<T>(method, path, body, isPublic);
}

async function makeRequest(method: string, path: string, body?: unknown, token?: string | null): Promise<Response> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return fetch(`${BASE}${path}`, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined });
}

async function request<T>(method: string, path: string, body?: unknown, isPublic = false): Promise<T> {
  const token = isPublic ? null : getAccessToken();
  let res = await makeRequest(method, path, body, token);

  if (res.status === 401 && !isPublic) {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        const refreshRes = await makeRequest('POST', '/auth/refresh', { refreshToken }, null);
        if (refreshRes.ok) {
          const d = await refreshRes.json();
          const s = d?.data;
          if (s?.accessToken) {
            getStore().getState().setTokens(s.accessToken, s.refreshToken, s.expiresAt);
            res = await makeRequest(method, path, body, s.accessToken);
          }
        } else {
          getStore().getState().logout();
          throw new ApiError(401, 'session_expired', 'Your session has expired. Please sign in again.');
        }
      } catch (e) {
        if (e instanceof ApiError) throw e;
        getStore().getState().logout();
        throw new ApiError(401, 'session_expired', 'Session error. Please sign in again.');
      }
    }
  }

  if (!res.ok) {
    let payload: any = {};
    try { payload = await res.json(); } catch { /* ignore */ }
    throw new ApiError(res.status, payload?.code, payload?.message ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

// ─── Shape mappers ────────────────────────────────────────────────────────────

export function mapUser(raw: any): User {
  const parts = String(raw?.name ?? '').trim().split(' ');
  return {
    id: raw.id ?? '',
    firstName: parts[0] ?? '',
    lastName: parts.slice(1).join(' ') || '',
    email: raw.email ?? '',
    school: raw.school ?? '',
    grade: raw.grade ?? 11,
    graduationYear: raw.graduation_year ?? new Date().getFullYear() + 1,
    phone: raw.phone ?? undefined,
    phoneVerified: raw.phone_verified ?? false,
    plan: raw.plan ?? 'free',
    goalProgram: raw.goal_program ?? undefined,
    nhsGoalHours: raw.goal_hours ?? 0,
    nhsGoalStartDate: raw.created_at ? raw.created_at.split('T')[0] : '',
    nhsGoalDeadline: '',
    isMinor: raw.is_minor ?? false,
    consentAccepted: raw.parental_consent_received ?? true,
    onboardingCompleted: raw.onboarding_completed ?? false,
    username: raw.username ?? undefined,
    avatarUrl: raw.avatar_url ?? undefined,
    profilePublic: raw.profile_public ?? true,
    bio: raw.bio ?? undefined,
    city: raw.city ?? undefined,
  };
}

export function mapSession(raw: any): Session {
  const tier = raw.verification_tier;
  return {
    id: raw.id ?? '',
    org: raw.org?.name ?? raw.org_name ?? '',
    orgSlug: raw.org?.id ?? raw.org_id ?? '',
    date: raw.date ?? '',
    hours: Number(raw.hours ?? 0),
    activity: raw.activity ?? '',
    supervisor: raw.supervisor_name ?? '',
    supervisorPhone: raw.supervisor_phone ?? '',
    supervisorEmail: raw.supervisor_email ?? undefined,
    status: (['verified', 'pending', 'disputed'].includes(raw.status) ? raw.status : 'pending') as Session['status'],
    tier: tier === 'verified_institutional' ? 'institution' : tier === 'verified_basic' ? 'supervisor' : null,
    verifiedAt: raw.verified_at ?? undefined,
    notes: raw.notes ?? undefined,
    selfReported: raw.self_reported ?? false,
  };
}

export function mapOrg(raw: any): Organization {
  const city = raw.city ?? '';
  const state = raw.state ?? '';
  const address = [city, state].filter(Boolean).join(', ') || undefined;
  return {
    id: raw.id ?? '',
    slug: raw.id ?? '',
    name: raw.name ?? '',
    category: (raw.category as Organization['category']) ?? 'Other',
    address,
    website: raw.website ?? undefined,
    ein: raw.ein ?? undefined,
    registrationStatus: raw.is_institutional_partner
      ? 'institutional'
      : (raw.is_registered_nonprofit || raw.isRegisteredNonprofit) ? 'registered'
      : 'unregistered',
    description: raw.description ?? undefined,
  };
}

// ─── Auth API ─────────────────────────────────────────────────────────────────

export const authApi = {
  signup: (body: {
    email: string; password: string; name: string; dateOfBirth: string;
    school?: string; grade?: number; goalProgram?: string; goalHours?: number;
  }) => request<{ data: { user: any; requiresEmailConfirmation: boolean; requiresOnboardingConsent: boolean } }>('POST', '/auth/signup', body, true),
  login: (email: string, password: string) =>
    request<{ data: { user: any; session: { accessToken: string; refreshToken: string; expiresAt: number } } }>('POST', '/auth/login', { email, password }, true),
  logout: () => request<{ data: { loggedOut: boolean } }>('POST', '/auth/logout'),
  me: () => request<{ data: { user: any } }>('GET', '/auth/me'),
  requestPasswordReset: (email: string) =>
    request<{ data: { message: string } }>('POST', '/auth/request-password-reset', { email }, true),
  resetPassword: (token: string, newPassword: string) =>
    request<{ data: { message: string } }>('POST', '/auth/reset-password', { token, newPassword }, true),
  changePassword: (currentPassword: string, newPassword: string) =>
    request<{ data: { message: string } }>('POST', '/auth/change-password', { currentPassword, newPassword }),
  acceptConsent: () => request<{ data: { user: any } }>('PATCH', '/auth/accept-consent', {}),
};

// ─── Sessions API ─────────────────────────────────────────────────────────────

export const sessionsApi = {
  list: (params?: Record<string, string | number>) => {
    const qs = params
      ? '?' + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString()
      : '';
    return request<{ data: any[]; meta: any }>('GET', `/sessions${qs}`);
  },
  create: (body: {
    orgId?: string;
    newOrg?: { name: string; city?: string; state?: string; website?: string };
    date: string; hours: number; activity: string;
    supervisorName?: string; supervisorPhone?: string; supervisorEmail?: string;
    selfReported?: boolean; trackerNote?: string;
  }) => request<{ data: { session: any } }>('POST', '/sessions', body),
  update: (id: string, body: { activity?: string; supervisorName?: string; supervisorPhone?: string; supervisorEmail?: string }) =>
    request<{ data: any }>('PATCH', `/sessions/${id}`, body),
  delete: (id: string) => request<{ data: any }>('DELETE', `/sessions/${id}`),
  resend: (id: string) => request<{ data: any }>('POST', `/sessions/${id}/resend-verification`),
};

// ─── Organizations API ────────────────────────────────────────────────────────

export const orgsApi = {
  search: (q: string, limit = 12) =>
    request<{ data: any[] }>('GET', `/organizations/search?q=${encodeURIComponent(q)}&limit=${limit}`),
  me: () => request<{ data: any[] }>('GET', '/organizations/me'),
  get: (id: string) => request<{ data: { org: any } }>('GET', `/organizations/${id}`),

  discover: (params?: { category?: string; q?: string; limit?: number; offset?: number }) => {
    const qs = new URLSearchParams();
    if (params?.category) qs.set('category', params.category);
    if (params?.q) qs.set('q', params.q);
    if (params?.limit != null) qs.set('limit', String(params.limit));
    if (params?.offset != null) qs.set('offset', String(params.offset));
    const suffix = qs.toString() ? `?${qs}` : '';
    return request<{ data: any[] }>('GET', `/organizations/discover${suffix}`);
  },

  following: () => request<{ data: any[] }>('GET', '/organizations/following'),

  follow: (orgId: string) =>
    request<{ data: { following: boolean } }>('POST', `/organizations/${orgId}/follow`, {}),

  stats: (orgId: string) =>
    request<{ data: any }>('GET', `/organizations/${orgId}/stats`, undefined, true),

  similar: (orgId: string) =>
    request<{ data: any[] }>('GET', `/organizations/${orgId}/similar`, undefined, true),

  getPublic: (slug: string) =>
    request<{ data: { org: any } }>('GET', `/orgs/${encodeURIComponent(slug)}`, undefined, true),

  createOrg: (body: {
    name: string; category: string; city: string; province?: string;
    country?: string; websiteUrl?: string; description?: string;
    contactEmail?: string; contactPhone?: string; isRecruiting?: boolean;
  }) => request<{ data: { org: any } }>('POST', '/organizations', body),

  adminMine: () => request<{ data: any[] }>('GET', '/organizations/admin/mine'),

  // Org-admin-only endpoints — use orgRequest so they work with the persisted org token
  dashboard: (orgId: string) => orgRequest<{ data: any }>('GET', `/organizations/${orgId}/dashboard`),

  updateOrg: (orgId: string, body: {
    description?: string; websiteUrl?: string;
    contactEmail?: string; contactPhone?: string; isRecruiting?: boolean;
  }) => orgRequest<{ data: { updated: boolean } }>('PATCH', `/organizations/${orgId}`, body),

  volunteers: (orgId: string) => orgRequest<{ data: { volunteers: any[] } }>('GET', `/organizations/${orgId}/volunteers`),

  verifySession: (orgId: string, sessionId: string) =>
    orgRequest<{ data: { verified: boolean } }>('POST', `/organizations/${orgId}/sessions/${sessionId}/verify`, {}),

  disputeSession: (orgId: string, sessionId: string) =>
    orgRequest<{ data: { disputed: boolean } }>('POST', `/organizations/${orgId}/sessions/${sessionId}/dispute`, {}),

  inviteTeamMember: (orgId: string, email: string, role: 'coordinator' | 'admin') =>
    orgRequest<{ data: { added: boolean; name: string; role: string } }>('POST', `/organizations/${orgId}/team/invite`, { email, role }),

  removeTeamMember: (orgId: string, userId: string) =>
    orgRequest<{ data: { removed: boolean } }>('DELETE', `/organizations/${orgId}/team/${userId}`),

  deleteOrg: (orgId: string) =>
    orgRequest<{ data: { deleted: boolean } }>('DELETE', `/organizations/${orgId}`),

  exportCSV: (orgId: string): Promise<Blob> => {
    const token = getOrgAccessToken();
    return fetch(`${BASE}/organizations/${orgId}/export`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }).then((r) => r.blob());
  },
};

// ─── Users API ────────────────────────────────────────────────────────────────

export const usersApi = {
  me: () => request<{ data: { user: any } }>('GET', '/users/me'),
  update: (body: {
    name?: string; email?: string; school?: string; grade?: number; city?: string;
    graduationYear?: number; phone?: string; goalHours?: number; goalProgram?: string;
    notifications?: Record<string, boolean>; marketingConsent?: boolean;
  }) => request<{ data: { user: any } }>('PATCH', '/users/me', body),
  delete: () => request<{ data: { scheduledFor: string } }>('DELETE', '/users/me'),
  exportData: () => request<any>('GET', '/users/me/export'),
};

// ─── Stats API ────────────────────────────────────────────────────────────────

export const statsApi = {
  dashboard: () => request<{ data: any }>('GET', '/stats/dashboard'),
  weekly: (weeks = 12) => request<{ data: any[] }>('GET', `/stats/weekly?weeks=${weeks}`),
};

// ─── Profiles API ─────────────────────────────────────────────────────────────

export const profilesApi = {
  me: () => request<{ data: { profile: any } }>('GET', '/profiles/me'),
  update: (body: { username?: string; bio?: string; profilePublic?: boolean; topBadgeIds?: string[] }) =>
    request<{ data: { profile: any } }>('PATCH', '/profiles/me', body),
  uploadAvatar: (image: string, contentType: string) =>
    request<{ data: { avatarUrl: string } }>('POST', '/profiles/me/avatar', { image, contentType }),
  checkUsername: (username: string) =>
    request<{ data: { available: boolean; reason?: string } }>('POST', '/profiles/check-username', { username }, true),
};

// ─── Badges API ──────────────────────────────────────────────────────────────

export const badgesApi = {
  all: () => request<{ data: { badges: any[] } }>('GET', '/badges', undefined, true),
  me: () => request<{ data: { badges: Array<{ badge: any; earned: boolean; earnedAt?: string }> } }>('GET', '/badges/me'),
  refresh: () => request<{ data: { earned: number; badges: any[] } }>('POST', '/badges/refresh', {}),
};

// ─── Onboarding API ──────────────────────────────────────────────────────────

export const onboardingApi = {
  status: () => request<{ data: { onboardingCompleted: boolean; skippedAt: string | null } }>('GET', '/onboarding/status'),
  complete: () => request<{ data: { onboardingCompleted: boolean } }>('POST', '/onboarding/complete', {}),
  skip: () => request<{ data: { onboardingCompleted: boolean; skipped: boolean } }>('POST', '/onboarding/skip', {}),
};

// ─── Org Claims API ──────────────────────────────────────────────────────────

// ─── Org Billing API ─────────────────────────────────────────────────────────

export const orgBillingApi = {
  get: (orgId: string) =>
    orgRequest<{ data: { plan: string; status: string; currentPeriodEnd: string | null; cancelAtPeriodEnd: boolean } }>(
      'GET', `/org/${orgId}/billing`,
    ),
  createCheckout: (orgId: string, plan: 'pro' | 'enterprise', interval: 'monthly' | 'yearly') =>
    orgRequest<{ data: { url: string } }>('POST', `/org/${orgId}/billing/checkout`, { plan, interval }),
  openPortal: (orgId: string) =>
    orgRequest<{ data: { url: string } }>('POST', `/org/${orgId}/billing/portal`, {}),
};

// ─── Org Profile API ─────────────────────────────────────────────────────────

export const orgProfileApi = {
  update: (orgId: string, data: {
    name?: string;
    description?: string;
    website_url?: string;
    contact_email?: string;
    contact_phone?: string;
    is_recruiting?: boolean;
  }) => orgRequest<{ data: any }>('PATCH', `/organizations/${orgId}/profile`, data),

  uploadImage: (orgId: string, kind: 'logo' | 'cover', base64: string, mimeType: string) =>
    orgRequest<{ data: { url: string } }>('POST', `/organizations/${orgId}/logo?type=${kind}`, {
      base64,
      mimeType,
    }),
};

// ─── Volunteer interest ("I volunteer here") ─────────────────────────────────

export const volunteerInterestApi = {
  register: (orgId: string) =>
    request<{ data: { registered: boolean; orgName: string } }>('POST', `/organizations/${orgId}/interest`, {}),
  unregister: (orgId: string) =>
    request<{ data: { unregistered: boolean } }>('DELETE', `/organizations/${orgId}/interest`),
  status: (orgId: string) =>
    request<{ data: { registered: boolean } }>('GET', `/organizations/${orgId}/interest/status`),
};

export const orgClaimsApi = {
  submit: (body: { orgId: string; role: string; workEmail: string }) =>
    request<{ data: { claimId: string; autoApproved: boolean } }>('POST', '/org-claims', body),
  status: (orgId: string) =>
    request<{ data: { status: string } }>('GET', `/org-claims/status/${orgId}`),
  approve: (claimId: string) =>
    request<{ data: { approved: boolean } }>('POST', `/org-claims/${claimId}/approve`, {}),
  reject: (claimId: string, reason?: string) =>
    request<{ data: { rejected: boolean } }>('POST', `/org-claims/${claimId}/reject`, { reason }),
};

// ─── Leaderboard API ─────────────────────────────────────────────────────────

export type LeaderboardPeriod = 'all' | 'month' | 'week';
export type LeaderboardType = 'global' | 'local' | 'school';

export interface LeaderboardEntry {
  rank: number;
  userId: string | null;
  name: string;
  username: string | null;
  avatarUrl: string | null;
  school: string | null;
  city: string | null;
  verifiedHours: number;
  sessionCount: number;
  isCurrentUser: boolean;
  isPrivate: boolean;
  badges: { id: string; name: string; tier: string; iconName: string }[];
}

export interface LeaderboardResult {
  entries: LeaderboardEntry[];
  currentUserEntry: LeaderboardEntry | null;
  currentUserRank: number | null;
  totalParticipants: number;
  period: LeaderboardPeriod;
  type: LeaderboardType;
}

export const leaderboardApi = {
  get: (params: {
    type?: LeaderboardType;
    period?: LeaderboardPeriod;
    school?: string;
    city?: string;
    limit?: number;
    offset?: number;
  }) => {
    const qs = new URLSearchParams();
    if (params.type) qs.set('type', params.type);
    if (params.period) qs.set('period', params.period);
    if (params.school) qs.set('school', params.school);
    if (params.city) qs.set('city', params.city);
    if (params.limit != null) qs.set('limit', String(params.limit));
    if (params.offset != null) qs.set('offset', String(params.offset));
    return request<{ data: LeaderboardResult }>('GET', `/leaderboard?${qs}`);
  },

  getUserStats: (username: string) =>
    request<{ data: any }>('GET', `/leaderboard/u/${username}`),

  // Groups
  createGroup: (body: { name: string; type?: 'school' | 'custom'; isPrivate?: boolean }) =>
    request<{ data: { id: string; name: string; code: string; type: string; created_at: string } }>(
      'POST',
      '/leaderboard/groups',
      body,
    ),

  joinGroup: (code: string) =>
    request<{ data: { group: any; alreadyMember: boolean } }>(
      'POST',
      '/leaderboard/groups/join',
      { code },
    ),

  myGroups: () =>
    request<{ data: { groups: any[] } }>('GET', '/leaderboard/groups/mine'),

  getGroup: (groupId: string) =>
    request<{ data: { group: any; entries: any[]; totalParticipants: number } }>(
      'GET',
      `/leaderboard/groups/${groupId}`,
    ),
};

// ─── Chapter / Coordinator (institutional) API ───────────────────────────────

export interface RosterImportRow {
  name: string;
  email: string;
  graduationYear?: number | null;
}

export interface ComplianceStudent {
  id: string;
  name: string;
  email: string;
  graduationYear: number | null;
  verifiedHours: number;
  requiredHours: number;
  met: boolean;
  remaining: number;
}

export interface ComplianceReport {
  chapterName: string;
  requiredHours: number;
  totalStudents: number;
  metCount: number;
  notMetCount: number;
  byGradYear: { graduationYear: number | null; total: number; met: number }[];
  students: ComplianceStudent[];
}

export interface RosterImportResult {
  created: number;
  skippedExisting: number;
  errors: { email: string; reason: string }[];
  invites: { email: string; name: string; inviteToken: string }[];
}

export const adminApi = {
  getChapter: () => request<{ data: any }>('GET', '/admin/chapter'),

  updateChapter: (body: {
    name?: string;
    requiredHours?: number;
    verifiedEmailDomain?: string;
    contactEmail?: string;
  }) => request<{ data: any }>('PATCH', '/admin/chapter', body),

  getMembers: () => request<{ data: any[] }>('GET', '/admin/members'),

  getCompliance: () => request<{ data: ComplianceReport }>('GET', '/admin/compliance'),

  importRoster: (rows: RosterImportRow[]) =>
    request<{ data: RosterImportResult }>('POST', '/admin/roster/import', { rows }),

  getInvites: () => request<{ data: any[] }>('GET', '/admin/invites'),

  /** Download the cohort compliance report as a CSV blob. */
  exportComplianceCsv: (): Promise<Blob> =>
    fetch(`${BASE}/admin/compliance/export`, {
      headers: { Authorization: `Bearer ${getAccessToken() ?? ''}` },
    }).then((r) => r.blob()),

  // Accept a chapter roster invite (student joins their chapter).
  acceptInvite: (token: string) =>
    request<{ data: { joined: boolean; chapterId: string } }>('POST', '/admin/invites/accept', { token }),

  // ── Platform-admin: school leads & provisioning ──
  listSchoolLeads: (status?: string) =>
    request<{ data: any[] }>('GET', `/admin/schools${status ? `?status=${status}` : ''}`),

  provisionChapter: (body: {
    leadId?: string;
    schoolName: string;
    coordinatorEmail: string;
    coordinatorName?: string;
    maxMembers?: number;
    requiredHours?: number;
  }) => request<{ data: { chapterId: string; status: string } }>('POST', '/admin/schools/provision', body),

  rejectSchoolLead: (leadId: string) =>
    request<{ data: { status: string } }>('POST', `/admin/schools/${leadId}/reject`),

  // Coordinator claims a provisioned chapter via the email-locked token.
  claimChapter: (token: string) =>
    request<{ data: { chapterId: string; name: string } }>('POST', '/chapter/claim', { token }),
};

// ── Chapter platform (coordinator dashboard) ──
export interface ChapterOverview {
  chapterName: string;
  requiredHours: number;
  deadline: string | null;
  daysToDeadline: number | null;
  totalStudents: number;
  metCount: number;
  atRiskCount: number;
  incompleteCount: number;
  avgHours: number;
}

export type ChapterStudentStatus = 'met' | 'on_track' | 'at_risk' | 'overdue' | 'no_goal';

export interface RosterStudent {
  id: string;
  name: string;
  email: string;
  graduationYear: number | null;
  verifiedHours: number;
  goal: number;
  remaining: number;
  met: boolean;
  status: ChapterStudentStatus;
}

export const chapterApi = {
  getOverview: () => request<{ data: ChapterOverview }>('GET', '/chapter/overview'),

  getRoster: (params: { search?: string; filter?: string } = {}) => {
    const qs = new URLSearchParams();
    if (params.search) qs.set('search', params.search);
    if (params.filter && params.filter !== 'all') qs.set('filter', params.filter);
    const q = qs.toString();
    return request<{ data: { students: RosterStudent[]; total: number } }>(
      'GET',
      `/chapter/roster${q ? `?${q}` : ''}`,
    );
  },

  getStudent: (id: string) => request<{ data: any }>('GET', `/chapter/students/${id}`),

  setStudentGoal: (id: string, hours: number | null) =>
    request<{ data: any }>('PATCH', `/chapter/students/${id}/goal`, { hours }),

  adjustHours: (id: string, body: { hours: number; reason?: string }) =>
    request<{ data: any }>('POST', `/chapter/students/${id}/adjust`, body),

  getCohortGoals: () =>
    request<{ data: { graduationYear: number; requiredHours: number }[] }>('GET', '/chapter/cohort-goals'),

  setCohortGoal: (graduationYear: number, requiredHours: number) =>
    request<{ data: any }>('PUT', '/chapter/cohort-goals', { graduationYear, requiredHours }),

  updateSettings: (body: { requiredHours?: number; requirementDeadline?: string | null; riskWindowDays?: number; remindersEnabled?: boolean }) =>
    request<{ data: any }>('PATCH', '/chapter/settings', body),

  sendAnnouncement: (body: { title: string; body: string; audience: string }) =>
    request<{ data: { sent: number } }>('POST', '/chapter/announcements', body),

  remindBehind: () =>
    request<{ data: { sent: number } }>('POST', '/chapter/remind-behind'),

  myChapter: () => request<{ data: any | null }>('GET', '/my-chapter'),

  // Team & roles
  myPermissions: () => request<{ data: { isOwner: boolean; permissions: string[]; catalogue: { key: string; label: string }[] } }>('GET', '/chapter/me/permissions'),
  getTeam: () => request<{ data: { members: any[] } }>('GET', '/chapter/team'),
  addCoordinator: (email: string, roleId: string | null) => request<{ data: any }>('POST', '/chapter/team', { email, roleId }),
  setCoordinatorRole: (userId: string, roleId: string | null) => request<{ data: any }>('PATCH', `/chapter/team/${userId}/role`, { roleId }),
  removeCoordinator: (userId: string) => request<{ data: any }>('DELETE', `/chapter/team/${userId}`),
  getRoles: () => request<{ data: { id: string; name: string; permissions: string[]; is_default: boolean }[] }>('GET', '/chapter/roles'),
  createRole: (name: string, permissions: string[]) => request<{ data: { id: string } }>('POST', '/chapter/roles', { name, permissions }),
  updateRole: (roleId: string, body: { name?: string; permissions?: string[] }) => request<{ data: any }>('PATCH', `/chapter/roles/${roleId}`, body),
  deleteRole: (roleId: string) => request<{ data: any }>('DELETE', `/chapter/roles/${roleId}`),

  // Partners
  getPartners: () => request<{ data: any[] }>('GET', '/chapter/partners'),
  createPartner: (orgName: string, contactEmail: string) => request<{ data: any }>('POST', '/chapter/partners', { orgName, contactEmail }),
  revokePartner: (id: string) => request<{ data: any }>('DELETE', `/chapter/partners/${id}`),

  // Opportunities (coordinator)
  getOpportunities: () => request<{ data: any[] }>('GET', '/chapter/opportunities'),
  createOpportunity: (body: { title: string; description?: string; orgName?: string; slots?: number | null; startsAt?: string | null; location?: string }) =>
    request<{ data: any }>('POST', '/chapter/opportunities', body),
  getOpportunitySignups: (id: string) => request<{ data: { title: string; signups: any[] } }>('GET', `/chapter/opportunities/${id}/signups`),

  // Opportunities (student)
  myOpportunities: () => request<{ data: any[] }>('GET', '/my-opportunities'),
  signupOpportunity: (id: string) => request<{ data: { status: string } }>('POST', `/opportunities/${id}/signup`),
  cancelOpportunity: (id: string) => request<{ data: any }>('DELETE', `/opportunities/${id}/signup`),
};

// ── Partner accept (org admin) ──
export const partnerApi = {
  getInvite: (token: string) => request<{ data: { id: string; orgName: string; status: string; chapterName: string } }>('GET', `/partners/${token}`),
  accept: (token: string, orgId: string) => request<{ data: { ok: boolean; compPlan: string } }>('POST', '/partners/accept', { token, orgId }),
};

// ── Notifications (in-app inbox) ──
export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  action_url: string | null;
  read: boolean;
  created_at: string;
}

export const notificationsApi = {
  list: (page = 1, perPage = 20) =>
    request<{ data: NotificationItem[]; meta: any }>('GET', `/notifications?page=${page}&perPage=${perPage}`),
  unreadCount: () => request<{ data: { count: number } }>('GET', '/notifications/unread-count'),
  markRead: (id: string) => request<{ data: any }>('PATCH', `/notifications/${id}/read`),
  markAllRead: () => request<{ data: any }>('PATCH', '/notifications/read-all'),
  remove: (id: string) => request<{ data: any }>('DELETE', `/notifications/${id}`),
};

// ── Public: school early-access lead capture (no auth) ──
export const schoolApi = {
  submitLead: (body: {
    schoolName: string;
    coordinatorName: string;
    email: string;
    role?: string;
    studentCount?: number;
    note?: string;
  }) => request<{ data: { id: string; status: string } }>('POST', '/school-leads', body, true),
};

// ─── Org Platform API ────────────────────────────────────────────────────────

export const orgAuthApi = {
  login: (email: string, password: string) =>
    request<{ data: { user: any; orgs: any[]; defaultOrgId: string; accessToken: string; refreshToken: string; expiresAt: number } }>(
      'POST', '/auth/login/org', { email, password }, true,
    ),
  // Org-first signup: create a Merit account + org in one step (no student step).
  create: (body: {
    email: string; password: string;
    name: string; category: string; city: string;
    province?: string; country?: string; websiteUrl?: string;
    description?: string; contactPhone?: string; isRecruiting?: boolean;
    adminEmails?: string[];
  }) => request<{
    data: {
      user: any; org: { id: string; name: string; slug: string; role: string };
      orgs: any[]; defaultOrgId: string; invited: string[];
      accessToken: string | null; refreshToken: string | null; expiresAt: number | null;
    };
  }>('POST', '/auth/org/create', body, true),
};

export const orgEventsApi = {
  list: (orgId: string, params?: { status?: string; upcoming?: boolean }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.upcoming != null) qs.set('upcoming', String(params.upcoming));
    const suffix = qs.toString() ? `?${qs}` : '';
    return orgRequest<{ data: any[] }>('GET', `/org/${orgId}/events${suffix}`);
  },
  create: (orgId: string, data: {
    title: string; description?: string; location?: string; locationUrl?: string;
    program?: string; startTime: string; endTime: string;
    maxVolunteers?: number; hoursValue?: number; autoLogHours?: boolean;
  }) => orgRequest<{ data: any }>('POST', `/org/${orgId}/events`, data),
  get: (orgId: string, eventId: string) =>
    orgRequest<{ data: any }>('GET', `/org/${orgId}/events/${eventId}`),
  publish: (orgId: string, eventId: string) =>
    orgRequest<{ data: any }>('POST', `/org/${orgId}/events/${eventId}/publish`, {}),
  checkIn: (orgId: string, eventId: string, userId: string) =>
    orgRequest<{ data: any }>('POST', `/org/${orgId}/events/${eventId}/checkin/${userId}`, {}),
  complete: (orgId: string, eventId: string) =>
    orgRequest<{ data: any }>('POST', `/org/${orgId}/events/${eventId}/complete`, {}),
  signup: (orgId: string, eventId: string) =>
    orgRequest<{ data: any }>('POST', `/org/${orgId}/events/${eventId}/signup`, {}),
};

export const orgReportsApi = {
  grantReport: (orgId: string, from: string, to: string): Promise<Blob> => {
    const token = getOrgAccessToken();
    return fetch(`${BASE}/org/${orgId}/reports/grant?from=${from}&to=${to}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }).then((r) => {
      if (!r.ok) throw new ApiError(r.status, undefined, 'Report generation failed');
      return r.blob();
    });
  },
  impact: (orgId: string) =>
    orgRequest<{ data: any }>('GET', `/org/${orgId}/reports/impact`),
  certificate: (orgId: string, userId: string, coordinatorName: string): Promise<Blob> => {
    const token = getOrgAccessToken();
    return fetch(`${BASE}/org/${orgId}/certificates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ userId, coordinatorName }),
    }).then((r) => {
      if (!r.ok) throw new ApiError(r.status, undefined, 'Certificate generation failed');
      return r.blob();
    });
  },
};

export const orgMessagesApi = {
  send: (orgId: string, data: { message: string; filter: 'all' | 'event' | 'active_30d' | 'active_90d'; eventId?: string }) =>
    orgRequest<{ data: { sent: number; failed: number } }>('POST', `/org/${orgId}/messages`, data),
  history: (orgId: string) =>
    orgRequest<{ data: any[] }>('GET', `/org/${orgId}/messages`),
};

export const orgInvitesApi = {
  create: (orgId: string, email: string, role: 'coordinator' | 'admin') =>
    orgRequest<{ data: any }>('POST', `/org/${orgId}/invites`, { email, role }),
  getByToken: (token: string) =>
    request<{ data: any }>('GET', `/org/invites/${token}`, undefined, true),
  accept: (token: string) =>
    // accept uses the STUDENT token because the invitee may not yet be in the org store
    request<{ data: any }>('POST', `/org/invites/${token}/accept`, {}),
};

export const orgVolunteersApi = {
  list: (orgId: string) =>
    orgRequest<{ data: any[] }>('GET', `/organizations/${orgId}/volunteers`),
  verify: (orgId: string, sessionId: string) =>
    orgRequest<{ data: any }>('POST', `/organizations/${orgId}/sessions/${sessionId}/verify`, {}),
  dispute: (orgId: string, sessionId: string) =>
    orgRequest<{ data: any }>('POST', `/organizations/${orgId}/sessions/${sessionId}/dispute`, {}),
  export: (orgId: string): Promise<Blob> => {
    const token = getOrgAccessToken();
    return fetch(`${BASE}/organizations/${orgId}/export`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }).then((r) => r.blob());
  },
};

export const orgOnboardingApi = {
  check: (orgId: string) =>
    orgRequest<{ data: { onboarding_completed: boolean; onboarding_completed_at: string | null } }>(
      'GET', `/org/${orgId}/onboarding`,
    ),
  complete: (orgId: string) =>
    orgRequest<{ data: { completed: boolean } }>('POST', `/org/${orgId}/onboarding/complete`, {}),
};

export const orgSignupApi = {
  signup: (data: {
    email: string;
    password: string;
    name: string;
    orgId: string;
    role?: string;
    token?: string;
  }) =>
    request<{
      data: {
        user: any;
        org: { id: string; name: string; slug: string; role: string };
        accessToken: string | null;
        refreshToken: string | null;
        expiresAt: number | null;
      };
    }>('POST', '/auth/org/signup', data, true),
};

// ─── Scholarships API ─────────────────────────────────────────────────────────

export const scholarshipsApi = {
  list: (params?: {
    search?: string;
    category?: string;
    location?: string;
    limit?: number;
    offset?: number;
  }) => {
    const qs = new URLSearchParams();
    if (params?.search)   qs.set('search',   params.search);
    if (params?.category) qs.set('category', params.category);
    if (params?.location) qs.set('location', params.location);
    if (params?.limit  != null) qs.set('limit',  String(params.limit));
    if (params?.offset != null) qs.set('offset', String(params.offset));
    const suffix = qs.toString() ? `?${qs}` : '';
    return request<{ data: { scholarships: any[]; savedIds: string[] } }>('GET', `/scholarships${suffix}`);
  },

  forMe: () =>
    request<{ data: { scholarships: any[]; matchedCategories: string[]; savedIds: string[] } }>('GET', '/scholarships/for-me'),

  saved: () =>
    request<{ data: { scholarships: any[] } }>('GET', '/scholarships/saved'),

  get: (id: string) =>
    request<{ data: { scholarship: any; isSaved: boolean } }>('GET', `/scholarships/${id}`),

  toggleSave: (id: string) =>
    request<{ data: { saved: boolean } }>('POST', `/scholarships/${id}/save`, {}),

  // Org-posted
  listOrgScholarships: (orgId: string) =>
    orgRequest<{ data: any[] }>('GET', `/org/${orgId}/scholarships`),

  createOrgScholarship: (orgId: string, body: {
    title: string; amount_label?: string; deadline?: string; is_rolling?: boolean;
    url: string; description?: string; requirements?: string; eligibility?: string;
    categories: string[]; renewable?: boolean;
  }) => orgRequest<{ data: any }>('POST', `/org/${orgId}/scholarships`, body),

  deleteOrgScholarship: (orgId: string, scholarshipId: string) =>
    orgRequest<{ data: { deleted: boolean } }>('DELETE', `/org/${orgId}/scholarships/${scholarshipId}`),
};

// ─── Billing API ─────────────────────────────────────────────────────────────

export const billingApi = {
  subscription: () => request<{ data: any }>('GET', '/billing/subscription'),
  createCheckout: (priceId: string) =>
    request<{ data: { url: string } }>('POST', '/billing/create-checkout', {
      priceId,
      successUrl: `${typeof window !== 'undefined' ? window.location.origin : ''}/settings/billing?success=1`,
      cancelUrl: `${typeof window !== 'undefined' ? window.location.origin : ''}/settings/billing`,
    }),
  createPortal: () =>
    request<{ data: { url: string } }>('POST', '/billing/create-portal', {
      returnUrl: `${typeof window !== 'undefined' ? window.location.origin : ''}/settings/billing`,
    }),
  cancel: () => request<{ data: any }>('POST', '/billing/cancel'),
};
