import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { MeritStore, Session, Organization, User, NotificationPreferences } from './types';
import { mockSessions, mockOrganizations, mockUser } from './mock-data';

const defaultNotifications = {
  smsVerification: true,
  weeklyProgress: true,
  goalMilestones: true,
  productUpdates: false,
};

export const useMeritStore = create<MeritStore>()(
  persist(
    (set) => ({
      // ── Auth ────────────────────────────────────────────────────────────
      isAuthed: false,
      user: mockUser,

      // ── Data ────────────────────────────────────────────────────────────
      sessions: mockSessions,
      organizations: mockOrganizations,

      // ── Settings ────────────────────────────────────────────────────────
      notifications: defaultNotifications,

      // ── Actions ─────────────────────────────────────────────────────────
      login: () => set({ isAuthed: true }),
      logout: () => set({ isAuthed: false }),

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
    }
  )
);
