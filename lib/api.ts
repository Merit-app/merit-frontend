/**
 * lib/api.ts
 * Typed API client for the Merit backend.
 * Reads NEXT_PUBLIC_API_URL, attaches the Supabase JWT from the Zustand store,
 * handles 401 → token refresh → retry, and maps backend shapes to frontend types.
 */

import type { User, Session, Organization } from './types';

const BASE = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/$/, '');

// ─── Error class ─────────────────────────────────────────────────────────────

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

// ─── Token helpers (lazy import to avoid circular deps) ──────────────────────

function getStore() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { useMeritStore } = require('./store');
  return useMeritStore;
}

function getAccessToken(): string | null {
  return getStore().getState().accessToken ?? null;
}

function getRefreshToken(): string | null {
  return getStore().getState().refreshToken ?? null;
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

async function makeRequest(
  method: string,
  path: string,
  body?: unknown,
  token?: string | null,
): Promise<Response> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  isPublic = false,
): Promise<T> {
  const token = isPublic ? null : getAccessToken();
  let res = await makeRequest(method, path, body, token);

  // 401 → try refresh → retry once
  if (res.status === 401 && !isPublic) {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        const refreshRes = await makeRequest('POST', '/auth/refresh', { refreshToken }, null);
        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          const s = refreshData?.data;
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
    // Use account creation date as goal start date
    nhsGoalStartDate: raw.created_at ? raw.created_at.split('T')[0] : '',
    nhsGoalDeadline: '',
    isMinor: raw.is_minor ?? false,
    consentAccepted: raw.parental_consent_received ?? true,
    onboardingCompleted: raw.onboarding_completed ?? false,
    username: raw.username ?? undefined,
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
    tier: tier === 'verified_institutional'
      ? 'institution'
      : tier === 'verified_basic'
      ? 'supervisor'
      : null,
    verifiedAt: raw.verified_at ?? undefined,
    notes: raw.notes ?? undefined,
  };
}

export function mapOrg(raw: any): Organization {
  const city = raw.city ?? '';
  const state = raw.state ?? '';
  const address = [city, state].filter(Boolean).join(', ') || undefined;
  return {
    id: raw.id ?? '',
    slug: raw.id ?? '',   // use UUID as routing key (no slug column in backend)
    name: raw.name ?? '',
    category: (raw.category as Organization['category']) ?? 'Other',
    address,
    website: raw.website ?? undefined,
    ein: raw.ein ?? undefined,
    registrationStatus: raw.is_institutional_partner
      ? 'institutional'
      : raw.is_registered_nonprofit || raw.isInstitutionalPartner
      ? 'registered'
      : raw.isRegisteredNonprofit
      ? 'registered'
      : 'unregistered',
    description: raw.description ?? undefined,
  };
}

// ─── Auth API ────────────────────────────────────────────────────────────────

export const authApi = {
  signup: (body: {
    email: string;
    password: string;
    name: string;
    dateOfBirth: string;
    school?: string;
    grade?: number;
    goalProgram?: string;
    goalHours?: number;
  }) => request<{ data: { user: any; requiresEmailConfirmation: boolean; requiresOnboardingConsent: boolean } }>('POST', '/auth/signup', body, true),

  login: (email: string, password: string) =>
    request<{ data: { user: any; session: { accessToken: string; refreshToken: string; expiresAt: number } } }>(
      'POST', '/auth/login', { email, password }, true,
    ),

  logout: () => request<{ data: { loggedOut: boolean } }>('POST', '/auth/logout'),

  me: () => request<{ data: { user: any } }>('GET', '/auth/me'),

  requestPasswordReset: (email: string) =>
    request<{ data: { message: string } }>('POST', '/auth/request-password-reset', { email }, true),

  resetPassword: (token: string, newPassword: string) =>
    request<{ data: { message: string } }>('POST', '/auth/reset-password', { token, newPassword }, true),

  changePassword: (currentPassword: string, newPassword: string) =>
    request<{ data: { message: string } }>('POST', '/auth/change-password', { currentPassword, newPassword }),

  acceptConsent: () =>
    request<{ data: { user: any } }>('PATCH', '/auth/accept-consent', {}),
};

// ─── Sessions API ────────────────────────────────────────────────────────────

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
    date: string;
    hours: number;
    activity: string;
    supervisorName: string;
    supervisorPhone?: string;
    supervisorEmail?: string;
  }) => request<{ data: { session: any } }>('POST', '/sessions', body),

  update: (id: string, body: {
    activity?: string;
    supervisorName?: string;
    supervisorPhone?: string;
    supervisorEmail?: string;
  }) => request<{ data: any }>('PATCH', `/sessions/${id}`, body),

  delete: (id: string) => request<{ data: any }>('DELETE', `/sessions/${id}`),

  resend: (id: string) => request<{ data: any }>('POST', `/sessions/${id}/resend-verification`),
};

// ─── Organizations API ───────────────────────────────────────────────────────

export const orgsApi = {
  search: (q: string, limit = 12) =>
    request<{ data: any[] }>('GET', `/organizations/search?q=${encodeURIComponent(q)}&limit=${limit}`),

  me: () => request<{ data: any[] }>('GET', '/organizations/me'),

  get: (id: string) => request<{ data: { org: any } }>('GET', `/organizations/${id}`),
};

// ─── Users API ───────────────────────────────────────────────────────────────

export const usersApi = {
  me: () => request<{ data: { user: any } }>('GET', '/users/me'),

  update: (body: {
    name?: string;
    email?: string;
    school?: string;
    grade?: number;
    graduationYear?: number;
    phone?: string;
    goalHours?: number;
    goalProgram?: string;
    notifications?: Record<string, boolean>;
    marketingConsent?: boolean;
  }) => request<{ data: { user: any } }>('PATCH', '/users/me', body),

  delete: () => request<{ data: { scheduledFor: string } }>('DELETE', '/users/me'),

  exportData: () => request<any>('GET', '/users/me/export'),
};

// ─── Stats API ───────────────────────────────────────────────────────────────

export const statsApi = {
  dashboard: () => request<{ data: any }>('GET', '/stats/dashboard'),

  weekly: (weeks = 12) => request<{ data: any[] }>('GET', `/stats/weekly?weeks=${weeks}`),
};

// ─── Profiles API ────────────────────────────────────────────────────────────

export const profilesApi = {
  me: () =>
    request<{ data: { profile: any } }>('GET', '/profiles/me'),

  update: (body: {
    username?: string;
    bio?: string;
    profilePublic?: boolean;
    topBadgeIds?: string[];
  }) => request<{ data: { profile: any } }>('PATCH', '/profiles/me', body),

  checkUsername: (username: string) =>
    request<{ data: { available: boolean; reason?: string } }>(
      'POST', '/profiles/check-username', { username }, true,
    ),
};

// ─── Badges API ───────────────────────────────────────────────────────────────

export const badgesApi = {
  all: () =>
    request<{ data: { badges: any[] } }>('GET', '/badges', undefined, true),

  me: () =>
    request<{ data: { badges: Array<{ badge: any; earned: boolean; earnedAt?: string }> } }>(
      'GET', '/badges/me',
    ),

  refresh: () =>
    request<{ data: { earned: number; badges: any[] } }>('POST', '/badges/refresh', {}),
};

// ─── Onboarding API ──────────────────────────────────────────────────────────

export const onboardingApi = {
  status: () =>
    request<{ data: { onboardingCompleted: boolean; skippedAt: string | null } }>('GET', '/onboarding/status'),

  complete: () =>
    request<{ data: { onboardingCompleted: boolean } }>('POST', '/onboarding/complete', {}),

  skip: () =>
    request<{ data: { onboardingCompleted: boolean; skipped: boolean } }>('POST', '/onboarding/skip', {}),
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
