'use client';

import { useEffect, useState } from 'react';
import { Check, Lock, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useMeritStore } from '@/lib/store';
import { billingApi, ApiError } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const PRICE_IDS = {
  pro: {
    monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY ?? '',
    yearly:  process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY  ?? '',
  },
  premium: {
    monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_MONTHLY ?? '',
    yearly:  process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_YEARLY  ?? '',
  },
};

const FREE_FEATURES = [
  'Log unlimited service sessions',
  'SMS & email supervisor verification',
  'Classic PDF export',
  'Up to 5 organizations',
];

const PRO_FEATURES = [
  'Everything in Free',
  'Modern PDF templates',
  'Unlimited organizations',
  'CSV export',
  'Priority support',
];

const PREMIUM_FEATURES = [
  'Everything in Pro',
  'Advanced fraud analytics',
  'Bulk session import',
  'API access',
  'Dedicated account support',
];

interface BillingInfo {
  plan: string;
  status: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  paymentMethod: { brand: string; last4: string; expMonth: number; expYear: number } | null;
}

interface PlanCardProps {
  name: string;
  monthlyPrice: string;
  yearlyPrice: string;
  yearlyMonthly: string;
  features: string[];
  isCurrent: boolean;
  isHighlighted: boolean;
  cadence: 'monthly' | 'yearly';
  onUpgrade: () => void;
  upgrading: boolean;
  badge?: string;
}

function PlanCard({
  name,
  monthlyPrice,
  yearlyPrice,
  yearlyMonthly,
  features,
  isCurrent,
  isHighlighted,
  cadence,
  onUpgrade,
  upgrading,
  badge,
}: PlanCardProps) {
  const showFree = name === 'Free';

  return (
    <div className={cn(
      'rounded-xl border p-5 flex flex-col',
      isCurrent && isHighlighted
        ? 'border-merit-blue-300 bg-merit-blue-50'
        : isCurrent
        ? 'border-border bg-card'
        : isHighlighted
        ? 'border-merit-blue-200 bg-card'
        : 'border-border bg-card',
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <p className="text-h3 text-foreground">{name}</p>
        <div className="flex items-center gap-1.5">
          {badge && !isCurrent && (
            <span className="text-[11px] font-medium text-merit-blue-700 bg-merit-blue-100 px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
          {isCurrent && (
            <span className="text-[11px] font-medium text-merit-blue-600 bg-merit-blue-50 border border-merit-blue-200 px-2 py-0.5 rounded-full">
              Current
            </span>
          )}
        </div>
      </div>

      {/* Price */}
      {showFree ? (
        <p className="text-display text-foreground mb-1">$0</p>
      ) : cadence === 'monthly' ? (
        <div className="mb-1">
          <span className="text-display text-foreground">{monthlyPrice}</span>
          <span className="text-[14px] text-muted-foreground">/mo</span>
        </div>
      ) : (
        <div className="mb-0.5">
          <span className="text-display text-foreground">{yearlyMonthly}</span>
          <span className="text-[14px] text-muted-foreground">/mo</span>
        </div>
      )}
      {!showFree && cadence === 'yearly' && (
        <p className="text-[12px] text-muted-foreground mb-1">{yearlyPrice}/yr — billed annually</p>
      )}

      {/* Features */}
      <ul className="space-y-2.5 mt-3 mb-5 flex-1">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-[13px] text-foreground">
            <Check
              size={14}
              className={cn(
                'mt-0.5 shrink-0',
                isHighlighted ? 'text-merit-blue-600' : 'text-success',
              )}
            />
            {f}
          </li>
        ))}
      </ul>

      {/* CTA */}
      {!isCurrent && !showFree && (
        <Button
          className="w-full bg-merit-blue-600 hover:bg-merit-blue-700 text-white font-medium text-[13px]"
          onClick={onUpgrade}
          disabled={upgrading}
        >
          {upgrading ? <Loader2 size={14} className="animate-spin mr-1.5" /> : null}
          Upgrade to {name}
        </Button>
      )}
      {isCurrent && !showFree && (
        <p className="text-[12px] text-center text-muted-foreground mt-auto pt-1">Your current plan</p>
      )}
    </div>
  );
}

export default function BillingPage() {
  const user = useMeritStore((s) => s.user);
  const plan = user.plan ?? 'free';

  const [cadence, setCadence] = useState<'monthly' | 'yearly'>('monthly');
  const [billing, setBilling] = useState<BillingInfo | null>(null);
  const [loadingBilling, setLoadingBilling] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);
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

  async function handleUpgrade(tier: 'pro' | 'premium') {
    const priceId = PRICE_IDS[tier][cadence];
    setUpgrading(tier);
    try {
      const res = await billingApi.createCheckout(priceId);
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
      setUpgrading(null);
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

  const isPaid = plan === 'pro' || plan === 'premium';
  const nextBillingDate = billing?.currentPeriodEnd
    ? format(parseISO(billing.currentPeriodEnd), 'MMMM d, yyyy')
    : null;

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h2 className="text-h1 text-foreground">Plan & billing</h2>
        <p className="text-small text-muted-foreground mt-1">Manage your subscription and payment details.</p>
      </div>

      {/* Current plan banner (paid users only) */}
      {isPaid && (
        <div className="rounded-xl border border-merit-blue-200 bg-merit-blue-50 p-5 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-[13px] font-medium text-foreground capitalize">{plan} plan</p>
            <p className="text-small text-muted-foreground mt-0.5">
              {nextBillingDate ? `Next billing date: ${nextBillingDate}` : 'Active subscription'}
            </p>
          </div>
          <Button
            variant="outline"
            className="border-merit-blue-200 text-merit-blue-700 hover:bg-merit-blue-100 font-medium text-[13px]"
            disabled={openingPortal}
            onClick={handleManage}
          >
            {openingPortal ? <Loader2 size={14} className="animate-spin mr-1.5" /> : null}
            Manage subscription
          </Button>
        </div>
      )}

      {/* Monthly / Yearly toggle */}
      <div className="flex items-center justify-center mb-6">
        <div className="inline-flex items-center rounded-lg border border-border bg-background p-0.5 gap-0.5">
          <button
            onClick={() => setCadence('monthly')}
            className={cn(
              'px-4 py-1.5 rounded-md text-[13px] font-medium transition-colors',
              cadence === 'monthly'
                ? 'bg-card text-foreground shadow-sm border border-border'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setCadence('yearly')}
            className={cn(
              'px-4 py-1.5 rounded-md text-[13px] font-medium transition-colors flex items-center gap-1.5',
              cadence === 'yearly'
                ? 'bg-card text-foreground shadow-sm border border-border'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            Yearly
            <span className="text-[11px] font-semibold text-success bg-success/10 px-1.5 py-0.5 rounded-full">
              Save 40%
            </span>
          </button>
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <PlanCard
          name="Free"
          monthlyPrice="$0"
          yearlyPrice="$0"
          yearlyMonthly="$0"
          features={FREE_FEATURES}
          isCurrent={plan === 'free'}
          isHighlighted={false}
          cadence={cadence}
          onUpgrade={() => {}}
          upgrading={false}
        />
        <PlanCard
          name="Pro"
          monthlyPrice="$4.99"
          yearlyPrice="$34.99"
          yearlyMonthly="$2.92"
          features={PRO_FEATURES}
          isCurrent={plan === 'pro'}
          isHighlighted={plan !== 'premium'}
          cadence={cadence}
          onUpgrade={() => handleUpgrade('pro')}
          upgrading={upgrading === 'pro'}
          badge="Popular"
        />
        <PlanCard
          name="Premium"
          monthlyPrice="$9.99"
          yearlyPrice="$79.99"
          yearlyMonthly="$6.67"
          features={PREMIUM_FEATURES}
          isCurrent={plan === 'premium'}
          isHighlighted={plan === 'premium'}
          cadence={cadence}
          onUpgrade={() => handleUpgrade('premium')}
          upgrading={upgrading === 'premium'}
        />
      </div>

      {/* Payment method (paid users, from Stripe) */}
      {isPaid && billing?.paymentMethod && (
        <>
          <Separator className="my-8 bg-muted" />
          <div>
            <p className="text-h3 text-foreground mb-4">Payment method</p>
            <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-12 rounded bg-muted flex items-center justify-center">
                  <Lock size={12} className="text-muted-foreground" />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-foreground capitalize">
                    {billing.paymentMethod.brand} ending in {billing.paymentMethod.last4}
                  </p>
                  <p className="text-[12px] text-muted-foreground">
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
