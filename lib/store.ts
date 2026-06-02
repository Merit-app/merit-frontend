import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { MeritStore, Session, Organization, User, NotificationPreferences, OrgSummary } from './types';

// ── Hydration flag — separate tiny store so it never gets persisted ────────────
export const useHydrationStore = create<{ hydrated: boolean; setHydrated: () => void }>((set) => ({
  hydrated: false,
  setHydrated: () => set({ hydrated: true }),
}));

const defaultNotifications: NotificationPreferences = {
  smsVerification: true,
  weeklyProgress: true,
  goalMilestones: true,
  productUpdates: false,
};

/** Empty user — used as initial state before login */
const emptyUser: User = {
  id: '',
  firstName: '',
  lastName: '',
  email: '',
  school: '',
  grade: 11,
  graduationYear: new Date().getFullYear() + 1,
  phone: undefined,
  phoneVerified: false,
  plan: 'free',
  goalProgram: undefined,
  nhsGoalHours: 0,
  nhsGoalStartDate: '',
  nhsGoalDeadline: '',
};

export const useMeritStore = create<MeritStore>()(
  persist(
    (set) => ({
      // ── Auth ────────────────────────────────────────────────────────────
      isAuthed: false,
      user: emptyUser,
      accessToken: null,
      refreshToken: null,
      expiresAt: null,

      // ── Data ────────────────────────────────────────────────────────────
      sessions: [],
      organizations: [],
      followedOrgIds: [],
      isOrgAdmin: false,

      // ── Org platform ────────────────────────────────────────────────────
      currentOrgId: null,
      adminOrgs: [],

      // ── Settings ────────────────────────────────────────────────────────
      notifications: defaultNotifications,

      // ── Actions ─────────────────────────────────────────────────────────
      login: (user: User, tokens: { accessToken: string; refreshToken: string; expiresAt: number }) =>
        set({
          isAuthed: true,
          user,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt: tokens.expiresAt,
        }),

      logout: () =>
        set({
          isAuthed: false,
          user: emptyUser,
          accessToken: null,
          refreshToken: null,
          expiresAt: null,
          sessions: [],
          organizations: [],
          followedOrgIds: [],
        }),

      setTokens: (accessToken: string, refreshToken: string, expiresAt: number) =>
        set({ accessToken, refreshToken, expiresAt }),

      setSessions: (sessions: Session[]) => set({ sessions }),

      setOrganizations: (organizations: Organization[]) => set({ organizations }),

      setFollowedOrgIds: (ids: string[]) => set({ followedOrgIds: ids }),

      setIsOrgAdmin: (v: boolean) => set({ isOrgAdmin: v }),

      setCurrentOrgId: (id: string) => set({ currentOrgId: id }),

      setAdminOrgs: (orgs: OrgSummary[]) => set({ adminOrgs: orgs }),

      clearOrgState: () => set({ currentOrgId: null, adminOrgs: [] }),

      toggleFollowOptimistic: (orgId: string) =>
        set((state) => ({
          followedOrgIds: state.followedOrgIds.includes(orgId)
            ? state.followedOrgIds.filter((id) => id !== orgId)
            : [...state.followedOrgIds, orgId],
        })),

      addSession: (session: Session) =>
        set((state) => ({ sessions: [session, ...state.sessions] })),

      updateSession: (id: string, patch: Partial<Session>) =>
        set((state) => ({
          sessions: state.sessions.map((s) => (s.id === id ? { ...s, ...patch } : s)),
        })),

      deleteSession: (id: string) =>
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== id),
        })),

      addOrganization: (org: Organization) =>
        set((state) => ({ organizations: [org, ...state.organizations] })),

      updateUser: (patch: Partial<User>) =>
        set((state) => ({ user: { ...state.user, ...patch } })),

      updateNotifications: (patch: Partial<NotificationPreferences>) =>
        set((state) => ({
          notifications: { ...state.notifications, ...patch },
        })),

      clearSessions: () => set({ sessions: [] }),
    }),
    {
      name: 'merit-store',
      storage: createJSONStorage(() => localStorage),
      // skipHydration prevents SSR/client mismatch — rehydrate in a useEffect
      skipHydration: true,
      // Security: neither access token nor refresh token is persisted to localStorage.
      // Both are kept in memory only. On page refresh the user will be redirected to
      // /login to re-authenticate. This eliminates the XSS-based token-theft vector.
      //
      // Long-term improvement: migrate to httpOnly cookie-based session storage in the
      // backend so the refresh token survives page reloads without being JS-accessible.
      partialize: (state) => ({
        isAuthed: state.isAuthed,
        user: state.user,
        // accessToken: intentionally NOT persisted (high-value, short-lived)
        // refreshToken: intentionally NOT persisted (XSS risk — do not add back)
        sessions: state.sessions,
        organizations: state.organizations,
        followedOrgIds: state.followedOrgIds,
        notifications: state.notifications,
        // Org platform context persists so re-loading lands on the right org
        currentOrgId: state.currentOrgId,
        adminOrgs: state.adminOrgs,
      }),
    },
  ),
);
