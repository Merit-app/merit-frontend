'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useMeritStore, useHydrationStore } from '@/lib/store';
import { authApi, orgOnboardingApi, orgBillingApi } from '@/lib/api';
import { OrgOnboardingModal } from '@/components/org/onboarding-modal';
import {
  LayoutDashboard,
  Users,
  Calendar,
  MessageSquare,
  BarChart3,
  Award,
  Settings,
  LogOut,
  ChevronDown,
  Building2,
  ExternalLink,
  Bell,
} from 'lucide-react';

// Settings is NOT in this list — it lives in the bottom section
const NAV_ITEMS = [
  { href: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: 'volunteers', label: 'Volunteers', icon: Users },
  { href: 'events', label: 'Events', icon: Calendar },
  { href: 'messages', label: 'Messages', icon: MessageSquare },
  { href: 'reports', label: 'Reports', icon: BarChart3 },
  { href: 'certificates', label: 'Certificates', icon: Award },
] as const;

export default function OrgDashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useHydrationStore((s) => s.hydrated);
  const user = useMeritStore((s) => s.user);
  const isAuthed = useMeritStore((s) => s.isAuthed);
  const adminOrgs = useMeritStore((s) => s.adminOrgs);
  const currentOrgId = useMeritStore((s) => s.currentOrgId);
  const setCurrentOrgId = useMeritStore((s) => s.setCurrentOrgId);
  const clearOrgState = useMeritStore((s) => s.clearOrgState);
  const logout = useMeritStore((s) => s.logout);

  const [showOrgPicker, setShowOrgPicker] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingChecked, setOnboardingChecked] = useState(false);

  const currentOrg = adminOrgs.find((o) => o.id === currentOrgId) ?? adminOrgs[0];

  // ── Auth guard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthed || !adminOrgs.length) {
      router.push('/org/login');
    }
  }, [hydrated, isAuthed, adminOrgs.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Onboarding check — robust version ──────────────────────────────────────
  useEffect(() => {
    if (!currentOrg?.id || onboardingChecked || !isAuthed) return;

    const check = async () => {
      try {
        const res = await orgOnboardingApi.check(currentOrg.id);
        const data = (res as any)?.data;
        if (data && data.onboarding_completed === false) {
          setTimeout(() => setShowOnboarding(true), 800);
        }
      } catch (err) {
        // Column may not exist yet — fail silently
        console.warn('[org] onboarding check failed:', err);
      } finally {
        setOnboardingChecked(true);
      }
    };

    check();
  }, [currentOrg?.id, onboardingChecked, isAuthed]);

  // Reset check when org changes
  useEffect(() => {
    setOnboardingChecked(false);
    setShowOnboarding(false);
  }, [currentOrg?.id]);

  // ── Billing plan (for upgrade promo) ────────────────────────────────────────
  const { data: billingRes } = useQuery({
    queryKey: ['org-billing-plan', currentOrg?.id],
    queryFn: () => orgBillingApi.get(currentOrg!.id),
    enabled: !!currentOrg?.id && isAuthed,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
  const orgPlan = (billingRes as any)?.data?.plan ?? 'basic';
  const isBasicPlan = orgPlan === 'basic';

  const handleLogout = async () => {
    try { await authApi.logout(); } catch { /* non-fatal */ }
    logout();
    clearOrgState();
    router.push('/org/login');
  };

  if (!hydrated) return null;
  if (!isAuthed || !adminOrgs.length) return null;
  if (!currentOrg) return null;

  const orgBase = `/org/${currentOrg.id}`;

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col shrink-0">

        {/* Logo — links to dashboard */}
        <div className="px-5 h-14 border-b border-gray-800 flex items-center">
          <Link
            href={`${orgBase}/dashboard`}
            className="font-bold text-xl text-white hover:opacity-80 transition-opacity"
          >
            merit.
          </Link>
        </div>

        {/* Org selector */}
        <div className="p-4 border-b border-gray-800">
          <button
            onClick={() => setShowOrgPicker(!showOrgPicker)}
            className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-gray-800 transition-colors text-left"
          >
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0 overflow-hidden">
              {currentOrg.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={currentOrg.logoUrl} alt={currentOrg.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-bold text-sm">{currentOrg.name[0]}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm truncate">{currentOrg.name}</p>
              <p className="text-gray-400 text-xs capitalize">{currentOrg.role}</p>
            </div>
            {adminOrgs.length > 1 && (
              <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${showOrgPicker ? 'rotate-180' : ''}`} />
            )}
          </button>

          {showOrgPicker && adminOrgs.length > 1 && (
            <div className="mt-2 space-y-1">
              {adminOrgs.map((org) => (
                <button
                  key={org.id}
                  onClick={() => { setCurrentOrgId(org.id); setShowOrgPicker(false); router.push(`/org/${org.id}/dashboard`); }}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg text-sm transition-colors ${
                    org.id === currentOrg.id ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center text-xs font-bold">
                    {org.name[0]}
                  </div>
                  <span className="truncate">{org.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const href = `${orgBase}/${item.href}`;
            const isActive = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={item.href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-white text-gray-900' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-gray-800 space-y-1">
          {/* Upgrade promo — only for Basic plan orgs */}
          {isBasicPlan && (
            <div className="mx-0 mb-2 bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-xl p-3">
              <p className="text-white text-xs font-bold mb-0.5">Upgrade to Pro</p>
              <p className="text-gray-400 text-[10px] leading-snug mb-2.5">
                Events, bulk SMS, grant reports, and certificates.
              </p>
              <Link
                href={`${orgBase}/settings?tab=billing`}
                className="block w-full text-center text-[11px] font-semibold bg-white text-gray-900 rounded-lg py-1.5 hover:bg-gray-200 transition-colors"
              >
                Upgrade · $29/mo
              </Link>
            </div>
          )}

          {/* Settings — pinned to bottom */}
          <Link
            href={`${orgBase}/settings`}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              pathname.startsWith(`${orgBase}/settings`)
                ? 'bg-white text-gray-900'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <Settings className="w-4 h-4 shrink-0" />
            Settings
          </Link>

          <a
            href={`/orgs/${currentOrg.slug}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <ExternalLink className="w-4 h-4 shrink-0" />
            View public page
          </a>
          <a
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <Building2 className="w-4 h-4 shrink-0" />
            Student dashboard
          </a>

          {/* Sign out */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400/70 hover:text-red-400 hover:bg-red-400/5 transition-colors w-full"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Sign out
          </button>

          {/* User row */}
          <div className="flex items-center gap-3 px-3 py-2.5 mt-1 border-t border-gray-800">
            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {user?.firstName?.[0] ?? '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-gray-600 text-[10px] truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto bg-gray-950">
        <div className="sticky top-0 z-10 bg-gray-950/80 backdrop-blur-sm border-b border-gray-800 px-8 h-14 flex items-center justify-between">
          <div />
          <button className="text-gray-400 hover:text-white transition-colors">
            <Bell className="w-5 h-5" />
          </button>
        </div>
        <div className="p-8">{children}</div>
      </main>

      {/* Onboarding walkthrough */}
      {showOnboarding && currentOrg && (
        <OrgOnboardingModal
          orgId={currentOrg.id}
          orgName={currentOrg.name}
          onComplete={() => setShowOnboarding(false)}
        />
      )}
    </div>
  );
}
