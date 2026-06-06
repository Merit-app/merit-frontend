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
  selfReported?: boolean;
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

/** Org returned by the discover / following endpoints */
export interface DiscoverOrg {
  id: string;
  slug: string;
  name: string;
  category: string | null;
  city: string | null;
  state: string | null;
  website: string | null;
  description: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  isRegisteredNonprofit: boolean;
  isInstitutionalPartner: boolean;
  claimed: boolean;
  isRecruiting: boolean;
  studentCount: number;
  isFollowing: boolean;
}

/** Small card for "similar orgs" sections */
export interface SimilarOrg {
  id: string;
  slug: string;
  name: string;
  category: string | null;
  city: string | null;
  state: string | null;
  logoUrl: string | null;
  isRegisteredNonprofit: boolean;
  studentCount: number;
}

/** Stats returned by GET /organizations/:id/stats */
export interface OrgStats {
  totalStudents: number;
  totalHours: number;
  avgSessionHours: number;
  totalSessions: number;
  mostActiveMonths: string[];
  recentVolunteerCount: number;
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
  plan: 'free' | 'pro' | 'premium' | 'institutional';
  goalProgram?: string;       // e.g. 'NHS', 'IB CAS', 'Custom'
  nhsGoalHours: number;       // 0 = no goal set yet
  nhsGoalStartDate: string;   // ISO date
  nhsGoalDeadline: string;    // ISO date
  isMinor?: boolean;
  consentAccepted?: boolean;
  onboardingCompleted?: boolean;
  username?: string;
  avatarUrl?: string;
  profilePublic?: boolean;
  bio?: string;
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

// ─── Org platform types ──────────────────────────────────────────────────────

export interface OrgSummary {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  role: 'owner' | 'admin' | 'coordinator';
}

export interface OrgUser {
  id: string;
  name: string;
  email: string;
  plan: string;
}

/** Separate persisted store for org-admin auth. Lives at localStorage key 'merit-org-auth'. */
export interface OrgStore {
  // Auth — persisted so page refresh keeps the org session alive
  orgIsAuthed: boolean;
  orgAccessToken: string | null;
  orgRefreshToken: string | null;
  orgExpiresAt: number | null; // Unix seconds
  orgUser: OrgUser | null;

  // Org context — also persisted
  currentOrgId: string | null;
  adminOrgs: OrgSummary[];

  // Actions
  orgLogin: (params: {
    user: OrgUser;
    orgs: OrgSummary[];
    defaultOrgId: string;
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
  }) => void;
  orgLogout: () => void;
  setOrgTokens: (accessToken: string, refreshToken: string, expiresAt: number) => void;
  setCurrentOrgId: (id: string | null) => void;
  setAdminOrgs: (orgs: OrgSummary[]) => void;
  clearOrgState: () => void;
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
  followedOrgIds: string[];
  isOrgAdmin: boolean;

  // Org platform
  currentOrgId: string | null;
  adminOrgs: OrgSummary[];

  // Settings
  notifications: NotificationPreferences;

  // Actions
  login: (user: User, tokens: { accessToken: string; refreshToken: string; expiresAt: number }) => void;
  logout: () => void;
  setTokens: (accessToken: string, refreshToken: string, expiresAt: number) => void;
  setSessions: (sessions: Session[]) => void;
  setOrganizations: (organizations: Organization[]) => void;
  setFollowedOrgIds: (ids: string[]) => void;
  setIsOrgAdmin: (v: boolean) => void;
  setCurrentOrgId: (id: string) => void;
  setAdminOrgs: (orgs: OrgSummary[]) => void;
  clearOrgState: () => void;
  toggleFollowOptimistic: (orgId: string) => void;
  addSession: (session: Session) => void;
  updateSession: (id: string, patch: Partial<Session>) => void;
  deleteSession: (id: string) => void;
  addOrganization: (org: Organization) => void;
  updateUser: (patch: Partial<User>) => void;
  updateNotifications: (patch: Partial<NotificationPreferences>) => void;
  clearSessions: () => void;
}
