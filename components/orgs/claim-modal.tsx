'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { X, Loader2, CheckCircle2, Building2, Clock } from 'lucide-react';
import { useMeritStore } from '@/lib/store';
import { orgClaimsApi, ApiError } from '@/lib/api';

const SPRING = { type: 'spring', stiffness: 300, damping: 30 } as const;

const ROLES = [
  { value: 'employee', label: 'Staff Member' },
  { value: 'coordinator', label: 'Volunteer Coordinator' },
  { value: 'owner', label: 'Executive Director / Owner' },
  { value: 'board_member', label: 'Board Member' },
  { value: 'other', label: 'Other' },
] as const;

interface ClaimModalProps {
  orgId: string;
  orgName: string;
  orgWebsiteUrl?: string | null;
  onClose: () => void;
}

export function ClaimModal({ orgId, orgName, orgWebsiteUrl, onClose }: ClaimModalProps) {
  const router = useRouter();
  const user = useMeritStore((s) => s.user);
  const isAuthed = useMeritStore((s) => s.isAuthed);

  const [step, setStep] = useState<'form' | 'pending' | 'approved'>('form');
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    role: 'coordinator' as string,
    workEmail: user?.email ?? '',
  });

  const update = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  // Extract the hostname for the domain-match hint
  let orgDomain: string | null = null;
  if (orgWebsiteUrl) {
    try {
      const raw = orgWebsiteUrl.startsWith('http') ? orgWebsiteUrl : `https://${orgWebsiteUrl}`;
      orgDomain = new URL(raw).hostname.replace(/^www\./, '');
    } catch { orgDomain = null; }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.workEmail || !form.role) return;

    setIsLoading(true);
    try {
      const res = await orgClaimsApi.submit({
        orgId,
        role: form.role,
        workEmail: form.workEmail,
      });
      const { autoApproved } = res.data;

      if (autoApproved) {
        setStep('approved');
        setTimeout(() => {
          router.push(`/org/setup?orgId=${orgId}&orgName=${encodeURIComponent(orgName)}`);
        }, 2500);
      } else {
        setStep('pending');
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          const msg = err.message ?? '';
          if (msg.includes('already been claimed')) {
            toast.error('This organization has already been claimed.');
          } else {
            toast.error('You already have a pending claim for this org.');
            setStep('pending');
          }
        } else {
          toast.error(err.message || 'Failed to submit claim. Please try again.');
        }
      } else {
        toast.error('Could not reach the server. Check your connection.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    'w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-900 transition-colors';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 8 }}
        transition={SPRING}
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-gray-700" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Claim this page</h2>
              <p className="text-sm text-gray-500">{orgName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {/* Form */}
            {step === 'form' && (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <p className="text-sm text-gray-600 leading-relaxed">
                  Tell us your role at {orgName}. If your work email matches the org&apos;s website
                  domain, you&apos;ll get instant access. Otherwise we&apos;ll review within 24–48 hours.
                </p>

                {orgDomain && (
                  <div className="flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-2 rounded-lg">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    Email matching <strong>{orgDomain}</strong> gets instant approval
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Your role
                  </label>
                  <select
                    value={form.role}
                    onChange={(e) => update('role', e.target.value)}
                    className={inputClass}
                    required
                  >
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Work email
                  </label>
                  <input
                    type="email"
                    value={form.workEmail}
                    onChange={(e) => update('workEmail', e.target.value)}
                    placeholder="you@organization.org"
                    required
                    className={inputClass}
                  />
                </div>

                {!isAuthed && (
                  <p className="text-xs text-gray-400 text-center">
                    You&apos;ll need a Merit account to complete setup. We&apos;ll link to it after approval.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !form.workEmail}
                  className="w-full bg-gray-900 text-white font-semibold py-3 rounded-xl text-sm hover:bg-gray-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isLoading ? 'Submitting...' : 'Submit claim →'}
                </button>
              </motion.form>
            )}

            {/* Pending */}
            {step === 'pending' && (
              <motion.div
                key="pending"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-4 space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
                  <Clock className="w-8 h-8 text-amber-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-lg">Claim submitted</p>
                  <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                    We&apos;ll review your request within 24–48 hours and email{' '}
                    <span className="font-medium">{form.workEmail}</span> when approved.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Close
                </button>
              </motion.div>
            )}

            {/* Approved */}
            {step === 'approved' && (
              <motion.div
                key="approved"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4 space-y-4"
              >
                <motion.div
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                  className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto"
                >
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </motion.div>
                <div>
                  <p className="font-bold text-gray-900 text-lg">Instantly approved!</p>
                  <p className="text-gray-500 text-sm mt-2">
                    Domain matched. Setting up your dashboard...
                  </p>
                </div>
                <Loader2 className="w-5 h-5 text-gray-400 animate-spin mx-auto" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
