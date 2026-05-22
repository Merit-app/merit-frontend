import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { MeritStore, Session, Organization, User, NotificationPreferences } from './types';

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
  nhsGoalHours: 75,
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
        }),

      setTokens: (accessToken: string, refreshToken: string, expiresAt: number) =>
        set({ accessToken, refreshToken, expiresAt }),

      setSessions: (sessions: Session[]) => set({ sessions }),

      setOrganizations: (organizations: Organization[]) => set({ organizations }),

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
    },
  ),
);
