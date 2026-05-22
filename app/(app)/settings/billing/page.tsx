'use client';

import { useEffect, useState } from 'react';
import { Check, Zap, Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useMeritStore } from '@/lib/store';
import { billingApi, ApiError } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const FREE_FEATURES = [
  'Log unlimited service sessions',
  'SMS supervisor verification',
  'Classic PDF export',
  'Up to 5 organizations',
];

const PREMIUM_FEATURES = [
  'Everything in Free',
  'Modern & NHS-formal PDF templates',
  'Unlimited organizations',
  'CSV export',
  'Priority support',
];

const PREMIUM_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID ?? '';

interface BillingInfo {
  plan: string;
  status: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  paymentMethod: { brand: string; last4: string; expMonth: number; expYear: number } | null;
}

export default function BillingPage() {
  const user = useMeritStore((s) => s.user);
  const updateUser = useMeritStore((s) => s.updateUser);
  const isPremium = user.plan === 'premium';

  const [billing, setBilling] = useState<BillingInfo | null>(null);
  const [loadingBilling, setLoadingBilling] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [openingPortal, setOpeningPortal] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await billingApi.subscription();
        setBilling(res.data);
      } catch {
        // Non-fatal — show static plan info
      } finally {
        setLoadingBilling(false);
      }
    }
    load();
  }, []);

  async function handleUpgrade() {
    setUpgrading(true);
    try {
      const res = await billingApi.createCheckout(PREMIUM_PRICE_ID || 'price_placeholder');
      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        toast.error('Could not start checkout. Try again.');
      }
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message || 'Checkout failed. Try again.');
      } else {
        toast.error('Could not reach the server.');
      }
    } finally {
      setUpgrading(false);
    }
  }

  async function handleManage() {
    setOpeningPortal(true);
    try {
      const res = await billingApi.createPortal();
      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        toast.error('Could not open billing portal. Try again.');
      }
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message || 'Could not open billing portal.');
      } else {
        toast.error('Could not reach the server.');
      }
    } finally {
      setOpeningPortal(false);
    }
  }

  const nextBillingDate = billing?.currentPeriodEnd
    ? new Date(billing.currentPeriodEnd).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : null;

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-h1 text-ink-900">Plan & billing</h2>
        <p className="text-small text-ink-500 mt-1">Manage your subscription and payment details.</p>
      </div>

      {/* Current plan banner */}
      <div className={cn(
        'rounded-xl border p-5 mb-8 flex items-center justify-between',
        isPremium
          ? 'border-merit-blue-200 bg-merit-blue-50'
          : 'border-ink-200 bg-white'
      )}>
        <div>
          <p className="text-[13px] font-medium text-ink-900 capitalize">{user.plan} plan</p>
          <p className="text-small text-ink-500 mt-0.5">
            {isPremium && nextBillingDate
              ? `Next billing date: ${nextBillingDate}`
              : isPremium
              ? 'Active subscription'
              : 'Free forever for core features'}
          </p>
        </div>
        {isPremium ? (
          <Button
            variant="outline"
            className="border-merit-blue-200 text-merit-blue-700 hover:bg-merit-blue-100 font-medium text-[13px]"
            disabled={openingPortal}
            onClick={handleManage}
          >
            {openingPortal ? <Loader2 size={14} className="animate-spin mr-1.5" /> : null}
            Manage subscription
          </Button>
        ) : (
          <Button
            className="bg-merit-blue-600 hover:bg-merit-blue-700 text-white font-medium text-[13px]"
            onClick={handleUpgrade}
            disabled={upgrading}
          >
            {upgrading ? (
              <Loader2 size={14} className="animate-spin mr-1.5" />
            ) : (
              <Zap size={14} className="mr-1.5" />
            )}
            Upgrade to Premium
          </Button>
        )}
      </div>

      {/* Plan comparison */}
      <div className="grid grid-cols-2 gap-4">
        {/* Free */}
        <div className={cn(
          'rounded-xl border p-5',
          !isPremium ? 'border-ink-300 bg-white' : 'border-ink-200 bg-white opacity-60'
        )}>
          <div className="flex items-center justify-between mb-1">
            <p className="text-h3 text-ink-900">Free</p>
            {!isPremium && (
              <span className="text-[11px] font-medium text-merit-blue-600 bg-merit-blue-50 px-2 py-0.5 rounded-full">
                Current
              </span>
            )}
          </div>
          <p className="text-display text-ink-900 mb-4">$0</p>
          <ul className="space-y-2.5">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2 text-[13px] text-ink-700">
                <Check size={14} className="text-success mt-0.5 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Premium */}
        <div className={cn(
          'rounded-xl border p-5',
          isPremium ? 'border-merit-blue-300 bg-merit-blue-50' : 'border-ink-200 bg-white'
        )}>
          <div className="flex items-center justify-between mb-1">
            <p className="text-h3 text-ink-900">Premium</p>
            {isPremium && (
              <span className="text-[11px] font-medium text-merit-blue-600 bg-merit-blue-100 px-2 py-0.5 rounded-full">
                Current
              </span>
            )}
          </div>
          <p className="text-display text-ink-900 mb-4">
            $4<span className="text-[16px] font-normal text-ink-500">/mo</span>
          </p>
          <ul className="space-y-2.5">
            {PREMIUM_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2 text-[13px] text-ink-700">
                <Check size={14} className="text-merit-blue-600 mt-0.5 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          {!isPremium && (
            <Button
              className="w-full mt-5 bg-merit-blue-600 hover:bg-merit-blue-700 text-white font-medium text-[13px]"
              onClick={handleUpgrade}
              disabled={upgrading}
            >
              {upgrading ? (
                <Loader2 size={14} className="animate-spin mr-1.5" />
              ) : null}
              Upgrade — $4/mo
            </Button>
          )}
        </div>
      </div>

      {/* Payment method (premium only, from Stripe) */}
      {isPremium && billing?.paymentMethod && (
        <>
          <Separator className="my-8 bg-ink-200" />
          <div>
            <p className="text-h3 text-ink-900 mb-4">Payment method</p>
            <div className="flex items-center justify-between rounded-lg border border-ink-200 bg-white px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-12 rounded bg-ink-100 flex items-center justify-center">
                  <Lock size={12} className="text-ink-400" />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-ink-900 capitalize">
                    {billing.paymentMethod.brand} ending in {billing.paymentMethod.last4}
                  </p>
                  <p className="text-[12px] text-ink-500">
                    Expires {billing.paymentMethod.expMonth} / {String(billing.paymentMethod.expYear).slice(2)}
                  </p>
                </div>
              </div>
              <button
                className="text-[13px] text-merit-blue-600 hover:text-merit-blue-700 font-medium"
                onClick={handleManage}
                disabled={openingPortal}
              >
                Update
              </button>
            </div>
            <button
              className="mt-4 text-[13px] text-danger hover:text-danger/80 font-medium"
              onClick={handleManage}
              disabled={openingPortal}
            >
              Cancel subscription
            </button>
          </div>
        </>
      )}
    </div>
  );
}
