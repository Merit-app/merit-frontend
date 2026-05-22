// ─── Core domain types for Merit ────────────────────────────────────────────

export type VerificationTier = 'institution' | 'supervisor' | null;

export type SessionStatus = 'verified' | 'pending' | 'disputed';

export type OrgCategory =
  | 'Community'
  | 'Education'
  | 'Health'
  | 'Animal welfare'
  | 'Environment'
  | 'Social services'
  | 'Other';

export interface Session {
  id: string;
  org: string;
  orgSlug: string;
  date: string;           // ISO date string: 'YYYY-MM-DD'
  hours: number;
  activity: string;
  supervisor: string;
  supervisorPhone: string;
  supervisorEmail?: string;
  status: SessionStatus;
  tier: VerificationTier;
  verifiedAt?: string;    // ISO datetime string
  notes?: string;
}

export interface Organization {
  id: string;
  slug: string;
  name: string;
  category: OrgCategory;
  address?: string;
  website?: string;
  ein?: string;           // EIN or CRA number
  registrationStatus: 'registered' | 'institutional' | 'unregistered';
  description?: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  school: string;
  grade: number;
  graduationYear: number;
  phone?: string;
  phoneVerified: boolean;
  plan: 'free' | 'premium' | 'institutional';
  nhsGoalHours: number;
  nhsGoalStartDate: string;  // ISO date
  nhsGoalDeadline: string;   // ISO date
}

export interface Goal {
  id: string;
  label: string;           // e.g. "NHS Service Requirement"
  targetHours: number;
  startDate: string;
  deadline: string;
}

export type NotificationKey =
  | 'smsVerification'
  | 'weeklyProgress'
  | 'goalMilestones'
  | 'productUpdates';

export interface NotificationPreferences {
  smsVerification: boolean;
  weeklyProgress: boolean;
  goalMilestones: boolean;
  productUpdates: boolean;
}

// ─── Store shape ─────────────────────────────────────────────────────────────

export interface MeritStore {
  // Auth
  isAuthed: boolean;
  user: User;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;  // Unix seconds (Supabase format)

  // Data
  sessions: Session[];
  organizations: Organization[];

  // Settings
  notifications: NotificationPreferences;

  // Actions
  login: (user: User, tokens: { accessToken: string; refreshToken: string; expiresAt: number }) => void;
  logout: () => void;
  setTokens: (accessToken: string, refreshToken: string, expiresAt: number) => void;
  setSessions: (sessions: Session[]) => void;
  setOrganizations: (organizations: Organization[]) => void;
  addSession: (session: Session) => void;
  updateSession: (id: string, patch: Partial<Session>) => void;
  deleteSession: (id: string) => void;
  addOrganization: (org: Organization) => void;
  updateUser: (patch: Partial<User>) => void;
  updateNotifications: (patch: Partial<NotificationPreferences>) => void;
  clearSessions: () => void;
}
