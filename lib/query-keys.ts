export const queryKeys = {
  // Auth
  me: ['me'] as const,

  // Sessions
  sessions: ['sessions'] as const,
  session: (id: string) => ['sessions', id] as const,

  // Dashboard
  stats: ['stats'] as const,

  // Organizations
  organizations: ['organizations'] as const,
  organization: (slug: string) => ['organizations', slug] as const,
  savedOrgs: ['organizations', 'saved'] as const,

  // Badges
  badges: ['badges'] as const,
  myBadges: ['badges', 'me'] as const,

  // Profiles
  profile: (username: string) => ['profiles', username] as const,

  // Notifications
  notifications: ['notifications'] as const,

  // Leaderboard
  leaderboard: (type: string, period: string, scope?: string, cityScope?: string) =>
    ['leaderboard', type, period, scope ?? '', cityScope ?? ''] as const,
  leaderboardUser: (username: string) => ['leaderboard', 'u', username] as const,
} as const;
