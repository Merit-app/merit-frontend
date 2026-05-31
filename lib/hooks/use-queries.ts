import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  badgesApi,
  sessionsApi,
  statsApi,
  orgsApi,
  usersApi,
} from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import type { Session, NotificationKey } from '@/lib/types';

// ─── Tier sort order (used in badge hooks) ────────────────────────────────────

const TIER_ORDER: Record<string, number> = {
  platinum: 0,
  gold: 1,
  silver: 2,
  bronze: 3,
};

// ─── Badges ───────────────────────────────────────────────────────────────────

export function useMyBadges() {
  return useQuery({
    queryKey: queryKeys.myBadges,
    queryFn: async () => {
      const res = await badgesApi.me();
      return res.data.badges ?? [];
    },
    select: (badges) =>
      [...badges].sort((a, b) => {
        // Earned first
        if (a.earned !== b.earned) return a.earned ? -1 : 1;
        // Then by tier
        return (TIER_ORDER[a.badge?.tier ?? ''] ?? 9) - (TIER_ORDER[b.badge?.tier ?? ''] ?? 9);
      }),
  });
}

export function useRefreshBadges() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => badgesApi.refresh(),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.myBadges });
      toast.success('Badges refreshed.');
    },
    onError: () => toast.error('Failed to refresh badges.'),
  });
}

// ─── Sessions ─────────────────────────────────────────────────────────────────

export function useDeleteSession(onDeleteStore: (id: string) => void) {
  return useMutation({
    mutationFn: (id: string) => sessionsApi.delete(id),
    onSuccess: (_, id) => {
      onDeleteStore(id);
      toast.success('Session deleted.');
    },
    onError: () => toast.error('Failed to delete session.'),
  });
}

// ─── Dashboard stats ──────────────────────────────────────────────────────────

export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.stats,
    queryFn: async () => {
      const res = await statsApi.dashboard();
      return res.data;
    },
  });
}

// ─── Organizations ────────────────────────────────────────────────────────────

export function useToggleFollowOrg(orgId: string, isFollowing: boolean, onToggle: () => void) {
  return useMutation({
    mutationFn: () => orgsApi.follow(orgId),
    onMutate: () => {
      // Optimistic — caller handles store update
      onToggle();
    },
    onError: () => {
      // Roll back
      onToggle();
      toast.error('Failed to update.');
    },
  });
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export function useUpdateProfile(onSuccess?: () => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof usersApi.update>[0]) => usersApi.update(data),
    onSuccess: () => {
      toast.success('Profile saved.');
      qc.invalidateQueries({ queryKey: queryKeys.me });
      onSuccess?.();
    },
    onError: () => toast.error('Failed to save profile.'),
  });
}

// ─── Notifications ────────────────────────────────────────────────────────────

export function useToggleNotification(
  notifications: Record<NotificationKey, boolean>,
  updateStore: (patch: Partial<Record<NotificationKey, boolean>>) => void,
) {
  return useMutation({
    mutationFn: async ({ key, next }: { key: NotificationKey; next: boolean }) => {
      await usersApi.update({ notifications: { ...notifications, [key]: next } });
    },
    onMutate: ({ key, next }) => {
      updateStore({ [key]: next });
    },
    onSuccess: (_, { next }) => {
      toast.success(next ? 'Notification turned on.' : 'Notification turned off.');
    },
    onError: (_, { key, next }) => {
      // Roll back
      updateStore({ [key]: !next });
      toast.error('Failed to save notification preference.');
    },
  });
}
